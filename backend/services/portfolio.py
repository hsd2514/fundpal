import sqlite3
from datetime import datetime
from typing import List, Dict, Any
from .market_data import MarketDataService

DB_PATH = "fundpal.db"

class PortfolioService:
    def __init__(self):
        self.market_data = MarketDataService()

    def get_db_connection(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def get_portfolio(self, user_id: str) -> Dict[str, Any]:
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM portfolio WHERE user_id = ?", (user_id,))
        rows = cursor.fetchall()
        
        holdings = []
        total_value = 0.0
        total_invested = 0.0
        
        for row in rows:
            symbol = row["symbol"]
            quantity = row["quantity"]
            avg_price = row["average_buy_price"]
            
            current_price = self.market_data.get_current_price(symbol)
            current_value = quantity * current_price
            invested_value = quantity * avg_price
            
            holdings.append({
                "symbol": symbol,
                "quantity": quantity,
                "average_price": avg_price,
                "current_price": current_price,
                "current_value": round(current_value, 2),
                "invested_value": round(invested_value, 2),
                "pnl": round(current_value - invested_value, 2),
                "pnl_pct": round(((current_value - invested_value) / invested_value * 100), 2) if invested_value > 0 else 0
            })
            
            total_value += current_value
            total_invested += invested_value
            
        conn.close()
        
        return {
            "holdings": holdings,
            "total_value": round(total_value, 2),
            "total_invested": round(total_invested, 2),
            "total_pnl": round(total_value - total_invested, 2)
        }

    def execute_buy(self, user_id: str, symbol: str, quantity: float) -> Dict[str, Any]:
        """
        Execute a buy order:
        1. Check balance
        2. Deduct funds
        3. Add to portfolio
        4. Log transaction
        """
        price = self.market_data.get_current_price(symbol)
        if price <= 0:
            return {"status": "error", "message": "Failed to fetch price"}
            
        total_cost = price * quantity
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            # 1. Check Balance (Mock logic: Calculate from transactions)
            cursor.execute("SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'income'", (user_id,))
            income = cursor.fetchone()[0] or 0
            cursor.execute("SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'expense'", (user_id,))
            expense = cursor.fetchone()[0] or 0
            balance = income - expense
            
            if balance < total_cost:
                return {"status": "error", "message": f"Insufficient balance. Need ₹{total_cost}, have ₹{balance}"}
            
            # 2. Deduct Funds (Log Expense)
            txn_id = f"txn_buy_{int(datetime.now().timestamp())}"
            cursor.execute("""
                INSERT INTO transactions (id, user_id, type, amount, category, description, transaction_date)
                VALUES (?, ?, 'expense', ?, 'Investment', ?, ?)
            """, (txn_id, user_id, total_cost, f"Bought {quantity} {symbol} @ {price}", datetime.now().isoformat()))
            
            # 3. Add to Portfolio
            # Check existing holding
            cursor.execute("SELECT * FROM portfolio WHERE user_id = ? AND symbol = ?", (user_id, symbol))
            existing = cursor.fetchone()
            
            if existing:
                new_quantity = existing["quantity"] + quantity
                # Weighted Average Price
                total_old_cost = existing["quantity"] * existing["average_buy_price"]
                new_avg_price = (total_old_cost + total_cost) / new_quantity
                
                cursor.execute("""
                    UPDATE portfolio 
                    SET quantity = ?, average_buy_price = ?, current_value = ?, last_updated = ?
                    WHERE user_id = ? AND symbol = ?
                """, (new_quantity, new_avg_price, new_quantity * price, datetime.now().isoformat(), user_id, symbol))
            else:
                pf_id = f"pf_{int(datetime.now().timestamp())}_{symbol}"
                cursor.execute("""
                    INSERT INTO portfolio (id, user_id, symbol, quantity, average_buy_price, current_value)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (pf_id, user_id, symbol, quantity, price, total_cost))
            
            conn.commit()
            return {
                "status": "success", 
                "message": f"Bought {quantity} {symbol} for ₹{total_cost}",
                "price": price,
                "total_cost": total_cost
            }
            
        except Exception as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()

    def execute_sell(self, user_id: str, symbol: str, quantity: float) -> Dict[str, Any]:
        """
        Execute a sell order:
        1. Check holdings
        2. Remove from portfolio
        3. Add funds
        4. Log transaction
        """
        price = self.market_data.get_current_price(symbol)
        total_value = price * quantity
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            # 1. Check Holdings
            cursor.execute("SELECT * FROM portfolio WHERE user_id = ? AND symbol = ?", (user_id, symbol))
            existing = cursor.fetchone()
            
            if not existing or existing["quantity"] < quantity:
                return {"status": "error", "message": "Insufficient holdings"}
            
            # 2. Update Portfolio
            new_quantity = existing["quantity"] - quantity
            
            if new_quantity > 0:
                cursor.execute("""
                    UPDATE portfolio 
                    SET quantity = ?, current_value = ?, last_updated = ?
                    WHERE user_id = ? AND symbol = ?
                """, (new_quantity, new_quantity * price, datetime.now().isoformat(), user_id, symbol))
            else:
                cursor.execute("DELETE FROM portfolio WHERE user_id = ? AND symbol = ?", (user_id, symbol))
            
            # 3. Add Funds (Log Income)
            txn_id = f"txn_sell_{int(datetime.now().timestamp())}"
            cursor.execute("""
                INSERT INTO transactions (id, user_id, type, amount, category, description, transaction_date)
                VALUES (?, ?, 'income', ?, 'Investment Return', ?, ?)
            """, (txn_id, user_id, total_value, f"Sold {quantity} {symbol} @ {price}", datetime.now().isoformat()))
            
            conn.commit()
            return {
                "status": "success", 
                "message": f"Sold {quantity} {symbol} for ₹{total_value}",
                "price": price,
                "total_value": total_value
            }
            
        except Exception as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()

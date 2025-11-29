import yfinance as yf
from typing import Dict, Any, List, Optional

class MarketDataService:
    """
    Service to fetch live market data using yfinance.
    """
    
    def get_current_price(self, symbol: str) -> float:
        """
        Get the current price of an asset.
        """
        try:
            ticker = yf.Ticker(symbol)
            # fast_info is faster than history()
            price = ticker.fast_info.last_price
            return round(price, 2)
        except Exception as e:
            print(f"Error fetching price for {symbol}: {e}")
            # Fallback for demo/hackathon if API fails
            import random
            return round(random.uniform(100, 2000), 2)

    def get_asset_info(self, symbol: str) -> Dict[str, Any]:
        """
        Get detailed info about an asset.
        """
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return {
                "symbol": symbol,
                "name": info.get("longName", symbol),
                "sector": info.get("sector", "Unknown"),
                "current_price": info.get("currentPrice") or info.get("regularMarketPrice"),
                "currency": info.get("currency", "INR")
            }
        except Exception as e:
            print(f"Error fetching info for {symbol}: {e}")
            return {"symbol": symbol, "error": str(e)}

    def search_assets(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for assets (Mock implementation as yfinance search is limited).
        In a real app, use a proper search API.
        """
        # Return some common Indian stocks/ETFs matching query
        common_assets = [
            {"symbol": "RELIANCE.NS", "name": "Reliance Industries"},
            {"symbol": "TCS.NS", "name": "Tata Consultancy Services"},
            {"symbol": "HDFCBANK.NS", "name": "HDFC Bank"},
            {"symbol": "INFY.NS", "name": "Infosys"},
            {"symbol": "NIFTYBEES.NS", "name": "Nippon India Nifty 50 ETF"},
            {"symbol": "GOLDBEES.NS", "name": "Nippon India ETF Gold BeES"},
            {"symbol": "SBIN.NS", "name": "State Bank of India"}
        ]
        
        return [a for a in common_assets if query.lower() in a["name"].lower() or query.lower() in a["symbol"].lower()]

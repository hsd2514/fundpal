from fastapi import APIRouter, HTTPException
from database.queries import get_db_connection
from agents.coach import CoachAgent

router = APIRouter()
coach = CoachAgent()

@router.get("/insights")
async def get_insights(user_id: str):
    try:
        conn = get_db_connection()
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        # Fetch recent transactions
        cursor.execute("""
            SELECT * FROM transactions 
            WHERE user_id = ? 
            ORDER BY transaction_date DESC 
            LIMIT 50
        """, (user_id,))
        transactions = cursor.fetchall()
        
        conn.close()
        
        # Calculate Category Breakdown
        category_spend = {}
        total_spend = 0
        for t in transactions:
            if t['type'] == 'expense':
                cat = t.get('category', 'Uncategorized')
                amt = t['amount']
                category_spend[cat] = category_spend.get(cat, 0) + amt
                total_spend += amt
        
        # Generate AI Insight
        insight_text = await coach.generate_insights(transactions)
        
        return {
            "insight": insight_text,
            "total_spend": total_spend,
            "category_breakdown": category_spend,
            "recent_transactions": transactions[:10] # Send top 10 for list
        }
        
    except Exception as e:
        print(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

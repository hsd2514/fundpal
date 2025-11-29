from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from typing import Optional
import json
import os
from dotenv import load_dotenv

load_dotenv()

class ParsedTransaction(BaseModel):
    intent: str  # "log_income", "log_expense", "query", "advice", "goal"
    amount: Optional[float] = None
    category: Optional[str] = None
    transaction_type: Optional[str] = None  # "income" or "expense"
    date: Optional[str] = None
    investment_type: Optional[str] = None # "SIP" or "Lumpsum"
    source: Optional[str] = None
    raw_query: Optional[str] = None
    goal_name: Optional[str] = None
    duration_years: Optional[int] = None
    risk_profile: Optional[str] = None

class ObserverAgent:
    def __init__(self):
        # Ensure GEMINI_API_KEY is set in environment
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", # Using 1.5 Pro as 3 Pro might not be available in this env yet, or fallback
            temperature=0.1
        )
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a financial message parser. Extract structured data from user messages.

CATEGORY MAPPING:
- Food: zomato, swiggy, restaurant, biryani, pizza, chai, groceries, kirana
- Transport: uber, ola, petrol, diesel, metro, bus, auto
- Rent: rent, housing, pg, flat (Expense or Income)
- Utilities: electricity, water, gas, internet, mobile, recharge
- Entertainment: netflix, movie, spotify, games
- Shopping: amazon, flipkart, clothes, shoes
- Health: medicine, doctor, hospital
- Income sources: swiggy, uber, ola, salary, freelance, client, rent received, rental income

AMOUNT PARSING:
- "2k" = 2000
- "5 hundred" = 500
- "1.5k" = 1500

DATE PARSING:
- "yesterday" = yesterday's date
- "today" = today
- "last week" = 7 days ago

Return JSON only.
Structure:
{{
  "intent": "log_income" | "log_expense" | "query" | "advice" | "goal" | "research",
  "amount": float | null,
  "category": string | null,
  "transaction_type": "income" | "expense" | null,
  "date": "ISO 8601 date" | null,
  "investment_type": "SIP" | "Lumpsum" | null,
  "source": string | null,
  "raw_query": string | null (the original message if query/advice),
  "goal_name": string | null (e.g. "Car", "Retirement"),
  "duration_years": int | null (e.g. 5),
  "risk_profile": "Low" | "Moderate" | "High" | null
}}

Examples:
"Invest 5k in SIP for a car in 3 years" -> {{ "intent": "advice", "amount": 5000, "investment_type": "SIP", "goal_name": "Car", "duration_years": 3 }}
"I want to invest for a car" -> {{ "intent": "advice", "goal_name": "Car" }}
"Invest for retirement" -> {{ "intent": "advice", "goal_name": "Retirement" }}
"Buy 10k stocks" -> {{ "intent": "advice", "amount": 10000, "investment_type": "Lumpsum", "risk_profile": "High" }}
"Invest 5000" -> {{ "intent": "advice", "amount": 5000, "investment_type": null }}
"3 years" -> {{ "intent": "advice", "duration_years": 3 }}
"5 years" -> {{ "intent": "advice", "duration_years": 5 }}
"10k" -> {{ "intent": "advice", "amount": 10000 }}
"High risk" -> {{ "intent": "advice", "risk_profile": "High" }}"""),
            ("human", "{message}")
        ])
    
    async def parse(self, message: str) -> ParsedTransaction:
        chain = self.prompt | self.llm
        result = await chain.ainvoke({"message": message})
        try:
            # Clean up potential markdown code blocks
            content = result.content.replace("```json", "").replace("```", "").strip()
            data = json.loads(content)
            return ParsedTransaction(**data)
        except Exception as e:
            print(f"Parsing error: {e}")
            # Fallback
            return ParsedTransaction(intent="query", raw_query=message)

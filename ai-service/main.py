import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from pymongo import MongoClient
import pandas as pd
from analytics import predict_demand, get_market_basket, calculate_dynamic_price
from bson import ObjectId

load_dotenv()

app = FastAPI(title="Smart-Kirana AI Service")

# Mongo Connection
client = MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017/smart-kirana"))
db = client['smart-kirana']

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online"}

@app.get("/forecast/{retailer_id}")
def forecast_demand(retailer_id: str):
    try:
        sales = list(db.salesdatas.find({"retailerId": ObjectId(retailer_id)}))
        if not sales:
            return {"forecast": []}
        df = pd.DataFrame(sales)
        forecast = predict_demand(df)
        return {"forecast": forecast}
    except Exception as e:
        return {"error": str(e)}

@app.get("/recommendations/{retailer_id}")
def recommendations(retailer_id: str):
    try:
        sales = list(db.salesdatas.find({"retailerId": ObjectId(retailer_id)}))
        if not sales:
            return {"rules": []}
        
        # Fetch product names for mapping
        products = list(db.products.find({"retailerId": ObjectId(retailer_id)}))
        id_to_name = {str(p['_id']): p['name'] for p in products}

        df = pd.DataFrame(sales)
        # Replace product IDs with names in the DataFrame before analysis
        df['productId'] = df['productId'].apply(lambda x: id_to_name.get(str(x), str(x)))
        
        rules = get_market_basket(df)
        
        # Convert frozensets to lists for JSON serialization
        for rule in rules:
            rule['antecedents'] = list(rule['antecedents'])
            rule['consequents'] = list(rule['consequents'])
        return {"rules": rules}
    except Exception as e:
        return {"error": str(e)}

@app.get("/price-suggestion/{product_id}")
def suggest_price(product_id: str):
    try:
        product = db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            return {"error": "Product not found"}
        suggested = calculate_dynamic_price(
            product['basePrice'], 
            product['stock'], 
            product.get('minStockThreshold', 10)
        )
        return {"suggested_price": suggested}
    except Exception as e:
        return {"error": str(e)}

import re

@app.post("/parse-voice")
async def parse_voice(data: dict):
    text = data.get("text", "").lower()
    
    # Basic Hinglish Parsing Logic
    res = {"action": "add", "item": "", "quantity": 1, "unit": "unit"}
    
    # Identify Action
    if any(word in text for word in ["delete", "hatao", "remove", "kam karo"]):
        res["action"] = "delete"
    elif any(word in text for word in ["update", "badlo", "change", "set"]):
        res["action"] = "update"
    else:
        res["action"] = "add"
        
    # Extract Quantity and Unit
    # Patterns like "5kg", "5 kg", "10 packets", "10 pkt"
    qty_match = re.search(r'(\d+)\s*(kg|packets|pkt|g|gram|litre|l|kg|pcs|pc)?', text)
    if qty_match:
        res["quantity"] = int(qty_match.group(1))
        if qty_match.group(2):
            res["unit"] = qty_match.group(2)
            
    # Extract Item Name (very basic: between quantity and action verb)
    # This is a bit tricky, let's assume item is after quantity or the main noun
    # Simple heuristic: remove quantity, unit, and action keywords
    clean_text = text
    if qty_match:
        clean_text = clean_text.replace(qty_match.group(0), "")
    
    action_keywords = ["add", "dalo", "jodo", "karo", "delete", "hatao", "remove", "update", "badlo", "change", "set"]
    for word in action_keywords:
        clean_text = clean_text.replace(word, "")
        
    res["item"] = clean_text.strip()
    
    return res

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

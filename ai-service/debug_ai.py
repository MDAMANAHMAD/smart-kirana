import os
import pandas as pd
from pymongo import MongoClient
from bson import ObjectId
from analytics import get_market_basket
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017/smart-kirana"))
db = client['smart-kirana']
retailer_id = "65a1f2e3c9e1a2b3c4d5e6f7"

try:
    sales = list(db.salesdatas.find({"retailerId": ObjectId(retailer_id)}))
    print(f"Found {len(sales)} sales records")
    
    products = list(db.products.find({"retailerId": ObjectId(retailer_id)}))
    id_to_name = {str(p['_id']): p['name'] for p in products}
    print(f"Found {len(products)} products")

    df = pd.DataFrame(sales)
    df['productId'] = df['productId'].apply(lambda x: id_to_name.get(str(x), str(x)))
    
    rules = get_market_basket(df)
    print(f"Generated {len(rules)} rules")
    
    for rule in rules:
        rule['antecedents'] = list(rule['antecedents'])
        rule['consequents'] = list(rule['consequents'])
        print(f"Rule: {rule['antecedents']} -> {rule['consequents']} (Lift: {rule['lift']})")

except Exception as e:
    import traceback
    traceback.print_exc()

import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from mlxtend.frequent_patterns import apriori, association_rules

def predict_demand(sales_df):
    """
    Predict next 7 days demand using ARIMA
    """
    if sales_df.empty:
        return []
    
    # Preprocess
    sales_df['timestamp'] = pd.to_datetime(sales_df['timestamp'])
    daily_sales = sales_df.set_index('timestamp').resample('D')['quantity'].sum().fillna(0)
    
    try:
        model = ARIMA(daily_sales, order=(5,1,0))
        model_fit = model.fit()
        forecast = model_fit.forecast(steps=7)
        return forecast.tolist()
    except:
        return daily_sales.tail(7).tolist() # Fallback

def get_market_basket(sales_df):
    """
    Market Basket Analysis using Apriori
    """
    if sales_df.empty:
        return []

    # Pivot for apriori
    basket = (sales_df.groupby(['transactionId', 'productId'])['quantity']
              .sum().unstack().reset_index().fillna(0)
              .set_index('transactionId'))
    
    # Convert to 1s and 0s
    def encode_units(x):
        return 1 if x >= 1 else 0
    
    basket_sets = basket.map(encode_units)

    # Apply Apriori
    try:
        frequent_itemsets = apriori(basket_sets, min_support=0.03, use_colnames=True)
        if frequent_itemsets.empty:
            return []
            
        rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1)
        if rules.empty:
            return []
        return rules[['antecedents', 'consequents', 'lift']].to_dict(orient='records')
    except Exception as e:
        print(f"Apriori Error: {e}")
        return []

def calculate_dynamic_price(base_price, stock, min_threshold):
    """
    Dynamic pricing logic based on stock levels
    """
    if stock <= min_threshold:
        return base_price * 1.15 # Increase price if low stock
    elif stock > min_threshold * 5:
        return base_price * 0.90 # Discount if overstocked
    return base_price

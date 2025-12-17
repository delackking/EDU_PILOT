"""
Stock Predictor with Profit/Loss Analysis in USD and INR
Interactive version - asks for user input
"""

import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error
import matplotlib.pyplot as plt


def fetch_data(ticker, period='2y', interval='1d'):
    df = yf.download(ticker, period=period, interval=interval, progress=False)
    if df.empty:
        raise RuntimeError(f'No data downloaded for {ticker}')
    return df


def make_features(df, n_lags=5):
    df = df.copy()
    df['close'] = df['Close']
    
    for lag in range(1, n_lags + 1):
        df[f'lag_{lag}'] = df['close'].shift(lag)
    
    df['return_1'] = df['close'].pct_change()
    
    for w in [5, 10, 20]:
        df[f'ma_{w}'] = df['close'].rolling(window=w).mean()
    
    df = df.dropna()
    return df


def prepare_xy(df):
    df = df.copy()
    df['target'] = df['close'].shift(-1)
    df = df.dropna()
    
    feature_cols = []
    for lag in range(1, 6):
        if f'lag_{lag}' in df.columns:
            feature_cols.append(f'lag_{lag}')
    if 'return_1' in df.columns:
        feature_cols.append('return_1')
    for w in [5, 10, 20]:
        if f'ma_{w}' in df.columns:
            feature_cols.append(f'ma_{w}')
    
    X = df[feature_cols].values
    y = df['target'].values
    return X, y, feature_cols


def train_model(X_train, y_train):
    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    return model


def iterative_predict(model, last_values, feature_cols, n_lags=5, predict_days=1):
    preds = []
    closes = list(last_values)
    for day in range(predict_days):
        vec = {}
        for lag in range(1, n_lags+1):
            idx = -lag
            vec[f'lag_{lag}'] = closes[idx]
        if len(closes) >= 2:
            vec['return_1'] = (closes[-1] - closes[-2]) / closes[-2]
        else:
            vec['return_1'] = 0.0
        for w in [5, 10, 20]:
            window_vals = closes[-w:] if len(closes) >= w else closes
            vec[f'ma_{w}'] = sum(window_vals) / len(window_vals)
        x = np.array([vec[col] for col in feature_cols]).reshape(1, -1)
        pred = model.predict(x)[0]
        preds.append(float(pred))
        closes.append(pred)
    return preds


def main():
    print("\n" + "="*70)
    print("STOCK PRICE PREDICTOR WITH PROFIT/LOSS ANALYSIS")
    print("="*70 + "\n")
    
    ticker = input("Enter stock ticker (AAPL, TSLA, MAMATA.NS, SAMHIHOTELS.NS): ").strip().upper()
    if not ticker:
        print("Error: Ticker cannot be empty!")
        return
    
    try:
        period = input("Enter period (default: 2y) [2y/1y/6mo/3mo]: ").strip() or "2y"
        n_lags = int(input("Enter number of lag features (default: 5): ") or "5")
        predict_days = int(input("Enter number of days to predict (default: 3): ") or "3")
    except ValueError:
        print("Error: Invalid input! Using defaults.")
        period = "2y"
        n_lags = 5
        predict_days = 3
    
    usd_to_inr = 90.0
    interval = '1d'

    print(f'\nDownloading {ticker} data ({period}, {interval})...')
    try:
        df = fetch_data(ticker, period=period, interval=interval)
    except Exception as e:
        print(f"Error: Could not download data for {ticker}. {e}")
        return
    
    print('Building features...')
    df_feat = make_features(df, n_lags=n_lags)
    X, y, feature_cols = prepare_xy(df_feat)

    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    print(f'Training samples: {len(X_train)}, test samples: {len(X_test)}')
    model = train_model(X_train, y_train)

    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    print(f'Evaluation: MSE={mse:.6f}, MAE={mae:.6f}')

    max_window = max((5, 10, 20))
    needed = max(max_window, n_lags) + 5
    recent_closes = df_feat['close'].iloc[-needed:].tolist()
    if len(recent_closes) < n_lags + 1:
        raise RuntimeError('Not enough history for prediction.')

    current_price_usd = recent_closes[-1]
    current_price_inr = current_price_usd * usd_to_inr

    preds = iterative_predict(model, recent_closes, feature_cols, n_lags=n_lags, predict_days=predict_days)
    
    print(f'\n{"="*70}')
    print(f'PREDICTIONS FOR {ticker}')
    print(f'{"="*70}')
    print(f'Current Price: ${current_price_usd:.2f} | ₹{current_price_inr:.2f}\n')
    
    for i, p_usd in enumerate(preds, start=1):
        p_inr = p_usd * usd_to_inr
        profit_loss_usd = p_usd - current_price_usd
        profit_loss_inr = p_inr - current_price_inr
        profit_loss_pct = (profit_loss_usd / current_price_usd) * 100
        
        status = " PROFIT" if profit_loss_usd > 0 else " LOSS" if profit_loss_usd < 0 else "NO CHANGE"
        
        print(f'Day +{i}: {status}')
        print(f'  Predicted: ${p_usd:.2f} | ₹{p_inr:.2f}')
        print(f'  P/L: ${profit_loss_usd:+.2f} | ₹{profit_loss_inr:+.2f} ({profit_loss_pct:+.2f}%)')
        print()


if _name_ == '_main_':
    main()

#    print   python stock_predictor\predict_stock_advanced.py   on terminal to run the script
import os
import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression


def train_from_csv(csv_path, save_dir='.'):
    """
    Train a model using a CSV file following the preprocessing steps outlined
    in the notebook 'review1_churn_prediction.ipynb'. Saves scaler.pkl,
    churn_model.pkl and feature_names.pkl to `save_dir`.

    Returns a dict with training metadata on success.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found at {csv_path}")

    df = pd.read_csv(csv_path)

    # Basic cleaning from the notebook
    # Convert TotalCharges to numeric and fill missing
    if 'TotalCharges' in df.columns:
        df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
        df['TotalCharges'].fillna(0, inplace=True)

    # Drop customerID if present
    if 'customerID' in df.columns:
        df = df.drop('customerID', axis=1)

    # Encode target
    if 'Churn' not in df.columns:
        raise ValueError('Expected target column "Churn" in CSV')
    df['Churn'] = df['Churn'].map({'Yes': 1, 'No': 0})

    # Binary columns to label-encode
    binary_cols = [c for c in ['gender', 'Partner', 'Dependents', 'PhoneService', 'PaperlessBilling'] if c in df.columns]
    le = LabelEncoder()
    for col in binary_cols:
        df[col] = le.fit_transform(df[col].astype(str))

    # Multi-category columns to one-hot encode (if present)
    multi_category_cols = [
        'MultipleLines', 'InternetService', 'OnlineSecurity', 'OnlineBackup',
        'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies',
        'Contract', 'PaymentMethod'
    ]
    multi_present = [c for c in multi_category_cols if c in df.columns]
    if multi_present:
        df = pd.get_dummies(df, columns=multi_present, drop_first=True)

    # Split features / target
    X = df.drop('Churn', axis=1)
    y = df['Churn']

    # Scale numerical columns
    numerical_cols = [c for c in ['tenure', 'MonthlyCharges', 'TotalCharges'] if c in X.columns]
    scaler = StandardScaler()
    if numerical_cols:
        X[numerical_cols] = scaler.fit_transform(X[numerical_cols])

    # Train a simple logistic regression on the processed data
    clf = LogisticRegression(max_iter=1000)
    clf.fit(X, y)

    # Persist artifacts
    os.makedirs(save_dir, exist_ok=True)
    with open(os.path.join(save_dir, 'scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)
    with open(os.path.join(save_dir, 'churn_model.pkl'), 'wb') as f:
        pickle.dump(clf, f)
    feature_names = list(X.columns)
    with open(os.path.join(save_dir, 'feature_names.pkl'), 'wb') as f:
        pickle.dump(feature_names, f)

    return {
        'n_samples': int(len(X)),
        'n_features': int(len(feature_names)),
        'feature_names': feature_names,
        'model_type': 'LogisticRegression'
    }


if __name__ == '__main__':
    # Simple CLI for manual invocation
    import argparse
    parser = argparse.ArgumentParser(description='Train churn model from CSV')
    parser.add_argument('csv_path', help='Path to Telco churn CSV file')
    parser.add_argument('--out', default='.', help='Output directory to save pickles')
    args = parser.parse_args()
    meta = train_from_csv(args.csv_path, save_dir=args.out)
    print('Training complete:', meta)

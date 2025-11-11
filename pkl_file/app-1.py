from flask import Flask, request, jsonify, render_template, send_from_directory
import pickle
import numpy as np
import sys # For error logging
import os

# Import the training helper (keeps notebook training code separate)
from train_from_notebook import train_from_csv

app = Flask(__name__)

# --- Global variables for loaded models ---
# Initialize to None, they will be loaded on startup
scaler_model = None
churn_prediction_model = None

# --- Function to load models ---
def load_models():
    global scaler_model, churn_prediction_model
    try:
        # Load the StandardScaler (or placeholder model used as scaler in dummy script)
        with open('scaler.pkl', 'rb') as f:
            scaler_model = pickle.load(f)
        print("scaler.pkl loaded successfully.")

        # Load the Churn Prediction Model
        with open('churn_model.pkl', 'rb') as f:
            churn_prediction_model = pickle.load(f)
        print("churn_model.pkl loaded successfully.")

    except FileNotFoundError as e:
        print(f"CRITICAL ERROR: A required model file was not found: {e}. Please ensure 'scaler.pkl' and 'churn_model.pkl' are in the same directory as 'app.py'.", file=sys.stderr)
        sys.exit(1) # Exit if critical models are not found
    except Exception as e:
        print(f"CRITICAL ERROR: An unexpected error occurred while loading models: {e}", file=sys.stderr)
        sys.exit(1) # Exit on any other critical loading error

# Load models when the application starts
# This block runs once when app.py is executed
with app.app_context():
    load_models()

# --- API Endpoints ---

@app.route('/')
def home():
    """
    Renders the main interface page for churn prediction.
    Assumes 'index.html' exists in a 'templates' subfolder.
    """
    return render_template('index.html')

@app.route('/predict_churn', methods=['POST'])
def predict_churn():
    """
    API endpoint to predict churn using the loaded scaler and churn model.
    Expects JSON input with 'features' key containing a list of numbers.
    The number of features must match what the model was trained on.
    """
    # Check if models were loaded successfully at startup
    if scaler_model is None or churn_prediction_model is None:
        return jsonify({'error': 'Models are not loaded. Server startup failed or models are missing.'}), 500

    try:
        data = request.get_json()
        if not data or 'features' not in data:
            return jsonify({'error': 'Invalid input: JSON with "features" key (list of numbers) expected.'}), 400

        input_features = np.array(data['features'])

        # Determine expected number of features from the loaded model or saved feature names
        expected_features_count = None
        feature_names_file = 'feature_names.pkl'
        if os.path.exists(feature_names_file):
            try:
                with open(feature_names_file, 'rb') as ff:
                    feature_names = pickle.load(ff)
                expected_features_count = len(feature_names)
            except Exception:
                expected_features_count = None

        if expected_features_count is not None and input_features.shape[0] != expected_features_count:
            return jsonify({
                'error': f'Invalid number of features. Expected {expected_features_count} but received {input_features.shape[0]}.',
                'received_features': input_features.tolist()
            }), 400

        # Reshape for single prediction (1 sample, N features)
        reshaped_features = input_features.reshape(1, -1)

        # Step 1: Scale the features using the loaded scaler
        scaled_features = scaler_model.transform(reshaped_features)

        # Step 2: Make prediction with the churn model
        prediction = churn_prediction_model.predict(scaled_features).tolist()
        probability = churn_prediction_model.predict_proba(scaled_features).tolist() if hasattr(churn_prediction_model, 'predict_proba') else None

        # Return results
        return jsonify({
            'input_features': input_features.tolist(),
            'scaled_features_for_model': scaled_features.tolist(), # Can be useful for debugging
            'churn_prediction': prediction[0], # Assuming single prediction, take first element
            'churn_probability': probability[0] if probability else None # Assuming binary classification, first sample
        })

    except ValueError as ve:
        # Catch errors if input_features cannot be converted to numpy array or reshaped
        print(f"ValueError during prediction: {ve}", file=sys.stderr)
        return jsonify({'error': f'Data conversion error: {str(ve)}. Ensure all features are numeric.'}), 400
    except Exception as e:
        # Catch any other unexpected errors during prediction
        print(f"An unexpected error occurred during prediction: {e}", file=sys.stderr)
        return jsonify({'error': f'An internal server error occurred during prediction: {str(e)}. Check server logs for details.'}), 500


@app.route('/retrain', methods=['POST'])
def retrain():
    """Retrain the scaler and churn model from a CSV file.

    Accepts JSON: { "csv_path": "optional/path/to/file.csv" }
    If no path is provided, tries to use './WA_Fn-UseC_-Telco-Customer-Churn.csv' or
    './uploaded_dataset.csv' in the app directory.
    """
    data = request.get_json() or {}
    csv_path = data.get('csv_path')

    # default locations to try
    candidates = []
    if csv_path:
        candidates.append(csv_path)
    candidates.extend([
        os.path.join(os.getcwd(), 'WA_Fn-UseC_-Telco-Customer-Churn.csv'),
        os.path.join(os.getcwd(), 'uploaded_dataset.csv')
    ])

    chosen = None
    for c in candidates:
        if c and os.path.exists(c):
            chosen = c
            break

    if chosen is None:
        return jsonify({'error': 'No CSV provided and no default dataset found. Upload a dataset via /upload_dataset or POST {"csv_path": "/path/to/file.csv"} to /retrain.'}), 400

    try:
        meta = train_from_csv(chosen, save_dir=os.getcwd())
        # Reload models into memory
        load_models()
        return jsonify({'status': 'success', 'training_meta': meta})
    except Exception as e:
        print(f"Retrain error: {e}", file=sys.stderr)
        return jsonify({'error': str(e)}), 500


@app.route('/upload_dataset', methods=['POST'])
def upload_dataset():
    """Accept a CSV file upload under form field 'file', save it as 'uploaded_dataset.csv' and train on it."""
    if 'file' not in request.files:
        return jsonify({'error': "No file part. Submit form-data with a 'file' field."}), 400
    f = request.files['file']
    if f.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    save_path = os.path.join(os.getcwd(), 'uploaded_dataset.csv')
    f.save(save_path)
    try:
        meta = train_from_csv(save_path, save_dir=os.getcwd())
        load_models()
        return jsonify({'status': 'success', 'training_meta': meta})
    except Exception as e:
        print(f"Upload/train error: {e}", file=sys.stderr)
        return jsonify({'error': str(e)}), 500


@app.route('/model_info', methods=['GET'])
def model_info():
    info = {'models_loaded': scaler_model is not None and churn_prediction_model is not None}
    fn = 'feature_names.pkl'
    if os.path.exists(fn):
        try:
            with open(fn, 'rb') as f:
                feature_names = pickle.load(f)
            info['n_features'] = len(feature_names)
            info['feature_names'] = feature_names
        except Exception:
            info['feature_names_error'] = 'failed to load feature_names.pkl'
    else:
        info['n_features'] = None
    return jsonify(info)

if __name__ == '__main__':
    # Run the Flask development server
    # debug=True allows automatic reloading on code changes and provides a debugger
    app.run(debug=True)

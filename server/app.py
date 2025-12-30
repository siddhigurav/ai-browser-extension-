from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

# Use absolute imports instead of relative imports
from routers.auth import auth_bp
from routers.llm import llm_bp
from routers.rag import rag_bp
from routers.ocr import ocr_bp
from routers.pdf import pdf_bp
from routers.youtube import youtube_bp
from routers.speech import speech_bp
from routers.translate import translate_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}) # Allow all origins for now, refine later

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(llm_bp, url_prefix='/api/llm')
app.register_blueprint(rag_bp, url_prefix='/api/rag')
app.register_blueprint(ocr_bp, url_prefix='/api/ocr')
app.register_blueprint(pdf_bp, url_prefix='/api/pdf')
app.register_blueprint(youtube_bp, url_prefix='/api/youtube')
app.register_blueprint(speech_bp, url_prefix='/api/speech')
app.register_blueprint(translate_bp, url_prefix='/api/translate')

# Hugging Face Integration
# Get Hugging Face token from environment variable or config
import os
HF_TOKEN = os.environ.get('HF_TOKEN') or 'YOUR_ACTUAL_HUGGINGFACE_TOKEN_HERE'  # https://huggingface.co/settings/tokens

MODEL_MAP = {
    "summarize": "facebook/bart-large-cnn",
    "chat": "google/flan-t5-base",
    "explain_code": "google/flan-t5-base",
    "extract_points": "facebook/bart-large-cnn",
    "improve_text": "google/flan-t5-base"
}

@app.route("/process", methods=["POST"])
def process():
    data = request.json
    text = data.get("text", "") if data else ""
    task = data.get("task", "chat") if data else "chat"

    model = MODEL_MAP.get(task, "google/flan-t5-base")

    prompts = {
        "summarize": f"Summarize this clearly and briefly:\n{text}",
        "chat": f"You are a helpful assistant. Reply conversationally to:\n{text}",
        "explain_code": f"Explain what this code does in simple English:\n{text}",
        "extract_points": f"Extract 3–5 key bullet points from this text:\n{text}",
        "improve_text": f"Rewrite this text with better grammar and clarity:\n{text}"
    }

    prompt = prompts.get(task, text)

    try:
        # Validate token before making request
        if not HF_TOKEN or HF_TOKEN == 'YOUR_ACTUAL_HUGGINGFACE_TOKEN_HERE':
            return jsonify({
                "output": "Error: Hugging Face token not configured. Please set HF_TOKEN environment variable or update app.py"
            }), 500
        
        response = requests.post(
            f"https://router.huggingface.co/models/{model}",
            headers={"Authorization": f"Bearer {HF_TOKEN}"},
            json={"inputs": prompt}
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            error_msg = f"Error: Hugging Face API returned status {response.status_code}. Response: {response.text}"
            print(error_msg)  # Log for debugging
            return jsonify({
                "output": error_msg
            }), 500
        
        result = response.json()
        output = result[0]["generated_text"] if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0] else str(result)
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        # Log the error for debugging
        print(f"Error processing request: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"output": error_msg}), 500

    return jsonify({"output": output})

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'AI Assistant Server is running!', 'status': 'ok'}), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running!'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
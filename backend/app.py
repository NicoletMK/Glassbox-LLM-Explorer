from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import logging
import warnings
from typing import Dict, Any

# Suppress specific warnings
warnings.filterwarnings("ignore", message="`resume_download` is deprecated")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model configuration
MODEL_NAME = "gpt2"  # Change to "gpt2-medium" for better quality
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Initialize model and tokenizer at startup
logger.info("Initializing model...")
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.pad_token = tokenizer.eos_token  # Set pad token
    model = AutoModelForCausalLM.from_pretrained(MODEL_NAME).to(DEVICE)
    logger.info(f"Model loaded successfully on {DEVICE}")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    raise

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict() -> Dict[str, Any]:
    """Handle text generation requests with temperature and top_k controls."""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.get_json()
        logger.info(f"Received request: {data}")
        
        # Validate and parse parameters
        prompt = data.get('prompt', '').strip()
        temperature = _clamp(float(data.get('temp', 0.7)), 0.1, 2.0)
        top_k = _clamp(int(data.get('top_k', 50)), 1, 100)
        
        if not prompt:
            return _error_response("Prompt is required", 400)

        logger.info(f"Generating with temp={temperature}, top_k={top_k}")

        # Tokenize input
        inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True).to(DEVICE)

        # Generate text with parameters
        outputs = model.generate(
            inputs.input_ids,
            max_length=150,
            temperature=temperature,
            top_k=top_k,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            num_return_sequences=1
        )

        # Process output
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        generated_text = generated_text[len(prompt):].strip()  # Remove input prompt

        logger.info(f"Successfully generated {len(generated_text)} characters")
        return _success_response({
            "text": generated_text,
            "parameters": {
                "temperature": temperature,
                "top_k": top_k,
                "model": MODEL_NAME,
                "device": DEVICE
            }
        })

    except ValueError as e:
        return _error_response(f"Invalid parameter: {str(e)}", 400)
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        return _error_response(f"Generation failed: {str(e)}", 500)

@app.route('/break', methods=['GET', 'OPTIONS'])
def break_model() -> Dict[str, Any]:
    """Endpoint for testing model breaking functionality."""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        # Simulate a broken model state
        logger.warning("Model break requested")
        return _success_response({
            "text": "Model broken intentionally - this is a test response",
            "parameters": {
                "status": "broken",
                "model": MODEL_NAME
            }
        })
    except Exception as e:
        return _error_response(f"Break failed: {str(e)}", 500)

def _clamp(value: float, min_val: float, max_val: float) -> float:
    """Clamp a value between min and max."""
    return max(min_val, min(value, max_val))

def _build_cors_preflight_response() -> Dict[str, Any]:
    """Build CORS preflight response."""
    response = jsonify({"status": "preflight"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

def _success_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """Build success response with CORS headers."""
    response = jsonify(data)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

def _error_response(message: str, status_code: int) -> Dict[str, Any]:
    """Build error response with CORS headers."""
    response = jsonify({"error": message})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.status_code = status_code
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import base64
import numpy as np
import json
import logging
from config import Config
from utils.ai_service import generate_text_response, analyze_image
from utils.vision_utils import detect_faces, analyze_engagement
from utils.engagement_utils import get_engagement_recommendation
from utils.speech_utils import SpeechHandler

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Sample knowledge base for quick responses
knowledge_base = {
    "math": {
        "algebra": "Algebra is a branch of mathematics dealing with symbols and the rules for manipulating these symbols.",
        "calculus": "Calculus is the mathematical study of continuous change.",
        "geometry": "Geometry is a branch of mathematics that studies the sizes, shapes, positions, and dimensions of things."
    },
    "science": {
        "biology": "Biology is the study of living organisms.",
        "chemistry": "Chemistry is the scientific discipline involved with elements and compounds.",
        "physics": "Physics is the natural science that studies matter, its motion and behavior through space and time."
    }
}

@app.route('/')
def index():
    """Render the main application page."""
    return render_template('index.html')

@app.route('/api/query', methods=['POST'])
def process_query():
    """Process text queries from the user."""
    data = request.json
    query_type = data.get('type', 'text')
    query_content = data.get('content', '')
    
    logger.info(f"Received {query_type} query: {query_content[:50]}...")
    
    if query_type == 'text':
        # Check knowledge base first for quick responses
        kb_response = search_knowledge_base(query_content)
        if kb_response:
            return jsonify({
                "response": kb_response,
                "source": "knowledge_base"
            })
        
        # Use AI for more complex queries
        try:
            response = generate_text_response(query_content)
            return jsonify({
                "response": response,
                "source": "ai"
            })
        except Exception as e:
            logger.error(f"Error generating text response: {str(e)}")
            return jsonify({
                "error": "Failed to generate response",
                "details": str(e)
            }), 500
            
    elif query_type == 'image':
        image_data = data.get('image', '')
        image_query = data.get('imageQuery', '')
        
        try:
            response = analyze_image(image_data, image_query)
            return jsonify({
                "response": response,
                "source": "ai"
            })
        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            return jsonify({
                "error": "Failed to analyze image",
                "details": str(e)
            }), 500
    
    return jsonify({
        "error": "Unsupported query type"
    }), 400

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    """Convert text to speech."""
    data = request.json
    text = data.get('content', '')
    
    if not text:
        return jsonify({
            "error": "No text provided"
        }), 400
    
    try:
        # Convert text to speech
        if speech_handler.text_to_speech(text):
            return jsonify({
                "success": True
            })
        else:
            return jsonify({
                "error": "Text-to-speech conversion failed"
            }), 500
    except Exception as e:
        logger.error(f"Error in text-to-speech conversion: {str(e)}")
        return jsonify({
            "error": "Failed to convert text to speech",
            "details": str(e)
        }), 500

@app.route('/api/analyze-engagement', methods=['POST'])
def analyze_student_engagement():
    """Analyze student engagement from webcam feed."""
    data = request.json
    image_data = data.get('image', '')
    
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        
        # Analyze engagement
        engagement_data = analyze_engagement(nparr)
        
        # Add recommendation
        engagement_data['recommendation'] = get_engagement_recommendation(
            engagement_data['engagement_score'],
            engagement_data['attention_score'],
            engagement_data['confusion_level']
        )
        
        return jsonify(engagement_data)
    except Exception as e:
        logger.error(f"Error analyzing engagement: {str(e)}")
        return jsonify({
            "error": "Failed to analyze engagement",
            "details": str(e)
        }), 500

def search_knowledge_base(query):
    """Search the knowledge base for quick responses."""
    query = query.lower()
    
    # More sophisticated keyword matching with partial matches
    matches = []
    for category, topics in knowledge_base.items():
        if category in query:
            for topic, content in topics.items():
                # Calculate relevance score based on keyword presence
                relevance = sum(1 for word in query.split() if word in topic.lower())
                if relevance > 0:
                    matches.append((relevance, content))
    
    # Return the most relevant match if any
    if matches:
        return max(matches, key=lambda x: x[0])[1]
    
    return None

# Initialize speech handler
speech_handler = SpeechHandler()

@app.route('/api/voice-input', methods=['POST'])
def process_voice_input():
    """Process voice input and return both text and spoken response.
    
    Returns:
        JSON response containing:
        - success: boolean indicating if the request was successful
        - text_input: transcribed text from speech input
        - response: AI-generated response
        - source: source of the response (knowledge_base or ai)
        - error: error message if request failed
    """
    # Get optional parameters from request
    data = request.get_json(silent=True) or {}
    timeout = data.get('timeout', 5)  # Default 5 seconds timeout
    phrase_time_limit = data.get('phrase_time_limit', None)
    
    try:
        # Validate timeout parameter
        if not isinstance(timeout, (int, float)) or timeout <= 0:
            raise ValueError("Invalid timeout value")
            
        # Convert speech to text with timeout parameters
        text_input = speech_handler.speech_to_text(
            timeout=timeout,
            phrase_time_limit=phrase_time_limit
        )
        
        if not text_input:
            raise ValueError("No speech input detected")
            
        # Check knowledge base first for quick responses
        kb_response = search_knowledge_base(text_input)
        if kb_response:
            response_data = {
                "response": kb_response,
                "source": "knowledge_base"
            }
        else:
            # Use AI for more complex queries
            try:
                ai_response = generate_text_response(text_input)
                response_data = {
                    "response": ai_response,
                    "source": "ai"
                }
            except Exception as e:
                logger.error(f"Error generating AI response: {str(e)}")
                raise ValueError(f"Failed to generate AI response: {str(e)}")
            
        # Convert response to speech
        if not speech_handler.text_to_speech(response_data['response']):
            logger.warning("Text-to-speech conversion failed")
        
        return jsonify({
            "success": True,
            "text_input": text_input,
            "response": response_data['response'],
            "source": response_data['source']
        })
        
    except ValueError as e:
        logger.error(f"Invalid request parameters: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    except Exception as e:
        logger.error(f"Voice processing error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
import requests
import json
import base64
import logging
from config import Config

logger = logging.getLogger(__name__)

def generate_text_response(query):
    """Generate a text response using the Groq API."""
    headers = {
        "Authorization": f"Bearer {Config.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": Config.DEFAULT_MODEL,
        "messages": [
            {"role": "system", "content": Config.EDUCATION_SYSTEM_PROMPT},
            {"role": "user", "content": query}
        ],
        "temperature": 0.7,
        "max_tokens": 1024
    }
    
    try:
        response = requests.post(
            f"{Config.GROQ_API_BASE}/chat/completions",
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            logger.error(f"API error: {response.status_code} - {response.text}")
            return f"I'm having trouble connecting to my knowledge source. Please try again later. (Error: {response.status_code})"
        
        result = response.json()
        return result['choices'][0]['message']['content']
    
    except Exception as e:
        logger.error(f"Error in generate_text_response: {str(e)}")
        raise

def analyze_image(image_data, query=""):
    """Analyze an image using the Groq API."""
    # For Groq, we'll need to describe the image since it doesn't have direct image processing
    # In a production app, you might use a separate vision API and then feed the results to Groq
    
    headers = {
        "Authorization": f"Bearer {Config.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Create a prompt that describes what we want to do with the image
    prompt = f"I'm looking at an image in an educational context. "
    
    if query:
        prompt += f"The student asked: '{query}' about this image. "
    
    prompt += "Please help me understand what might be in this image and how to explain it in an educational context. "
    prompt += "If it might contain diagrams, charts, equations, or educational content, please provide a detailed explanation that would be helpful for a student."
    
    data = {
        "model": Config.DEFAULT_MODEL,
        "messages": [
            {"role": "system", "content": Config.IMAGE_ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1024
    }
    
    try:
        response = requests.post(
            f"{Config.GROQ_API_BASE}/chat/completions",
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            logger.error(f"API error: {response.status_code} - {response.text}")
            return f"I'm having trouble analyzing this image. Please try again later. (Error: {response.status_code})"
        
        result = response.json()
        return result['choices'][0]['message']['content']
    
    except Exception as e:
        logger.error(f"Error in analyze_image: {str(e)}")
        raise
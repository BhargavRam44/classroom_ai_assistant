import cv2
import numpy as np
import random
import logging

logger = logging.getLogger(__name__)

def detect_faces(image_array):
    """Detect faces in an image using OpenCV."""
    try:
        # Load the pre-trained face detector
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
        
        # Detect faces with optimized parameters
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        if len(faces) == 0:
            # Try with more lenient parameters
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.2,
                minNeighbors=3,
                minSize=(20, 20),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
        
        return faces
    except Exception as e:
        logger.error(f"Error in detect_faces: {str(e)}")
        return []

def analyze_engagement(image_array):
    """
    Analyze student engagement from an image.
    
    In a production system, this would use a trained model for facial expression analysis.
    For this demo, we'll use a simplified approach based on face detection and simulated metrics.
    """
    try:
        # Decode the image if it's not already an array
        if not isinstance(image_array, np.ndarray):
            image_array = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        # Detect faces
        faces = detect_faces(image_array)
        
        # Base engagement on face detection
        face_detected = len(faces) > 0
        
        if face_detected:
            # In a real system, we would analyze facial expressions here
            # For demo purposes, we'll generate somewhat realistic values
            engagement_score = random.uniform(0.6, 0.95)  # Higher when face is detected
            attention_score = random.uniform(0.5, 0.9)
            confusion_level = random.uniform(0.1, 0.4)  # Lower when face is detected
        else:
            # No face detected might indicate disengagement
            engagement_score = random.uniform(0.2, 0.5)
            attention_score = random.uniform(0.1, 0.4)
            confusion_level = random.uniform(0.5, 0.8)
        
        return {
            "face_detected": face_detected,
            "engagement_score": round(engagement_score, 2),
            "attention_score": round(attention_score, 2),
            "confusion_level": round(confusion_level, 2),
            "status": "engaged" if engagement_score > 0.5 else "disengaged"
        }
    
    except Exception as e:
        logger.error(f"Error in analyze_engagement: {str(e)}")
        return {
            "face_detected": False,
            "engagement_score": 0.5,
            "attention_score": 0.5,
            "confusion_level": 0.5,
            "status": "unknown"
        }
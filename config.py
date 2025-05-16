import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or os.urandom(24)
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY must be set in environment variables")
    
    GROQ_API_BASE = "https://api.groq.com/openai/v1"
    
    # AI Model settings
    DEFAULT_MODEL = os.environ.get('GROQ_MODEL', "llama3-70b-8192")
    
    # Application settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size
    
    # Engagement analysis settings
    ENGAGEMENT_CHECK_INTERVAL = 5  # seconds
    
    # System prompts
    EDUCATION_SYSTEM_PROMPT = """
    You are an AI educational assistant designed to help students learn effectively.
    Your responses should be:
    1. Clear and concise, appropriate for the student's level
    2. Accurate and factual
    3. Encouraging and supportive
    4. Structured to promote understanding (with examples when helpful)
    
    When responding to questions, try to guide the student's thinking rather than 
    simply providing answers. Use the Socratic method when appropriate.
    """
    
    IMAGE_ANALYSIS_SYSTEM_PROMPT = """
    You are an AI educational assistant analyzing visual content.
    Provide clear explanations of what you see in the image, focusing on educational aspects.
    If the image contains text, equations, diagrams, or charts, describe and explain them.
    If the student has asked a specific question about the image, focus your analysis on answering that question.
    """
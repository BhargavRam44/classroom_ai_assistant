import speech_recognition as sr
import pyttsx3
import logging

logger = logging.getLogger(__name__)

class SpeechHandler:
    def __init__(self, voice_rate=150, voice_volume=1.0):
        """Initialize speech handler with configurable voice properties"""
        try:
            self.recognizer = sr.Recognizer()
            # Store voice properties for later use
            self.voice_rate = voice_rate
            self.voice_volume = voice_volume
            # Initialize a temporary engine to get voice settings
            temp_engine = pyttsx3.init()
            voices = temp_engine.getProperty('voices')
            self.voice_id = voices[0].id if voices else None
            temp_engine.stop()
            del temp_engine
        except Exception as e:
            logger.error(f"Failed to initialize speech handler: {str(e)}")
            raise Exception("Speech system initialization failed")
        
    def text_to_speech(self, text):
        """Convert text to speech with error handling"""
        if not text or not isinstance(text, str):
            logger.error("Invalid text input for speech conversion")
            return False
            
        engine = None
        try:
            # Create a new engine instance for each request
            engine = pyttsx3.init()
            # Configure voice properties from stored values
            engine.setProperty('rate', self.voice_rate)
            engine.setProperty('volume', self.voice_volume)
            if self.voice_id:
                engine.setProperty('voice', self.voice_id)
            # Add text to speak
            engine.say(text)
            # Run the speech engine
            engine.runAndWait()
            return True
        except Exception as e:
            logger.error(f"Text-to-speech error: {str(e)}")
            return False
        finally:
            if engine:
                try:
                    engine.stop()
                    del engine
                except Exception as e:
                    logger.error(f"Error cleaning up speech engine: {str(e)}")

            
    def speech_to_text(self, timeout=5, phrase_time_limit=None):
        """Convert speech to text with configurable timeouts
        
        Args:
            timeout (int): How long to wait for the user to start speaking
            phrase_time_limit (int): Maximum time in seconds to allow for a single phrase
        
        Returns:
            str: Recognized text from speech
        
        Raises:
            Exception: Various exceptions with descriptive messages for different error cases
        """
        try:
            with sr.Microphone() as source:
                # Adjust for ambient noise with longer duration for better accuracy
                logger.info("Adjusting for ambient noise...")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                
                # Listen for audio input with timeout parameters
                logger.info("Listening for speech input...")
                audio = self.recognizer.listen(
                    source,
                    timeout=timeout,
                    phrase_time_limit=phrase_time_limit
                )
                
                # Convert audio to text using Google's speech recognition
                logger.info("Processing speech to text...")
                text = self.recognizer.recognize_google(audio)
                return text.lower()
                
        except sr.WaitTimeoutError:
            logger.error("Timeout waiting for speech input")
            raise Exception("No speech detected within timeout period")
        except sr.RequestError as e:
            logger.error(f"Speech recognition service error: {str(e)}")
            raise Exception("Speech recognition service unavailable")
        except sr.UnknownValueError:
            logger.error("Speech could not be understood clearly")
            raise Exception("Could not understand speech, please speak more clearly")
        except Exception as e:
            logger.error(f"Speech processing error: {str(e)}")
            raise Exception(f"Speech processing failed: {str(e)}")
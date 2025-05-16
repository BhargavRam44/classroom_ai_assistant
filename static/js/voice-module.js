// Voice input module for the AI Learning Assistant

document.addEventListener('DOMContentLoaded', function() {
    const voiceToggleBtn = document.getElementById('voice-toggle');
    const voiceStatus = document.getElementById('voice-status');
    const voiceTranscript = document.getElementById('voice-transcript');
    const voiceWaves = document.querySelector('.voice-waves');
    
    let recognition;
    let isRecording = false;
    
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        
        // Configure recognition
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        // Recognition events
        recognition.onstart = () => {
            isRecording = true;
            voiceStatus.textContent = 'Listening...';
            voiceToggleBtn.classList.add('recording');
            voiceWaves.classList.add('recording');
            voiceTranscript.textContent = '';
        };
        
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            voiceTranscript.textContent = transcript;
        };
        
        recognition.onend = () => {
            const finalTranscript = voiceTranscript.textContent.trim();
            
            isRecording = false;
            voiceStatus.textContent = 'Click the microphone to start speaking';
            voiceToggleBtn.classList.remove('recording');
            voiceWaves.classList.remove('recording');
            
            if (finalTranscript) {
                submitVoiceQuery(finalTranscript);
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            
            isRecording = false;
            voiceStatus.textContent = `Error: ${event.error}. Try again.`;
            voiceToggleBtn.classList.remove('recording');
            voiceWaves.classList.remove('recording');
        };
    } else {
        voiceStatus.textContent = 'Speech recognition is not supported in your browser.';
        voiceToggleBtn.disabled = true;
    }
    
    // Toggle recording when button is clicked
    voiceToggleBtn.addEventListener('click', () => {
        if (!recognition) return;
        
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
    
    // Function to submit voice query
    function submitVoiceQuery(transcript) {
        // Display user message
        window.displayUserMessage(transcript);
        
        // Show loading indicator
        window.displayLoadingMessage();
        
        // Send query to backend (reuse the text query endpoint)
        fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'text',
                content: transcript
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Remove loading indicator
            window.removeLoadingMessage();
            
            // Display assistant response
            window.displayAssistantMessage(data.response);
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Remove loading indicator
            window.removeLoadingMessage();
            
            // Display error message
            window.displayAssistantMessage(
                "I'm sorry, I encountered an error while processing your request. Please try again."
            );
        });
    }
});
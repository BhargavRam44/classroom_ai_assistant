// Text input module for the AI Learning Assistant

document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('text-input');
    const textSubmitBtn = document.getElementById('text-submit');
    
    // Submit text query when button is clicked
    textSubmitBtn.addEventListener('click', () => {
        submitTextQuery();
    });
    
    // Submit text query when Enter key is pressed (without Shift)
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitTextQuery();
        }
    });
    
    // Function to submit text query
    function submitTextQuery() {
        const query = textInput.value.trim();
        
        if (!query) return;
        
        // Display user message
        window.displayUserMessage(query);
        
        // Show loading indicator
        window.displayLoadingMessage();
        
        // Send query to backend
        fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'text',
                content: query
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
            
            // Display assistant response with read out button
            window.displayAssistantMessage(data.response, data.speech_enabled);
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
        
        // Clear input field
        textInput.value = '';
    }
});
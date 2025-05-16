// Main JavaScript file for the AI Learning Assistant

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabName = button.getAttribute('data-tab');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Suggestion chips functionality
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const textInput = document.getElementById('text-input');
            textInput.value = chip.textContent;
            textInput.focus();
        });
    });
    
    // Clear conversation button
    const clearConversationBtn = document.getElementById('clear-conversation');
    
    clearConversationBtn.addEventListener('click', () => {
        const conversationContainer = document.getElementById('conversation-container');
        
        // Keep only the welcome message
        conversationContainer.innerHTML = `
            <div class="message assistant">
                <div class="message-content">
                    <p>Hello! I'm your AI learning assistant. How can I help you with your studies today?</p>
                </div>
            </div>
        `;
    });
    
    // Helper functions for displaying messages
    window.displayUserMessage = function(content, type = 'text') {
        const conversationContainer = document.getElementById('conversation-container');
        
        let messageHTML = `
            <div class="message user">
                <div class="message-content">
                    <p>${escapeHTML(content)}</p>
                </div>
            </div>
        `;
        
        // If it's an image message, add the image
        if (type === 'image' && window.capturedImage) {
            messageHTML = `
                <div class="message user">
                    <div class="message-content">
                        <p>${escapeHTML(content)}</p>
                        <img src="${window.capturedImage}" alt="User uploaded image">
                    </div>
                </div>
            `;
        }
        
        conversationContainer.innerHTML += messageHTML;
        scrollToBottom(conversationContainer);
    };
    
    window.displayAssistantMessage = function(content) {
        const conversationContainer = document.getElementById('conversation-container');
        
        // Convert URLs to links and handle markdown-style formatting
        content = formatMessage(content);
        
        const messageHTML = `
            <div class="message assistant">
                <div class="message-content">
                    <p>${content}</p>
                    <button class="speak-btn" title="Read aloud"><i class="fas fa-volume-up"></i></button>
                </div>
            </div>
        `;

        conversationContainer.innerHTML += messageHTML;

        // Add click event listener to the speak button
        const lastMessage = conversationContainer.lastElementChild;
        const speakButton = lastMessage.querySelector('.speak-btn');
        speakButton.addEventListener('click', () => {
            // Call the text-to-speech endpoint
            fetch('/api/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: content.replace(/<[^>]*>/g, '') // Remove HTML tags
                })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    console.error('Text-to-speech failed:', data.error);
                }
            })
            .catch(error => {
                console.error('Error triggering text-to-speech:', error);
            });
        });

        scrollToBottom(conversationContainer);
    };
        
    window.displayLoadingMessage = function() {
        const conversationContainer = document.getElementById('conversation-container');
        
        const loadingHTML = `
            <div class="message assistant" id="loading-message">
                <div class="message-content">
                    <p>Thinking<span class="loading-dots">...</span></p>
                </div>
            </div>
        `;
        
        conversationContainer.innerHTML += loadingHTML;
        scrollToBottom(conversationContainer);
        
        // Animate the loading dots
        const loadingDots = document.querySelector('.loading-dots');
        let dotCount = 3;
        
        window.loadingInterval = setInterval(() => {
            dotCount = (dotCount % 3) + 1;
            loadingDots.textContent = '.'.repeat(dotCount);
        }, 500);
    };
    
    window.removeLoadingMessage = function() {
        clearInterval(window.loadingInterval);
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    };
    
    // Helper function to scroll to the bottom of the conversation
    function scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }
    
    // Helper function to escape HTML
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Helper function to format messages (convert URLs to links, etc.)
    function formatMessage(text) {
        // Convert URLs to links
        text = text.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Convert markdown-style bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert markdown-style italic
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert markdown-style code
        text = text.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Convert line breaks to <br>
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
});
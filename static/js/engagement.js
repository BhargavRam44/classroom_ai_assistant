// Engagement monitoring module for the AI Learning Assistant

document.addEventListener('DOMContentLoaded', function() {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const engagementBar = document.getElementById('engagement-bar');
    const attentionBar = document.getElementById('attention-bar');
    const confusionBar = document.getElementById('confusion-bar');
    const engagementValue = document.getElementById('engagement-value');
    const attentionValue = document.getElementById('attention-value');
    const confusionValue = document.getElementById('confusion-value');
    const recommendationText = document.getElementById('recommendation-text');
    
    let engagementInterval;
    let isMonitoring = false;
    
    // Start engagement monitoring
    window.startEngagementMonitoring = function() {
        if (isMonitoring) return;
        
        isMonitoring = true;
        statusIndicator.classList.add('active');
        statusText.textContent = 'Monitoring';
        
        // Start periodic engagement checks
        engagementInterval = setInterval(checkEngagement, 5000); // Check every 5 seconds
        
        // Do an initial check
        checkEngagement();
    };
    
    // Stop engagement monitoring
    window.stopEngagementMonitoring = function() {
        if (!isMonitoring) return;
        
        isMonitoring = false;
        statusIndicator.classList.remove('active');
        statusText.textContent = 'Not monitoring';
        
        clearInterval(engagementInterval);
    };
    
    // Function to check engagement
    function checkEngagement() {
        // Get current frame from camera
        const cameraFeed = document.getElementById('camera-feed');
        const cameraCanvas = document.getElementById('camera-canvas');
        
        if (!cameraFeed.srcObject) return;
        
        const context = cameraCanvas.getContext('2d');
        
        // Set canvas dimensions to match video
        cameraCanvas.width = cameraFeed.videoWidth;
        cameraCanvas.height = cameraFeed.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(cameraFeed, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        // Get image data
        const imageData = cameraCanvas.toDataURL('image/png');
        
        // Send to backend for analysis
        fetch('/api/analyze-engagement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageData
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateEngagementUI(data);
        })
        .catch(error => {
            console.error('Error checking engagement:', error);
        });
    }
    
    // Function to update engagement UI
    function updateEngagementUI(data) {
        // Update progress bars
        engagementBar.style.width = `${data.engagement_score * 100}%`;
        attentionBar.style.width = `${data.attention_score * 100}%`;
        confusionBar.style.width = `${data.confusion_level * 100}%`;
        
        // Update values
        engagementValue.textContent = `${Math.round(data.engagement_score * 100)}%`;
        attentionValue.textContent = `${Math.round(data.attention_score * 100)}%`;
        confusionValue.textContent = `${Math.round(data.confusion_level * 100)}%`;
        
        // Update recommendation
        recommendationText.textContent = data.recommendation;
        
        // Update colors based on values
        if (data.engagement_score < 0.4) {
            engagementBar.style.backgroundColor = 'var(--error-color)';
        } else if (data.engagement_score < 0.7) {
            engagementBar.style.backgroundColor = 'var(--warning-color)';
        } else {
            engagementBar.style.backgroundColor = 'var(--success-color)';
        }
        
        if (data.attention_score < 0.4) {
            attentionBar.style.backgroundColor = 'var(--error-color)';
        } else if (data.attention_score < 0.7) {
            attentionBar.style.backgroundColor = 'var(--warning-color)';
        } else {
            attentionBar.style.backgroundColor = 'var(--secondary-color)';
        }
        
        // For confusion, higher is worse
        if (data.confusion_level > 0.6) {
            confusionBar.style.backgroundColor = 'var(--error-color)';
        } else if (data.confusion_level > 0.3) {
            confusionBar.style.backgroundColor = 'var(--warning-color)';
        } else {
            confusionBar.style.backgroundColor = 'var(--success-color)';
        }
    }
});
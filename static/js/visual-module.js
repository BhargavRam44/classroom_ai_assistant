// Visual input module for the AI Learning Assistant

document.addEventListener('DOMContentLoaded', function() {
    const cameraToggleBtn = document.getElementById('camera-toggle');
    const captureImageBtn = document.getElementById('capture-image');
    const uploadImageBtn = document.getElementById('upload-image');
    const imageUploadInput = document.getElementById('image-upload');
    const visualQueryInput = document.getElementById('visual-query-input');
    const visualSubmitBtn = document.getElementById('visual-submit');
    const cameraFeed = document.getElementById('camera-feed');
    const cameraCanvas = document.getElementById('camera-canvas');
    const imagePreview = document.getElementById('image-preview');
    
    let stream;
    window.capturedImage = null;
    let cameraActive = false;
    
    // Toggle camera when button is clicked
    cameraToggleBtn.addEventListener('click', () => {
        if (cameraActive) {
            stopCamera();
        } else {
            startCamera();
        }
    });
    
    // Capture image when button is clicked
    captureImageBtn.addEventListener('click', () => {
        captureImage();
    });
    
    // Open file dialog when upload button is clicked
    uploadImageBtn.addEventListener('click', () => {
        imageUploadInput.click();
    });
    
    // Handle file selection
    imageUploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                window.capturedImage = event.target.result;
                displayImagePreview(window.capturedImage);
                visualSubmitBtn.disabled = false;
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Submit visual query when button is clicked
    visualSubmitBtn.addEventListener('click', () => {
        submitVisualQuery();
    });
    
    // Submit visual query when Enter key is pressed
    visualQueryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitVisualQuery();
        }
    });
    
    // Function to start camera
    function startCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(videoStream => {
                    stream = videoStream;
                    cameraFeed.srcObject = stream;
                    cameraActive = true;
                    cameraToggleBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Camera';
                    captureImageBtn.disabled = false;
                    
                    // Hide image preview if visible
                    imagePreview.style.display = 'none';
                    
                    // Start engagement monitoring
                    window.startEngagementMonitoring();
                })
                .catch(error => {
                    console.error('Error accessing camera:', error);
                    alert('Could not access the camera. Please check your permissions.');
                });
        } else {
            alert('Your browser does not support camera access.');
        }
    }
    
    // Function to stop camera
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            cameraFeed.srcObject = null;
            cameraActive = false;
            cameraToggleBtn.innerHTML = '<i class="fas fa-camera"></i> Start Camera';
            captureImageBtn.disabled = true;
            
            // Stop engagement monitoring
            window.stopEngagementMonitoring();
        }
    }
    
    // Function to capture image
    function captureImage() {
        if (!cameraActive) return;
        
        const context = cameraCanvas.getContext('2d');
        
        // Set canvas dimensions to match video
        cameraCanvas.width = cameraFeed.videoWidth;
        cameraCanvas.height = cameraFeed.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(cameraFeed, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        // Get image data
        window.capturedImage = cameraCanvas.toDataURL('image/png');
        
        // Display image preview
        displayImagePreview(window.capturedImage);
        
        // Enable submit button
        visualSubmitBtn.disabled = false;
    }
    
    // Function to display image preview
    function displayImagePreview(imageUrl) {
        imagePreview.innerHTML = `<img src="${imageUrl}" alt="Captured image">`;
        imagePreview.style.display = 'block';
    }
    
    // Function to submit visual query
    function submitVisualQuery() {
        if (!window.capturedImage) {
            alert('Please capture or upload an image first.');
            return;
        }
        
        const query = visualQueryInput.value.trim();
        
        if (!query) {
            alert('Please enter a question about the image.');
            return;
        }
        
        // Display user message
        window.displayUserMessage(query, 'image');
        
        // Show loading indicator
        window.displayLoadingMessage();
        
        // Send query to backend
        fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'image',
                image: window.capturedImage,
                imageQuery: query
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
                "I'm sorry, I encountered an error while processing your image. Please try again."
            );
        });
        
        // Clear input field
        visualQueryInput.value = '';
    }
});
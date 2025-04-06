document.addEventListener('DOMContentLoaded', function() {
  // Initialize max length dropdown
  const maxLengthSelect = document.getElementById('max-length');
  for (let i = 30; i <= 500; i += 10) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      maxLengthSelect.appendChild(option);
  }

  // Set default server URL if empty
  const serverUrlInput = document.getElementById('server-url');
  if (!serverUrlInput.value) {
      serverUrlInput.value = 'http://localhost:8000';
  }

  // Analyze button handler
  const analyzeBtn = document.getElementById('analyze-btn');
  analyzeBtn.addEventListener('click', async function() {
      const serverUrl = serverUrlInput.value;
      const language = document.getElementById('language').value;
      const maxLength = document.getElementById('max-length').value;
      const code = document.getElementById('code-input').value;
      const resultContainer = document.getElementById('result-container');
      const resultElement = document.getElementById('result');

      // Validate inputs
      if (!serverUrl || !code) {
          alert('Please provide both the server URL and your code.');
          return;
      }

      // Set loading state
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = 'Analyzing...';
      resultContainer.style.display = 'none';

      try {
          console.log('Sending request to:', serverUrl);
          console.log('Code length:', code.length, 'chars');
          console.log('Selected max tokens:', maxLength);

          // First check server health
          const healthResponse = await fetch(`${serverUrl}/health`, {
              method: 'GET',
              headers: { 'Accept': 'application/json' }
          });

          if (!healthResponse.ok) {
              throw new Error('Server is not healthy');
          }

          const healthData = await healthResponse.json();
          console.log('Server health:', healthData);

          if (!healthData.model_loaded) {
              throw new Error('Model not loaded on server');
          }

          // Send analysis request
          const startTime = performance.now();
          console.log('Sending request to model hosted server:', startTime);

          const response = await fetch(`${serverUrl}/analyze`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
              },
              body: JSON.stringify({ 
                  language, 
                  max_length: Math.min(parseInt(maxLength, 10), 500),
                  code 
              })
          });

          const endTime = performance.now();
          console.log(`Request took ${(endTime - startTime).toFixed(2)}ms`);

          if (!response.ok) {
              const errorData = await response.json();
              console.error('Server error:', errorData);
              throw new Error(errorData.detail || 'Analysis failed');
          }

          const data = await response.json();
          console.log('Analysis successful:', data);
          
          // Display results
          resultElement.textContent = data.analysis;
          resultContainer.style.display = 'block';
          
      } catch (error) {
          console.error('Error:', error);
          resultElement.textContent = `Error: ${error.message}`;
          resultContainer.style.display = 'block';
          
          // Show detailed error for debugging
          if (confirm(`Analysis failed: ${error.message}\n\nShow detailed error in console?`)) {
              console.error('Full error details:', error);
          }
      } finally {
          // Reset button state
          analyzeBtn.disabled = false;
          analyzeBtn.textContent = 'Analyze';
      }
  });

  // Copy button handler
  const copyBtn = document.getElementById('copy-btn');
  copyBtn.addEventListener('click', function() {
      const resultElement = document.getElementById('result');
      navigator.clipboard.writeText(resultElement.textContent)
          .then(() => alert('Result copied to clipboard!'))
          .catch(err => console.error('Copy failed:', err));
  });

  // Toggle instructions handler
  const toggleInstructionsBtn = document.getElementById('toggle-instructions');
  const instructionsContent = document.getElementById('instructions-content');
  instructionsContent.style.display = 'none'; // Start collapsed
  
  toggleInstructionsBtn.addEventListener('click', function() {
      if (instructionsContent.style.display === 'none') {
          instructionsContent.style.display = 'block';
          toggleInstructionsBtn.textContent = 'Hide Instructions';
      } else {
          instructionsContent.style.display = 'none';
          toggleInstructionsBtn.textContent = 'Show Instructions';
      }
  });

  // Populate instructions content
  instructionsContent.innerHTML = `
      <h3>Setup Instructions</h3>
      <ol>
          <li>Ensure Python 3.8+ is installed</li>
          <li>Install required packages:
              <pre>pip install fastapi uvicorn transformers torch</pre>
          </li>
          <li>Download the model and place it in the correct directory</li>
          <li>Run the server:
              <pre>uvicorn server:app --host 0.0.0.0 --port 8000</pre>
          </li>
          <li>Use this interface to analyze your code</li>
      </ol>
      <h4>Troubleshooting</h4>
      <ul>
          <li>Check server logs for errors</li>
          <li>Try smaller code snippets first</li>
          <li>Reduce max tokens if getting memory errors</li>
      </ul>
  `;
});
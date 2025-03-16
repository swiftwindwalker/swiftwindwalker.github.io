document.getElementById('start-test').addEventListener('click', startTest);

let speedChart; // Chart instance for speed graph

async function startTest() {
  const iterations = parseInt(document.getElementById('iterations').value);
  const progressBar = document.getElementById('progress-bar');
  const progress = document.getElementById('progress');
  const resultContainer = document.getElementById('result-container');
  const errorBox = document.getElementById('error-box');
  const shareButtons = document.getElementById('share-buttons');
  const startTestButton = document.getElementById('start-test');
  const detailedResults = document.getElementById('detailed-results');
  const averageDownloadSpeed = document.getElementById('average-download-speed');
  const averageBandwidth = document.getElementById('average-bandwidth');
  const averageLatency = document.getElementById('average-latency');
  const iterationProgress = document.getElementById('iteration-progress');

  showResults(); // Call this function to ensure it is positioned correctly

  // Reset UI
  progressBar.classList.remove('hidden');
  resultContainer.classList.add('hidden');
  errorBox.classList.add('hidden');
  shareButtons.classList.add('hidden');
  errorBox.textContent = "";
  detailedResults.innerHTML = "";
  averageDownloadSpeed.textContent = "Calculating...";
  averageBandwidth.textContent = "Calculating...";
  averageLatency.textContent = "Calculating...";
  iterationProgress.classList.remove('hidden');
  iterationProgress.textContent = "";

  // Array to store results of each iteration
  const results = [];

  // File URL with CORS proxy
  const fileUrl = `https://github.com/swiftwindwalker/speed-test/blob/main/20MB.zip?raw=true`;
  const proxyUrl = `https://corsproxy.io/?url=${fileUrl}`; // Use a CORS proxy

  // Total file size in bytes (20 MB)
  const totalSize = 20971520; // 20 MB in bytes

  try {
    // Fetch IP, DNS, geo-location, browser, and device info with a timeout
    const ipInfo = await Promise.race([
      fetch('https://ipinfo.io/178.239.163.82/json?token=a3a7c63579cb2c').then(response => response.json()),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30000)), // 30-second timeout
    ]).catch(() => {
      return { ip: "Information not available - retry", org: "Information not available - retry", city: "Information not available - retry", region: "Information not available - retry", country: "Information not available - retry", hostname: "Information not available - retry" };
    });

    const browserInfo = getBrowserInfo();
    const deviceInfo = getDeviceInfo();

    // Display IP, DNS, and geo-location info
    const ipDetails = `
      <h3>Network Details</h3>
      <p><strong>IP Address:</strong> ${ipInfo.ip}</p>
      <p><strong>ISP:</strong> ${ipInfo.org}</p>
      <p><strong>Location:</strong> ${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}</p>
      <p><strong>DNS Server:</strong> ${ipInfo.hostname || 'Unknown'}</p>
      <p><strong>Browser:</strong> ${browserInfo.name} ${browserInfo.version}</p>
      <p><strong>Device:</strong> ${deviceInfo.type} (${deviceInfo.os})</p>
    `;
    detailedResults.innerHTML = ipDetails;

    for (let i = 1; i <= iterations; i++) {
      iterationProgress.textContent = `Running iteration ${i} of ${iterations}`;

      const startTime = Date.now();
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedLength += value.length;
        const percentComplete = (receivedLength / totalSize) * 100;
        progress.style.width = `${percentComplete}%`;
      }

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // in seconds

      if (duration === 0) {
        throw new Error("Download completed too quickly. Duration is 0.");
      }

      const speed = (totalSize * 8) / duration / 1024 / 1024; // in Mbps
      const bandwidth = (totalSize / duration / 1024 / 1024).toFixed(2); // in MB/s
      const latency = (duration * 1000).toFixed(2); // in ms

      // Store results
      results.push({ speed, bandwidth, latency });

      // Display detailed results for this iteration
      const iterationResult = document.createElement('div');
      iterationResult.innerHTML = `
        <h3>Iteration ${i}</h3>
        <p><strong>Download Speed:</strong> ${speed.toFixed(2)} Mbps</p>
        <p><strong>Bandwidth:</strong> ${bandwidth} MB/s</p>
        <p><strong>Latency:</strong> ${latency} ms</p>
      `;
      detailedResults.appendChild(iterationResult);
      await delay(5000); // 5000 milliseconds = 5 seconds

    }

    // Calculate averages
    const averageSpeed = (results.reduce((sum, result) => sum + result.speed, 0) / iterations).toFixed(2);
    const averageBandwidthValue = (results.reduce((sum, result) => sum + parseFloat(result.bandwidth), 0) / iterations).toFixed(2);
    const averageLatencyValue = (results.reduce((sum, result) => sum + parseFloat(result.latency), 0) / iterations).toFixed(2);

    // Display averages
    averageDownloadSpeed.textContent = `${averageSpeed} Mbps`;
    averageBandwidth.textContent = `${averageBandwidthValue} MB/s`;
    averageLatency.textContent = `${averageLatencyValue} ms`;

    // Show results and sharing buttons
    resultContainer.classList.remove('hidden');
    shareButtons.classList.remove('hidden');
    startTestButton.textContent = "Re-test Again";
    iterationProgress.classList.add('hidden');

    // Render speed graph
    renderSpeedGraph(results);
  } catch (error) {
    console.error("Error during download test:", error);
    showError(`Error during download test: ${error.message}`);
    startTestButton.textContent = "Re-test Again";
    iterationProgress.classList.add('hidden');
  }
}

// Get browser info
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";

  if (userAgent.includes("Firefox")) {
    browserName = "Firefox";
    browserVersion = userAgent.match(/Firefox\/(\d+)/)[1];
  } else if (userAgent.includes("Edg")) {
    browserName = "Microsoft Edge";
    browserVersion = userAgent.match(/Edg\/(\d+)/)[1];
  } else if (userAgent.includes("Chrome")) {
    browserName = "Chrome";
    browserVersion = userAgent.match(/Chrome\/(\d+)/)[1];
  } else if (userAgent.includes("Safari")) {
    browserName = "Safari";
    browserVersion = userAgent.match(/Version\/(\d+)/)[1];
  }

  return { name: browserName, version: browserVersion };
}

// Get device info
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let deviceType = "Desktop";
  let os = "Unknown";

  if (/Android/.test(userAgent)) {
    deviceType = "Mobile";
    os = "Android";
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    deviceType = "Mobile";
    os = "iOS";
  } else if (/Windows/.test(userAgent)) {
    os = "Windows";
  } else if (/Mac/.test(userAgent)) {
    os = "Mac";
  } else if (/Linux/.test(userAgent)) {
    os = "Linux";
  }

  return { type: deviceType, os };
}

// Render speed graph
function renderSpeedGraph(results) {
  const ctx = document.getElementById('speed-chart').getContext('2d');
  if (speedChart) {
    speedChart.destroy(); // Destroy existing chart if it exists
  }

  speedChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: results.map((_, index) => `Iteration ${index + 1}`),
      datasets: [{
        label: 'Download Speed (Mbps)',
        data: results.map(result => result.speed),
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.2)',
        borderWidth: 2,
      }],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Download Speed (Mbps)',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Iteration',
          },
        },
      },
    },
  });
}

// Show error message
function showError(message) {
  const errorBox = document.getElementById('error-box');
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

// Copy results to clipboard
document.getElementById('copy-to-clipboard').addEventListener('click', () => {
  const resultsText = `Network Details:\n` +
                     `IP Address: ${document.getElementById('ip-address').textContent}\n` +
                     `ISP: ${document.getElementById('isp').textContent}\n` +
                     `Location: ${document.getElementById('location').textContent}\n` +
                     `DNS Server: ${document.getElementById('dns-server').textContent}\n` +
                     `Browser: ${document.getElementById('browser').textContent}\n` +
                     `Device: ${document.getElementById('device').textContent}\n\n` +
                     `Average Download Speed: ${document.getElementById('average-download-speed').textContent}\n` +
                     `Average Bandwidth: ${document.getElementById('average-bandwidth').textContent}\n` +
                     `Average Latency: ${document.getElementById('average-latency').textContent}`;
  navigator.clipboard.writeText(resultsText).then(() => {
    alert("Results copied to clipboard!");
  });
});

// Share on X (Twitter)
document.getElementById('share-twitter').addEventListener('click', () => {
  const text = `Check out my internet speed test results!\n` +
               `Network Details:\n` +
               `IP Address: ${document.getElementById('ip-address').textContent}\n` +
               `ISP: ${document.getElementById('isp').textContent}\n` +
               `Location: ${document.getElementById('location').textContent}\n` +
               `DNS Server: ${document.getElementById('dns-server').textContent}\n` +
               `Browser: ${document.getElementById('browser').textContent}\n` +
               `Device: ${document.getElementById('device').textContent}\n\n` +
               `Average Download Speed: ${document.getElementById('average-download-speed').textContent}\n` +
               `Average Bandwidth: ${document.getElementById('average-bandwidth').textContent}\n` +
               `Average Latency: ${document.getElementById('average-latency').textContent}`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
});

// Share on WhatsApp
document.getElementById('share-whatsapp').addEventListener('click', () => {
  const text = `Check out my internet speed test results!\n` +
               `Network Details:\n` +
               `IP Address: ${document.getElementById('ip-address').textContent}\n` +
               `ISP: ${document.getElementById('isp').textContent}\n` +
               `Location: ${document.getElementById('location').textContent}\n` +
               `DNS Server: ${document.getElementById('dns-server').textContent}\n` +
               `Browser: ${document.getElementById('browser').textContent}\n` +
               `Device: ${document.getElementById('device').textContent}\n\n` +
               `Average Download Speed: ${document.getElementById('average-download-speed').textContent}\n` +
               `Average Bandwidth: ${document.getElementById('average-bandwidth').textContent}\n` +
               `Average Latency: ${document.getElementById('average-latency').textContent}`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
});

// Share on Reddit
document.getElementById('share-reddit').addEventListener('click', () => {
  const text = `Check out my internet speed test results!\n` +
               `Network Details:\n` +
               `IP Address: ${document.getElementById('ip-address').textContent}\n` +
               `ISP: ${document.getElementById('isp').textContent}\n` +
               `Location: ${document.getElementById('location').textContent}\n` +
               `DNS Server: ${document.getElementById('dns-server').textContent}\n` +
               `Browser: ${document.getElementById('browser').textContent}\n` +
               `Device: ${document.getElementById('device').textContent}\n\n` +
               `Average Download Speed: ${document.getElementById('average-download-speed').textContent}\n` +
               `Average Bandwidth: ${document.getElementById('average-bandwidth').textContent}\n` +
               `Average Latency: ${document.getElementById('average-latency').textContent}`;
  const url = `https://www.reddit.com/submit?title=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
});


const resultContainer = document.getElementById('result-container');
function showResults() {
  resultContainer.classList.add('visible');
  resultContainer.style.display = "block";
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


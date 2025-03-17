document.getElementById('start-test').addEventListener('click', startTest);

let speedChart; // Chart instance for speed graph
const useProxy = false; // Set this flag to true if using a proxy

async function startTest() {
  const iterations = parseInt(document.getElementById('iterations').value);
  const progressBar = document.getElementById('progress-bar');
  const progress = document.getElementById('progress');
  const resultContainer = document.getElementById('result-container');
  const errorBox = document.getElementById('error-box');
  const startTestButton = document.getElementById('start-test');
  const detailedResults = document.getElementById('detailed-results');
  const averageDownloadSpeed = document.getElementById('average-download-speed');
  const averageBandwidth = document.getElementById('average-bandwidth');
  const averageLatency = document.getElementById('average-latency');
  const iterationProgress = document.getElementById('iteration-progress');
  const copyToClipboardButton = document.getElementById('copy-to-clipboard'); // Ensure this exists

  // Check if iterations exceed the limit
  if (iterations > 10) {
    showError("Error: Iterations cannot exceed 10. Please enter a value less than or equal to 10.");
    return; // Stop execution if iterations are invalid
  }

  showResults(); // Call this function to ensure it is positioned correctly

  // Reset UI
  progressBar.classList.remove('hidden');
  resultContainer.classList.add('hidden');
  errorBox.classList.add('hidden');
  errorBox.textContent = "";
  detailedResults.innerHTML = "";
  averageDownloadSpeed.textContent = "Calculating...";
  averageBandwidth.textContent = "Calculating...";
  averageLatency.textContent = "Calculating...";
  iterationProgress.classList.remove('hidden');
  iterationProgress.textContent = "";

  // Ensure the copy-to-clipboard button is hidden initially
  //copyToClipboardButton.classList.add('hidden');

  // Array to store results of each iteration
  const results = [];

  // File URL with or without CORS proxy

  let fileUrl;

  if (isMobileDevice()) {
    fileUrl = `https://speed.cloudflare.com/__down?measId=7795217352823337&bytes=10000000`; // URL for mobile devices
  } else {
    fileUrl = `https://speed.cloudflare.com/__down?measId=4620545399793317&bytes=25000000`; // URL for desktop devices
  }

  const proxyUrl = useProxy ? `https://corsproxy.io/?url=${fileUrl}` : fileUrl; // Use a CORS proxy if useProxy is true

  // Total file size in bytes (25 MB)
  const totalSize = 25000000; // 25 MB in bytes

  try {
    let ipInfo;
    if (useProxy) {
      // Fetch IP, DNS, geo-location, browser, and device info with a timeout
      ipInfo = await Promise.race([
        fetch('https://ipinfo.io/178.239.163.82/json?token=a3a7c63579cb2c').then(response => response.json()),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30000)), // 30-second timeout
      ]).catch(() => {
        return { ip: "Information not available - retry", org: "Information not available - retry", city: "Information not available - retry", region: "Information not available - retry", country: "Information not available - retry", hostname: "Information not available - retry" };
      });
    } else {
      // Fetch IP, DNS, geo-location, browser, and device info without a proxy
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipInfo = { ip: data.ip, org: "Unknown", city: "Unknown", region: "Unknown", country: "Unknown", hostname: "Unknown" };
    }

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
      let response
      if (isMobileDevice){
        response = await fetch(proxyUrl);

      } else {
        response = await fetch(proxyUrl, { cache: "reload" });

      }

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

    // Show results and hide progress bar
    resultContainer.classList.remove('hidden');
    progressBar.classList.add('hidden'); // Hide progress bar
    progress.style.width = "0%"; // Reset progress bar width
    iterationProgress.classList.add('hidden');
    showError("Test completed - scroll down for results.");

    // Show the Copy to Clipboard button
    //copyToClipboardButton.classList.remove('hidden');

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
  const resultsText = `Average Result:\n` +
    /*`Network Details:\n` +
   `IP Address: ${document.querySelector('#detailed-results p:nth-child(2)').textContent.replace('IP Address: ', '')}\n` +
   `ISP: ${document.querySelector('#detailed-results p:nth-child(3)').textContent.replace('ISP: ', '')}\n` +
   `Location: ${document.querySelector('#detailed-results p:nth-child(4)').textContent.replace('Location: ', '')}\n` +
   `DNS Server: ${document.querySelector('#detailed-results p:nth-child(5)').textContent.replace('DNS Server: ', '')}\n` +
   `Browser: ${document.querySelector('#detailed-results p:nth-child(6)').textContent.replace('Browser: ', '')}\n` +
   `Device: ${document.querySelector('#detailed-results p:nth-child(7)').textContent.replace('Device: ', '')}\n\n` + */
    `Average Download Speed: ${document.getElementById('average-download-speed').textContent}\n` +
    `Average Bandwidth: ${document.getElementById('average-bandwidth').textContent}\n` +
    `Average Latency: ${document.getElementById('average-latency').textContent}\n\n` +
    `Detailed Results:\n` +
    document.getElementById('detailed-results').textContent;
  navigator.clipboard.writeText(resultsText).then(() => {
    alert("Results copied to clipboard!");
  });
});

const resultContainer = document.getElementById('result-container');
function showResults() {
  resultContainer.classList.add('visible');
  resultContainer.style.display = "block";
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
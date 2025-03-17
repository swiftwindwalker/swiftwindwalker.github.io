document.getElementById('start-test').addEventListener('click', startTest);
document.getElementById('toggle-unit').addEventListener('click', toggleUnit);
document.getElementById('copy-to-clipboard').addEventListener('click', copyResultsToClipboard);


let speedChart;
let useProxy = false;
let currentUnit = 'Mbps'; // Default unit
let peakSpeed = 0;

async function startTest() {
  const iterations = parseInt(document.getElementById('iterations').value);
  //const progressBar = document.getElementById('progress-bar');
  //const progress = document.getElementById('progress');
  const resultContainer = document.getElementById('result-container');
  const errorBox = document.getElementById('error-box');
  const startTestButton = document.getElementById('start-test');
  const detailedResults = document.getElementById('detailed-results');
  const averageDownloadSpeed = document.getElementById('average-download-speed');
  const averageBandwidth = document.getElementById('average-bandwidth');
  const averageLatency = document.getElementById('average-latency');
  //const iterationProgress = document.getElementById('iteration-progress');
  //const liveSpeedElement = document.getElementById('current-speed');
  const peakSpeedElement = document.getElementById('peak-speed');

  if (iterations > 10) {
    errorBox.textContent = "Error: Iterations cannot exceed 10.";
    return;
  }

  showResults();
  //progressBar.classList.remove('hidden');
  resultContainer.classList.add('hidden');
  errorBox.classList.add('hidden');
  errorBox.textContent = "Starting test...";
  detailedResults.innerHTML = "";
  averageDownloadSpeed.textContent = "Calculating...";
  averageBandwidth.textContent = "Calculating...";
  averageLatency.textContent = "Calculating...";
  //iterationProgress.classList.remove('hidden');
 // iterationProgress.textContent = "";
  document.getElementById('live-speed').classList.remove('hidden');
  //liveSpeedElement.textContent = "0";
  peakSpeedElement.textContent = "0";
  peakSpeed = 0;

  const results = [];
  const fileUrl = `https://speed.cloudflare.com/__down?measId=4620545399793317&bytes=25000000`;
  const proxyUrl = useProxy ? `https://corsproxy.io/?url=${fileUrl}` : fileUrl;
  const totalSize = 25000000;

  try {
    let ipInfo = await fetch('https://ipinfo.io?token=a3a7c63579cb2c').then(response => response.json()).catch(() => {
      return { ip: "Information not available - retry", org: "Information not available - retry", city: "Information not available - retry", region: "Information not available - retry", country: "Information not available - retry", hostname: "Information not available - retry" };
    });

    const browserInfo = getBrowserInfo();
    const deviceInfo = getDeviceInfo();

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
      errorBox.textContent = `Running iteration ${i} of ${iterations}`;

      const startTime = Date.now();
      let response = await fetch(proxyUrl, { cache: "reload" });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      let receivedLength = 0;
      let speeds = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        receivedLength += value.length;
        const currentTime = Date.now();
        const liveSpeed = calculateSpeed(startTime, currentTime, receivedLength);
        const smoothedSpeed = movingAverage(speeds, liveSpeed);

        //liveSpeedElement.textContent = smoothedSpeed.toFixed(2);
        updateSpeedometer(smoothedSpeed); // Update speedometer


        if (smoothedSpeed > peakSpeed) {
          peakSpeed = smoothedSpeed;
          peakSpeedElement.textContent = peakSpeed.toFixed(2);
        }

        const percentComplete = (receivedLength / totalSize) * 100;
        //progress.style.width = `${percentComplete}%`;
      }

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      const speed = (totalSize * 8) / duration / 1024 / 1024;
      const bandwidth = (totalSize / duration / 1024 / 1024).toFixed(2);
      const latency = (duration * 1000).toFixed(2);

      results.push({ speed, bandwidth, latency });

      const iterationResult = document.createElement('div');
      iterationResult.innerHTML = `
        <h3>Iteration ${i}</h3>
        <p><strong>Download Speed:</strong> ${speed.toFixed(2)} Mbps</p>
        <p><strong>Bandwidth:</strong> ${bandwidth} MB/s</p>
        <p><strong>Latency:</strong> ${latency} ms</p>
      `;
      detailedResults.appendChild(iterationResult);
      await delay(5000);
    }

    const averageSpeed = (results.reduce((sum, result) => sum + result.speed, 0) / iterations).toFixed(2);
    const averageBandwidthValue = (results.reduce((sum, result) => sum + parseFloat(result.bandwidth), 0) / iterations).toFixed(2);
    const averageLatencyValue = (results.reduce((sum, result) => sum + parseFloat(result.latency), 0) / iterations).toFixed(2);

    averageDownloadSpeed.textContent = `${averageSpeed} Mbps`;
    averageBandwidth.textContent = `${averageBandwidthValue} MB/s`;
    averageLatency.textContent = `${averageLatencyValue} ms`;

    resultContainer.classList.remove('hidden');
    //progressBar.classList.add('hidden');
    //progress.style.width = "0%";
    //iterationProgress.classList.add('hidden');
    errorBox.textContent = "Test completed - scroll down for results.";

    renderSpeedGraph(results);
  } catch (error) {
    console.error("Error during download test:", error);
    errorBox.textContent =`Error during download test: ${error.message}`;
    startTestButton.textContent = "Re-test Again";
    //iterationProgress.classList.add('hidden');
  } finally {
    document.getElementById('live-speed').classList.add('hidden');
  }
}

function calculateSpeed(startTime, currentTime, receivedLength) {
  const elapsedTime = (currentTime - startTime) / 1000;
  if (elapsedTime === 0) return 0;
  return (receivedLength * 8) / elapsedTime / 1024 / 1024;
}

function movingAverage(speeds, newSpeed, windowSize = 5) {
  speeds.push(newSpeed);
  if (speeds.length > windowSize) speeds.shift();
  return speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
}

function toggleUnit() {
  const unitToggleButton = document.getElementById('toggle-unit');
  const speedometerUnit = document.getElementById('speedometer-unit');
  const peakSpeedUnit = document.getElementById('peak-speed-unit');
  const speedometerValue = document.getElementById('speedometer-value');
  const peakSpeedElement = document.getElementById('peak-speed');

  if (currentUnit === 'Mbps') {
    // Switch to MB/s
    currentUnit = 'MB/s';
    unitToggleButton.textContent = 'Switch to Mbps';

    // Convert speedometer value to MB/s
    const speedometerMbps = parseFloat(speedometerValue.textContent);
    const speedometerMBs = (speedometerMbps / 8).toFixed(2);
    speedometerValue.textContent = speedometerMBs;

    // Convert peak speed to MB/s
    const peakSpeedMbps = parseFloat(peakSpeedElement.textContent);
    const peakSpeedMBs = (peakSpeedMbps / 8).toFixed(2);
    peakSpeedElement.textContent = peakSpeedMBs;
  } else {
    // Switch to Mbps
    currentUnit = 'Mbps';
    unitToggleButton.textContent = 'Switch to MB/s';

    // Convert speedometer value to Mbps
    const speedometerMBs = parseFloat(speedometerValue.textContent);
    const speedometerMbps = (speedometerMBs * 8).toFixed(2);
    speedometerValue.textContent = speedometerMbps;

    // Convert peak speed to Mbps
    const peakSpeedMBs = parseFloat(peakSpeedElement.textContent);
    const peakSpeedMbps = (peakSpeedMBs * 8).toFixed(2);
    peakSpeedElement.textContent = peakSpeedMbps;
  }

  // Update unit labels
  speedometerUnit.textContent = currentUnit;
  peakSpeedUnit.textContent = currentUnit;
}

function showError(message) {
  const errorBox = document.getElementById('error-box');
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function showResults() {
  const resultContainer = document.getElementById('result-container');
  resultContainer.style.display = "block";
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

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

function renderSpeedGraph(results) {
  const ctx = document.getElementById('speed-chart').getContext('2d');
  if (speedChart) {
    speedChart.destroy();
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
      responsive: true,
      maintainAspectRatio: false,
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

function copyResultsToClipboard() {
  const networkDetails = document.querySelector('.network-details').innerText;
  const averageResults = document.querySelector('.average-result').innerText;
  const detailedResults = document.getElementById('detailed-results').innerText;

  const resultsText = `
    Network Details:
    ${networkDetails}

    Average Results:
    ${averageResults}

    Detailed Results:
    ${detailedResults}
  `;

  navigator.clipboard.writeText(resultsText).then(() => {
    alert("Results copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy results. Please try again.");
  });
}

  function updateSpeedometer(speed) {
    const speedometerValue = document.getElementById('speedometer-value');
    const speedometerUnit = document.getElementById('speedometer-unit');
    speedometerValue.textContent = speed.toFixed(2);
    speedometerUnit.textContent = currentUnit;
  }
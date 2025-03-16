    document.getElementById('start-test').addEventListener('click', startTest);

    async function startTest() {
      const fileSize = document.getElementById('file-size').value;
      const progressBar = document.getElementById('progress-bar');
      const progress = document.getElementById('progress');
      const results = document.getElementById('results');
      const errorBox = document.getElementById('error-box');

      // Reset UI
      progressBar.classList.remove('hidden');
      results.classList.add('hidden');
      errorBox.classList.add('hidden');
      errorBox.textContent = "";

      // Fetch user's IP and ISP details
      try {
        const ipInfo = await fetch('https://ipinfo.io/178.239.163.82/json?token=a3a7c63579cb2c').then(response => response.json());
        document.getElementById('ip-address').textContent = ipInfo.ip;
        document.getElementById('isp').textContent = ipInfo.org;
      } catch (error) {
        console.error("Failed to fetch IP or ISP details:", error);
        showError("Failed to fetch IP or ISP details. Please try again.");
      }

      // Fetch DNS server details
      try {
        const dnsInfo = await fetch('https://dns.google/resolve?name=google.com&type=A').then(response => response.json());
        document.getElementById('dns-server').textContent = dnsInfo.Answer?.[0]?.data || 'Unknown';
      } catch (error) {
        console.error("Failed to fetch DNS details:", error);
        showError("Failed to fetch DNS details. Please try again.");
      }

      // Start download test
      const startTime = Date.now();
      const fileUrl = `http://ipv4.download.thinkbroadband.com/${fileSize}.zip`;

      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
        }

        const reader = response.body.getReader();
        let receivedLength = 0;

        // Get the total file size from the response headers
        const contentLength = response.headers.get('Content-Length');
        if (!contentLength) {
          throw new Error("Content-Length header missing in response.");
        }
        const totalSize = parseInt(contentLength, 10);

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

        // Display results
        document.getElementById('download-speed').textContent = `${speed.toFixed(2)} Mbps`;
        document.getElementById('bandwidth').textContent = `${(speed / 8).toFixed(2)} MB/s`;
        document.getElementById('latency').textContent = `${(duration * 1000).toFixed(2)} ms`;

        // Add speed rating and rocket icon
        const speedRating = document.getElementById('speed-rating');
        const rocketIcon = document.getElementById('rocket-icon');
        if (speed < 10) {
          speedRating.textContent = "Below Average 🐢";
          rocketIcon.textContent = "🚀"; // Slow rocket
        } else if (speed >= 10 && speed < 50) {
          speedRating.textContent = "Average ⚡";
          rocketIcon.textContent = "🚀🚀"; // Medium rocket
        } else {
          speedRating.textContent = "Above Average 🚀";
          rocketIcon.textContent = "🚀🚀🚀"; // Fast rocket
        }
      } catch (error) {
        console.error("Error during download test:", error);
        showError(`Error during download test: ${error.message}`);
      } finally {
        results.classList.remove('hidden');
      }
    }

    // Show error message
    function showError(message) {
      const errorBox = document.getElementById('error-box');
      errorBox.textContent = message;
      errorBox.classList.remove('hidden');
    }

    // Copy results to clipboard
    document.getElementById('copy-to-clipboard').addEventListener('click', () => {
      const resultsText = `Download Speed: ${document.getElementById('download-speed').textContent}\n` +
                         `Bandwidth: ${document.getElementById('bandwidth').textContent}\n` +
                         `Latency: ${document.getElementById('latency').textContent}\n` +
                         `IP Address: ${document.getElementById('ip-address').textContent}\n` +
                         `DNS Server: ${document.getElementById('dns-server').textContent}\n` +
                         `ISP: ${document.getElementById('isp').textContent}`;
      navigator.clipboard.writeText(resultsText).then(() => {
        alert("Results copied to clipboard!");
      });
    });

    // Share on X (Twitter)
    document.getElementById('share-twitter').addEventListener('click', () => {
      const text = `Check out my internet speed test results!\n` +
                   `Download Speed: ${document.getElementById('download-speed').textContent}\n` +
                   `Bandwidth: ${document.getElementById('bandwidth').textContent}\n` +
                   `Latency: ${document.getElementById('latency').textContent}\n` +
                   `IP Address: ${document.getElementById('ip-address').textContent}\n` +
                   `DNS Server: ${document.getElementById('dns-server').textContent}\n` +
                   `ISP: ${document.getElementById('isp').textContent}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });

    // Share on WhatsApp
    document.getElementById('share-whatsapp').addEventListener('click', () => {
      const text = `Check out my internet speed test results!\n` +
                   `Download Speed: ${document.getElementById('download-speed').textContent}\n` +
                   `Bandwidth: ${document.getElementById('bandwidth').textContent}\n` +
                   `Latency: ${document.getElementById('latency').textContent}\n` +
                   `IP Address: ${document.getElementById('ip-address').textContent}\n` +
                   `DNS Server: ${document.getElementById('dns-server').textContent}\n` +
                   `ISP: ${document.getElementById('isp').textContent}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });

    // Share on Reddit
    document.getElementById('share-reddit').addEventListener('click', () => {
      const text = `Check out my internet speed test results!\n` +
                   `Download Speed: ${document.getElementById('download-speed').textContent}\n` +
                   `Bandwidth: ${document.getElementById('bandwidth').textContent}\n` +
                   `Latency: ${document.getElementById('latency').textContent}\n` +
                   `IP Address: ${document.getElementById('ip-address').textContent}\n` +
                   `DNS Server: ${document.getElementById('dns-server').textContent}\n` +
                   `ISP: ${document.getElementById('isp').textContent}`;
      const url = `https://www.reddit.com/submit?title=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });
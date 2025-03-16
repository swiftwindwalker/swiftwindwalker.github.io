// Fetch sidebar HTML dynamically and insert it into the page
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
        console.log('navbar.html loaded?:\n\n', data);
        document.querySelector(".navbar").style.opacity = "1";
        // Now, reinitialize the shuffle animation
        initializeShuffleEffect();
    })
    .catch(error => {
        console.error('Error loading navbar:', error);
    });


//Shuffle text effect for nav bar

function initializeShuffleEffect() {

document.querySelectorAll(".shuffle-text > a").forEach(textElement => {
	// Check if the device is mobile using user-agent string
	const isMobile = /Mobi|Android/i.test(navigator.userAgent);
	if (!isMobile) { 
	let originalText = textElement.textContent;
	let words = originalText.split(" ");
	let shuffleIntervals = []; // Store interval references to stop them
	let shuffleTimeout; // Store timeout reference

	// Wrap each letter in a span
	textElement.innerHTML = words.map(word =>
		word.split("").map((char, index) =>
			`<span data-char="${char}" data-index="${index}">${char}</span>`
		).join("")
	).join(" "); // Maintain spaces

	let letters = [...textElement.querySelectorAll("span")];

	function startShuffling() {
		stopShuffling(); // Ensure no previous shuffle runs

		words.forEach(word => {
			let wordStartIndex = letters.findIndex(span => span.dataset.char === word[0]);
			let wordLetters = letters.slice(wordStartIndex, wordStartIndex + word.length);
			let firstLetter = wordLetters.shift(); // Keep first letter stable

			let originalOrder = wordLetters.map(span => span.textContent);

			let interval = setInterval(() => {
				let shuffledIndexes = [...Array(wordLetters.length).keys()];
				for (let i = shuffledIndexes.length - 1; i > 0; i--) {
					let j = Math.floor(Math.random() * (i + 1));
					[shuffledIndexes[i], shuffledIndexes[j]] = [shuffledIndexes[j], shuffledIndexes[i]];
				}

				let shuffledText = shuffledIndexes.map(i => originalOrder[i]);
				wordLetters.forEach((span, i) => {
					span.textContent = shuffledText[i];
				});
			}, 50); // Fast shuffle every 50ms

			shuffleIntervals.push(interval);
		});

		// Automatically stop shuffling after 0.3 seconds
		shuffleTimeout = setTimeout(stopShuffling, 300);
	}

	function stopShuffling() {
		shuffleIntervals.forEach(clearInterval);
		shuffleIntervals = [];
		clearTimeout(shuffleTimeout);
		restoreOriginal();
	}

	function restoreOriginal() {
		letters.forEach(span => {
			span.textContent = span.dataset.char; // Reset to original letter
		});
	}

	textElement.addEventListener("mouseenter", startShuffling);
	textElement.addEventListener("mouseleave", stopShuffling);
	}
})
};

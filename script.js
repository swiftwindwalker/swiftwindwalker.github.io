// JavaScript to adjust rotation based on scroll and position letters along the top of the circle
document.addEventListener('DOMContentLoaded', function () {
  const text = document.querySelector('.rotating-text');
  const letters = text.querySelectorAll('span');
  const radius = 52.5; // Reduced radius by 70% (was 120px, now 52.5px for smaller circle)
  const totalLetters = letters.length;
  const angleStep = 360 / totalLetters; // Step between each letter's position

  // Position each letter along the top of the circle, upright
  letters.forEach((letter, index) => {
    const angle = angleStep * index; // Angle to place each letter along the circle
    const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius; // X position of the letter
    const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius; // Y position of the letter

    // Position each letter, aligned along the top of the circle
    letter.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`; 
  });

  // Scroll event listener to adjust rotation based on scroll
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const rotationAmount = scrollPosition / 3; // Control the scroll-to-rotate speed
    text.style.transform = `rotate(${rotationAmount}deg)`; // Rotate the text around the circle
	document.querySelector('.dice').style.transform = `rotate(${rotationAmount}deg)`; // Rotate the dice along with the text
  });
});

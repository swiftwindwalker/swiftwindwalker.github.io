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
  window.addEventListener('scroll', function () {
    const scrollPosition = window.scrollY;
    const rotationAmount = scrollPosition / 3; // Control the scroll-to-rotate speed
    text.style.transform = `rotate(${rotationAmount}deg)`; // Rotate the text around the circle
    document.querySelector('.dice').style.transform = `rotate(${rotationAmount}deg)`; // Rotate the dice along with the text
  });
});

//nav bar code starts here

//Author - Ravzzy

window.onload = () => {
  setTimeout(() => {
    document.querySelector("body").classList.add("display");
  }, 4000);
};

document.querySelector(".hamburger-menu").addEventListener("click", () => {
  document.querySelector(".container").classList.toggle("change");
});

document.querySelector(".scroll-btn").addEventListener("click", () => {
  document.querySelector("html").style.scrollBehavior = "smooth";
  setTimeout(() => {
    document.querySelector("html").style.scrollBehavior = "unset";
  }, 1000);
});

/*
document.getElementById("myVideo").addEventListener("ended", function () {
  // Log to the console when the event is triggered, check inspect element for more details on browser
  console.log('Video loaded enough to show the banner.');
  // When the video is ready, make the banner visible
  document.querySelector(".banner h1").style.opacity = 1;
  document.querySelector(".banner p").style.opacity = 1;
  document.querySelector(".banner button").style.opacity = 1;
});*/

const form = document.getElementById('form');
const result = document.getElementById('result');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);
  result.innerHTML = "Please wait..."

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: json
  })
    .then(async (response) => {
      let json = await response.json();
      if (response.status == 200) {
        result.innerHTML = "Form submitted successfully";
      } else {
        console.log(response);
        result.innerHTML = json.message;
      }
    })
    .catch(error => {
      console.log(error);
      result.innerHTML = "Something went wrong!";
    })
    .then(function () {
      form.reset();
      setTimeout(() => {
        result.style.display = "none";
      }, 3000);
    });
});

// Get the dropdown button and dropdown content
const dropdownButton = document.querySelector('.dropdown-btn');
const dropdownContent = document.querySelector('.dropdown-content');

// Add a click event listener to the button
dropdownButton.addEventListener('click', function (event) {
  // Prevent the page from reloading when clicking the button
  event.preventDefault();

  // Toggle the visibility of the dropdown content
  dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
});

// Optional: Close the dropdown if clicking anywhere outside of it
document.addEventListener('click', function (event) {
  if (!dropdownButton.contains(event.target) && !dropdownContent.contains(event.target)) {
    dropdownContent.style.display = 'none';
  }
});

/*
document.addEventListener("DOMContentLoaded", function () {
  const glitchElement = document.querySelector(".homepage-img3-wrapper");

  setInterval(() => {
    glitchElement.classList.add("glitch-active");

    setTimeout(() => {
      glitchElement.classList.remove("glitch-active");
    }, 500); // Stop the glitch after 0.5s
  }, 3000); // Trigger glitch every 3 seconds
});*/
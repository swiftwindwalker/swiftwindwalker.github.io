/* Author - ravzzy */

// ✅ Print Viewport Dimensions (Debugging)
function printViewportDimensions() {
    console.log("------VIEWPORT SIZES------");
    console.log(`Viewport Width: ${window.innerWidth}px`);
    console.log(`Viewport Height: ${window.innerHeight}px`);
    console.log("--------------------------");
}

printViewportDimensions();
window.addEventListener("resize", printViewportDimensions);

console.clear();

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const frameCount = 300;
const currentFrame = index => (
  `imgs/male${index}.png`
);

const images = [];
const airpods = {
  frame: 0
};

// Function to preload images
function preloadImages() {
  return Promise.all(
    Array.from({ length: frameCount }, (_, i) => {
      return new Promise((resolve) => {
        const img = new Image();
        const imageUrl = currentFrame(i + 1);
        console.log(`Loading image: ${imageUrl}`);
        img.src = imageUrl;

        img.onload = () => {
          console.log(`Image ${i + 1} loaded successfully.`);
          resolve(img);
        };

        img.onerror = () => {
          console.error(`Failed to load image at ${img.src}. Skipping.`);
          resolve(null); // Skip this image
        };

        images.push(img);
      });
    })
  );
}

// Throttle function to limit render calls
function throttle(callback, limit) {
  let waiting = false;
  return function () {
    if (!waiting) {
      callback.apply(this, arguments);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
}

// Render function with interpolation
function render() {
  requestAnimationFrame(() => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const currentFrameIndex = Math.floor(airpods.frame);
    const nextFrameIndex = Math.min(currentFrameIndex + 1, frameCount - 1);
    const progress = airpods.frame - currentFrameIndex; // Fractional progress between frames

    if (images[currentFrameIndex] && images[nextFrameIndex]) {
      // Draw the current frame
      console.log ("image rendered: "+images[currentFrameIndex].src);
      context.globalAlpha = 1 - progress; // Fade out the current frame
      context.drawImage(images[currentFrameIndex], 0, 0);

      // Draw the next frame
      context.globalAlpha = progress; // Fade in the next frame
      context.drawImage(images[nextFrameIndex], 0, 0);

      // Reset globalAlpha
      context.globalAlpha = 1;
    } else {
      console.warn(`No image available for frame ${currentFrameIndex} or ${nextFrameIndex}.`);
    }
  });
}

// Throttled render function
const throttledRender = throttle(render, 16); // Limit to ~60 FPS

// Preload images and then start the animation
preloadImages().then(() => {
  console.log("All images preloaded. Starting animation...");

  gsap.to(airpods, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      scrub: 1, // Adjust this value for smoother scrubbing
      start: "top top",
      end: "bottom bottom",  // End 200px below the top of the trigger.
      markers: true // Disable markers in production
    },
    onUpdate: () => {
     console.log("Current frame value:"+ airpods.frame);
      throttledRender();
    }
  });

  // Render the first frame immediately
  render();
}).catch(error => {
  console.error("Error preloading images:", error);
});

// Debug scroll position
ScrollTrigger.create({
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    console.log(`Scroll position: ${self.progress}`);
  }
});

/*
// ✅ Dynamically set body height for smooth scrolling
document.body.style.height = `${window.innerHeight * 6}px`; 

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const FRAMES = 300;
let imgPaths = [];
let imgs = [];
let frame = { frame: 0 };  // Start from frame 0
let loadedImages = 0;

// ✅ Generate Image Paths
function getImagePaths() {
    for (let i = 1; i <= FRAMES; i++) {
        imgPaths.push(`imgs/male${i}.png`);
    }
}
getImagePaths();

// ✅ Preload Images
function getImages() {
    imgPaths.forEach((path, index) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            loadedImages++;
            if (index === 0) render(); // Render first frame ASAP
            if (loadedImages === FRAMES) {
                console.log("✅ All frames loaded.");
            }
        };
        imgs[index] = img;
    });
}
getImages();

// ✅ Resize Canvas Dynamically
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ScrollTrigger.refresh();
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ✅ GSAP ScrollTrigger Animation
gsap.registerPlugin(ScrollTrigger);

gsap.to(frame, {
    frame: FRAMES - 1,
    snap: "frame",
    ease: "none",  // 🔥 Smooth transition
    scrollTrigger: {
        trigger: "#canvas",
        start: "top top",
        end: `+=${window.innerHeight * 5}`,  // ✅ Controls where animation stops
        scrub: 4,  // 🔥 Adjust for smoother animation
        markers: true,  // Remove in production
        onUpdate: (self) => {
            let progress = self.progress;
            let newFrame = Math.max(0, Math.round(progress * (FRAMES - 1)));

            // ✅ Ensure first frame always stays visible at the start
            if (progress <= 0.01) {
                newFrame = 0;
            }

            // ✅ Update only if the frame actually changes
            if (newFrame !== frame.frame) {
                frame.frame = newFrame;
                render();
            }

            console.log("Scroll Progress:", progress, "Frame:", frame.frame);
        },
    },
});

// ✅ Render Frame Function
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let img = imgs[frame.frame];

    // 🚀 Ensure image is loaded before rendering
    if (!img || img.width === 0 || img.height === 0) {
        console.warn("Skipping frame, image not loaded yet:", frame.frame);
        return;
    }

    let scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
    if (window.innerWidth < 768) {
        scaleFactor *= 2.0;  // ✅ Keep scale factor 2.0 for mobile
    }

    let imgWidth = img.width * scaleFactor;
    let imgHeight = img.height * scaleFactor;
    let x = (canvas.width - imgWidth) / 2;
    let y = canvas.height - imgHeight;

    ctx.drawImage(img, x, y, imgWidth, imgHeight);
}

// ✅ Force First Frame to Always Load Immediately
function forceFirstFrame() {
    if (imgs[0] && imgs[0].complete) {
        render();
        console.log("✅ First image rendered");
    } else {
        console.log("⏳ Waiting for first image to load...");
        setTimeout(forceFirstFrame, 50); // Retry every 50ms
    }
}
setTimeout(forceFirstFrame, 200);

*/

/*
gsap.to('.two', {
	scrollTrigger: {
		trigger: '.two',
		start: 'top top',
		end: '+=' + window.innerHeight * 1.1,
		pin: true,
		scrub: 1,
	},
})

gsap.to('.three', {
	scrollTrigger: {
		trigger: '.three',
		start: 'top .two',
		end: '+=' + window.innerHeight * 1.1,
		scrub: 1,
		pin: true,
	},
})

gsap.to('.four', {
	scrollTrigger: {
		trigger: '.four',
		start: 'top top',
		end: '+=' + window.innerHeight * 1.1,
		srub: 1,
		pin: true,
	},
}) 
    */

gsap.to('.loader-img', {
	rotation: 360,
	duration: 1.5,
	repeat: -1,
	repeatDelay: 0.25,
})


window.addEventListener('load', e => {
	document.body.classList.remove('loading')
})

/*
const rgb = {
	r: 255,
	g: 255,
	b: 255,
	rT: 23,
	gT: 16,
	bT: 16,
}

const rgbTitle = {}

const roadmap = document.querySelector('.roadmap')
const roadmapTitle = document.querySelector('.roadmap .title')

gsap.to(rgb, {
	r: 23,
	g: 16,
	b: 16,
	rT: 255,
	gT: 255,
	bT: 255,
	snap: 1,
	scrollTrigger: {
		trigger: '.roadmap',
		start: 'top bottom',
		end: '+=' + window.innerHeight * 0.3,
		scrub: true,
	},
	onUpdate: () => {
		roadmapTitle.style.color = `rgb(${rgb.rT},${rgb.gT},${rgb.bT})`

		roadmap.style.backgroundColor = `rgb(${rgb.r},${rgb.g},${rgb.b})`
	},
})
*/

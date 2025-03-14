/* Author - ravzzy */


//Print Viewport Dimensions

function printViewportDimensions() {
	const width = window.innerWidth;   // Viewport width
	const height = window.innerHeight; // Viewport height
	console.log("------VIEWPORT SIZES------")
	console.log(`Viewport Width: ${width}px`);
	console.log(`Viewport Height: ${height}px`);
	console.log("--------------------------")
}

// Print viewport dimensions when the page loads
printViewportDimensions();

// Print viewport dimensions whenever the window is resized
window.addEventListener('resize', printViewportDimensions);


const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const FRAMES = 300
let imgPaths = []
let imgs = []  // Declare imgs before using it
let frame = { frame: 1 }
let loadedImages = 0

// Function to generate image paths for all frames
function getImagePaths() {
    console.log("getImagePaths invoked");
    for (let i = 1; i <= FRAMES; i++) {
        imgPaths.push(`imgs/male${i}.png`)
    }
}
getImagePaths()

// Function to load images and ensure they're all loaded before rendering
function getImages() {
    console.log("getImages invoked");
    imgPaths.forEach((path, index) => {
        const img = new Image()
        img.src = path
        img.onload = () => {
            loadedImages++
            if (loadedImages === imgPaths.length) {
                console.log("rendering first frame: "+img.src);
                //render()  // Render first frame when all images are loaded
            }
        }
        img.style.display = 'block'
        imgs.push(img)
    })
}
getImages()
console.log("loaded images: "+loadedImages)

// Resize canvas dynamically based on window size
function resizeCanvas() {
    canvas.height = window.innerHeight
    canvas.width = window.innerWidth
    if (imgs.length === FRAMES) {  // Only render if images are fully loaded
        console.log ("resize rendering: "+imgs.length);
        render()
    }
}

// Call resizeCanvas **after** imgs is declared
resizeCanvas()

// Handle window resize event
window.addEventListener('resize', resizeCanvas)

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

// Create scroll-triggered animation
gsap.to(frame, {
    frame: FRAMES - 1,
    snap: 'frame',
    scrollTrigger: {
        start: 'top top',  
        end: '+=600%',  
        scrub: true,
        markers: true,  // Optional: remove in production
    },
    onUpdate: () => {
        console.log("scroll - rendering");
        render()  // Update canvas on scroll
    },
})

// Function to render the current frame on the canvas
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("frame: "+frame.frame);

    let img = imgs[frame.frame];
    if (img) {
        console.log("Image loaded: "+img.src);
        // Calculate the correct scale factor while maintaining aspect ratio
        let scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);

        // 🚀 Boost size on mobile screens
        if (window.innerWidth < 768) {
            console.log("image scaled for mobile");
            scaleFactor *= 1.5;  // Increase size only on small screens
        }

        let imgWidth = img.width * scaleFactor;
        let imgHeight = img.height * scaleFactor;

        console.log ("Image size: "+imgWidth+ " x "+imgHeight+" px")

        let x = (canvas.width - imgWidth) / 2;  // Center horizontally
        let y = canvas.height - imgHeight;      // Align to bottom

        console.log ("x, y: "+x+ " x "+y+" px")

        ctx.drawImage(img, x, y, imgWidth, imgHeight);
    }
}


// Make sure the first image is loaded before rendering
if (imgs[1]) {
    imgs[1].onload = render 
    console.log('First image rendered')
}


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

gsap.to('.loader-img', {
	rotation: 360,
	duration: 1.5,
	repeat: -1,
	repeatDelay: 0.25,
})

window.addEventListener('load', e => {
	document.body.classList.remove('loading')
})

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

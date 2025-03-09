const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

canvas.height = 1080
canvas.width = 1920

let imgPaths = []
const FRAMES = 300
let frame = { frame: 1 }

function getImagePaths() {
	for (let i = 1; i <= FRAMES; i++) {
		imgPaths.push(`imgs/male${i}.png`)
	}
}
getImagePaths()

let imgs = []
function getImages() {
	imgPaths.forEach(path => {
		const img = new Image()
		img.src = path
		img.style.display = 'block'
		imgs.push(img)
	})
}
getImages()

gsap.registerPlugin(ScrollTrigger)

gsap.to(frame, {
	frame: FRAMES - 1,
	snap: 'frame',
	// ease: 'none',
	scrollTrigger: {
		// trigger: 'canvas',
		start: 'top top',
		end: '+=700%',
		scrub: true,
	},
	onUpdate: () => {
		render()
		// canvas.style.backgroundImage = `url(${imgPaths[frame.frame]})`
	},
})

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.drawImage(imgs[frame.frame], 0, 0)
}

imgs[1].onload = render

window.addEventListener('resize', () => {
	// canvas.height = window.innerHeight
	// canvas.width = window.innerWidth
	render()
})

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

gsap.to('four', {
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

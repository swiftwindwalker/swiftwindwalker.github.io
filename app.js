document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Set the initial canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const FRAMES = 300;
    const imgPaths = [];
    const imgs = [];

    // Function to get image paths for each frame
    function getImagePaths() {
        for (let i = 1; i <= FRAMES; i++) {
            imgPaths.push(`imgs/male${i}.png`);
        }
    }
    getImagePaths();

    // Function to load all images
    function getImages() {
        const promises = imgPaths.map(path => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = path;
                img.style.display = 'block';
                img.onload = () => resolve(img);
                img.onerror = reject;
                imgs.push(img);
            });
        });

        // Once all images are loaded, trigger rendering
        Promise.all(promises).then(() => {
            console.log('All images loaded');
            render(); // Render the first image after loading all images
        }).catch(err => {
            console.error('Error loading images:', err);
        });
    }
    getImages();

    // Frame handling object
    let frame = { frame: 0 };

    // GSAP animation for scrolling
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(frame, {
        frame: FRAMES - 1,
        snap: 'frame',
        scrollTrigger: {
            trigger: 'canvas',
            start: 'top top',
            end: '+=700%',
            scrub: true,
        },
        onUpdate: () => {
            render();
        },
    });

    // Render function to draw the image on the canvas
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (imgs[frame.frame]) {
            const img = imgs[frame.frame];

            // Determine the scaling factor
            const isMobile = window.innerWidth <= 768;  // You can adjust this breakpoint as needed
            const scaleFactor = isMobile ? 1.6 : 1;  // Increase the scale on mobile - 40% larger
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * scaleFactor;
            const imgWidth = img.width * scale;
            const imgHeight = img.height * scale;

            // Calculate the position to center horizontally and place at the bottom
            const x = (canvas.width - imgWidth) / 2;
            const y = canvas.height - imgHeight;

            // Draw the image on the canvas
            ctx.drawImage(img, x, y, imgWidth, imgHeight);
        }
    }

    // Resize the canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render();  // Re-render the canvas after resizing
    });

    // Initial resize to match current window size
    updateCanvasSize();

    function updateCanvasSize() {
        console.log('Resizing canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render();
    }

    // Additional GSAP scroll-triggered animations
    gsap.to('.two', {
        scrollTrigger: {
            trigger: '.two',
            start: 'top top',
            end: '+=' + window.innerHeight * 1.1,
            pin: true,
            scrub: 1,
        },
    });

    gsap.to('.three', {
        scrollTrigger: {
            trigger: '.three',
            start: 'top .two',
            end: '+=' + window.innerHeight * 1.1,
            pin: true,
            scrub: 1,
        },
    });

    gsap.to('.four', {
        scrollTrigger: {
            trigger: '.four',
            start: 'top top',
            end: '+=' + window.innerHeight * 1.1,
            scrub: 1,
            pin: true,
        },
    });

    gsap.to('.loader-img', {
        rotation: 360,
        duration: 1.5,
        repeat: -1,
        repeatDelay: 0.25,
    });

    window.addEventListener('load', () => {
        document.body.classList.remove('loading');
    });

    // Change title colors and background colors during scroll
    const rgb = { r: 255, g: 255, b: 255, rT: 23, gT: 16, bT: 16 };
    const roadmap = document.querySelector('.roadmap');
    const roadmapTitle = document.querySelector('.roadmap .title');

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
            roadmapTitle.style.color = `rgb(${rgb.rT},${rgb.gT},${rgb.bT})`;
            roadmap.style.backgroundColor = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        },
    });

    // Add media queries and additional styling (if required)

    window.addEventListener('resize', updateCanvasSize);
});

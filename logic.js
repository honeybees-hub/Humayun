gsap.registerPlugin(ScrollTrigger);

let scene, camera, renderer, particles, hSquareGroup;
let mouseX = 0, mouseY = 0;

function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 7;

    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#bg-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Floating Bokeh Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 2000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        pos[i] = (Math.random() - 0.5) * 30;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.04,
        color: 0x6366f1,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    });
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // --- IMPROVED H SQUARE (H²) ---
    hSquareGroup = new THREE.Group();

    const glowMat = new THREE.MeshPhongMaterial({
        color: 0x6366f1,
        emissive: 0x6366f1,
        emissiveIntensity: 1,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });

    const solidMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.05
    });

    // "H" Construction
    const hPartGroup = new THREE.Group();
    const sideBox = new THREE.BoxGeometry(0.3, 3, 0.3);
    const midBox = new THREE.BoxGeometry(1.2, 0.3, 0.3);

    const parts = [
        { geom: sideBox, x: -0.75 },
        { geom: sideBox, x: 0.75 },
        { geom: midBox, x: 0 }
    ];

    parts.forEach(p => {
        const mesh = new THREE.Mesh(p.geom, glowMat);
        mesh.position.x = p.x;
        hPartGroup.add(mesh);

        const solid = new THREE.Mesh(p.geom, solidMat);
        solid.position.x = p.x;
        hPartGroup.add(solid);
    });

    hSquareGroup.add(hPartGroup);

    // "2" Construction
    const twoGroup = new THREE.Group();
    const seg = new THREE.BoxGeometry(0.6, 0.1, 0.1);
    const vSeg = new THREE.BoxGeometry(0.1, 0.35, 0.1);

    const segments = [
        { g: seg, y: 0.4 }, // Top
        { g: seg, y: 0 },   // Mid
        { g: seg, y: -0.4 },// Bottom
        { g: vSeg, x: 0.25, y: 0.2 }, // TR
        { g: vSeg, x: -0.25, y: -0.2 } // BL
    ];

    segments.forEach(s => {
        const mesh = new THREE.Mesh(s.g, glowMat);
        if (s.x) mesh.position.x = s.x;
        if (s.y) mesh.position.y = s.y;
        twoGroup.add(mesh);
    });

    twoGroup.position.set(1.4, 1.2, 0);
    twoGroup.scale.set(0.8, 0.8, 0.8);
    hSquareGroup.add(twoGroup);

    scene.add(hSquareGroup);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pointLight = new THREE.PointLight(0x6366f1, 3);
    pointLight.position.set(2, 2, 5);
    scene.add(pointLight);

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5);
        mouseY = (e.clientY / window.innerHeight - 0.5);
    });

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    particles.rotation.y += 0.0005;

    if (hSquareGroup) {
        hSquareGroup.rotation.y += 0.005;
        hSquareGroup.rotation.x = Math.sin(time * 0.5) * 0.1;

        // Floating motion
        hSquareGroup.position.y = Math.sin(time) * 0.15;

        // Mouse pull
        hSquareGroup.position.x += (mouseX * 2 - hSquareGroup.position.x) * 0.05;
        hSquareGroup.position.y += (-mouseY * 2 - hSquareGroup.position.y) * 0.05;

        // Pulsing glow
        const pulse = 0.5 + Math.sin(time * 3) * 0.5;
        hSquareGroup.traverse((obj) => {
            if (obj.isMesh && obj.material.emissiveIntensity !== undefined) {
                obj.material.emissiveIntensity = 0.5 + (pulse * 1.5);
            }
        });
    }

    renderer.render(scene, camera);
}

// Entrance sequence
window.addEventListener('load', () => {
    initThree();

    const tl = gsap.timeline();

    tl.to("#sub-header", { y: 0, duration: 1, ease: "power4.out" })
        .to("#co-founder-title", { y: 0, duration: 1, ease: "power4.out" }, "-=0.8")
        .to("#main-title", { y: 0, duration: 1.2, ease: "power4.out" }, "-=0.8")
        .to("#profile-pic", { opacity: 1, duration: 1.5, ease: "power2.out" }, "-=1")
        .to("#hero-desc", { opacity: 0.7, y: 0, duration: 1 }, "-=0.8")
        .to("#hero-btns", { opacity: 1, y: 0, duration: 1 }, "-=0.8");

    // Scroll animations
    gsap.to("#tech-reveal", {
        scrollTrigger: {
            trigger: "#tech-reveal",
            start: "top 85%",
        },
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power3.out"
    });

    // Experience cards animation
    gsap.to(".reveal-card", {
        scrollTrigger: {
            trigger: "#experience",
            start: "top 80%",
        },
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out"
    });

    // --- Audio Logic ---
    const audio = document.getElementById('bgMusic');
    const status = document.getElementById('status');
    const startTime = 111; // 1:51

    if (audio && status) {
        const startPlayback = () => {
            audio.volume = 0.3; // Set to a better default volume
            audio.currentTime = startTime;

            audio.play().then(() => {
                status.innerText = "Now playing 'Dooron Dooron' (Volume: 30%)";
            }).catch(() => {
                status.innerText = "Click anywhere to enable audio experience.";
                document.addEventListener('click', () => {
                    audio.play();
                    status.innerText = "Now playing 'Dooron Dooron' (Volume: 30%)";
                }, { once: true });
            });
        };

        // Try playing after a short delay
        setTimeout(startPlayback, 2000);

        audio.addEventListener('error', () => {
            status.innerText = "Audio playback unavailable.";
        });
    }
});

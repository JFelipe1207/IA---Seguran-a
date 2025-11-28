/***************************************************
 *  PARTICLE RING – THREE.JS (HERO BACKGROUND)
 ***************************************************/
let scene, camera, renderer, particleGroup;
let paused = false;

function initParticleRing() {

  const hero = document.getElementById("hero");
  const canvas = document.getElementById("three-canvas");

  // === Scene ===
  scene = new THREE.Scene();

  // === Camera ===
  camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    200
  );
  camera.position.set(12, 0, 14);

  // === Renderer ===
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  // Resize
  window.addEventListener("resize", () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  });

  // === Group for particles ===
  particleGroup = new THREE.Group();
  scene.add(particleGroup);

  // === Create particles ===
  const particles = createParticleRing();
  particles.forEach(p => particleGroup.add(p));

  animate();
}

/***************************************************
 *  PARTICLE GENERATION
 ***************************************************/
function createParticleRing() {
  const particles = [];

  const MIN_RADIUS = 7.5;
  const MAX_RADIUS = 15;
  const DEPTH = 2;
  const NUM_POINTS = 2500;

  const LEFT_COLOR = "6366f1";
  const RIGHT_COLOR = "8b5cf6";

  const randomFrom = (min, max) => Math.random() * (max - min) + min;

  function getGradientStop(ratio) {
    ratio = Math.max(0, Math.min(1, ratio));

    const c0 = LEFT_COLOR.match(/.{1,2}/g).map(o => parseInt(o,16)*(1-ratio));
    const c1 = RIGHT_COLOR.match(/.{1,2}/g).map(o => parseInt(o,16)*ratio);

    const ci = [0,1,2].map(i => Math.min(Math.round(c0[i]+c1[i]),255));
    const color = ci.reduce((a,v)=>(a<<8)+v,0).toString(16).padStart(6,"0");

    return `#${color}`;
  }

  function getColor(x){
    const maxDiff = MAX_RADIUS * 2;
    const ratio = (x + MAX_RADIUS) / maxDiff;
    return getGradientStop(ratio);
  }

  function createSphere(x, y, z, color) {
    const geo = new THREE.SphereGeometry(0.09, 10, 10);
    const mat = new THREE.MeshStandardMaterial({
      emissive: color,
      emissiveIntensity: 0.55,
      roughness: 0.5,
      color: color
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    return mesh;
  }

  // Inner part
  for (let i = 0; i < NUM_POINTS; i++) {
    const r = randomFrom(MIN_RADIUS, MAX_RADIUS);
    const a = Math.random() * Math.PI * 2;

    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const z = randomFrom(-DEPTH, DEPTH);

    const color = getColor(x);
    particles.push(createSphere(x, y, z, color));
  }

  // Outer "halo"
  for (let i = 0; i < NUM_POINTS / 4; i++) {
    const r = randomFrom(MIN_RADIUS / 2, MAX_RADIUS * 2);
    const a = Math.random() * Math.PI * 2;

    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const z = randomFrom(-DEPTH * 10, DEPTH * 10);

    const color = getColor(x);
    particles.push(createSphere(x, y, z, color));
  }

  return particles;
}

/***************************************************
 *  ANIMATION LOOP
 ***************************************************/
function animate() {
  if (!paused) {
    particleGroup.rotation.z += 0.0019;
    particleGroup.rotation.x += 0.0004;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

/***************************************************
 *  SMART AUTOPAUSE WHEN HERO IS NOT VISIBLE
 ***************************************************/
function initHeroObserver() {
  const hero = document.getElementById("hero");

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      paused = !e.isIntersecting;
    });
  }, {
    threshold: 0.05
  });

  obs.observe(hero);
}

/***************************************************
 *  SCROLL REVEAL – INTERSECTION OBSERVER
 ***************************************************/
function initScrollReveal() {

  const revealItems = document.querySelectorAll(
    ".section, .card, .timeline-item"
  );

  const options = {
    threshold: 0.12,
    rootMargin: "0px 0px -60px 0px"
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, options);

  revealItems.forEach(el => observer.observe(el));
}

/***************************************************
 *  SMOOTH SCROLL FOR INTERNAL LINKS
 ***************************************************/
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

/***************************************************
 *  INIT
 ***************************************************/
document.addEventListener("DOMContentLoaded", () => {
  initParticleRing();
  initHeroObserver();
  initScrollReveal();
  initSmoothScroll();
});



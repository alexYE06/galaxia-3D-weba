const parametros = {
  cantidad: 60000,
  tamaño: 0.015,
  radio: 5,
  brazos: 5,
  giro: 1.6,
  dispersion: 0.35,
  potenciaDispersion: 3,
  colorInterior: '#ff6030',
  colorExterior: '#7838ff'
};

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

let geometry = null;
let material = null;
let puntos = null;

function generarGalaxia() {
  if (puntos !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(puntos);
  }

  geometry = new THREE.BufferGeometry();
  const posiciones = new Float32Array(parametros.cantidad * 3);
  const colores = new Float32Array(parametros.cantidad * 3);

  const colorAdentro = new THREE.Color(parametros.colorInterior);
  const colorAfuera = new THREE.Color(parametros.colorExterior);

  for (let i = 0; i < parametros.cantidad; i++) {
    const i3 = i * 3;
    const r = Math.random() * parametros.radio;

    const anguloBrazo = ((i % parametros.brazos) / parametros.brazos) * Math.PI * 2;
    const anguloGiro = r * parametros.giro;
    const anguloFinal = anguloBrazo + anguloGiro;

    const randomX = Math.pow(Math.random(), parametros.potenciaDispersion) * (Math.random() < 0.5 ? 1 : -1) * parametros.dispersion * r;
    const randomY = Math.pow(Math.random(), parametros.potenciaDispersion) * (Math.random() < 0.5 ? 1 : -1) * parametros.dispersion * r;
    const randomZ = Math.pow(Math.random(), parametros.potenciaDispersion) * (Math.random() < 0.5 ? 1 : -1) * parametros.dispersion * r;

    posiciones[i3] = Math.cos(anguloFinal) * r + randomX;
    posiciones[i3 + 1] = randomY;
    posiciones[i3 + 2] = Math.sin(anguloFinal) * r + randomZ;

    const colorMezclado = colorAdentro.clone();
    colorMezclado.lerp(colorAfuera, r / parametros.radio);

    colores[i3] = colorMezclado.r;
    colores[i3 + 1] = colorMezclado.g;
    colores[i3 + 2] = colorMezclado.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colores, 3));

  material = new THREE.PointsMaterial({
    size: parametros.tamaño,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  puntos = new THREE.Points(geometry, material);
  scene.add(puntos);
}

generarGalaxia();

// Dimensiones dinámicas
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Cámara
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);

// Ajusta distancia inicial de la cámara según la orientación (pantalla vertical de celular vs horizontal de PC)
function ajustarPosicionCamara() {
  if (sizes.width < sizes.height) {
    camera.position.set(0, 4.5, 7.5); // Más alejada en pantallas verticales para encajar la galaxia completa
  } else {
    camera.position.set(0, 3, 5);     // Posición estándar en monitores
  }
}
ajustarPosicionCamara();
scene.add(camera);

// Controles interactivos (Táctil + Ratón)
const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.5;
controls.maxDistance = 25;
controls.touches = {
  ONE: THREE.TOUCH.ROTATE, // 1 dedo: rotar
  TWO: THREE.TOUCH.DOLLY_PAN // 2 dedos: zoom (pellizco) y paneo
};

// Renderizador
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limita a 2 para fluidez en pantallas Retina/OLED móviles

// Evento Resize responsivo con soporte para giro de pantalla (orientationchange)
function onWindowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', onWindowResize);
window.addEventListener('orientationchange', onWindowResize);

// Animación
const clock = new THREE.Clock();

function animar() {
  const elapsedTime = clock.getElapsedTime();

  if (puntos) {
    puntos.rotation.y = elapsedTime * 0.08;
  }

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(animar);
}

animar();
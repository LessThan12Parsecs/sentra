import './style.css'
import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ alpha: true }) // Enable transparency
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000, 0) // Set clear color to black with 0 opacity
document.querySelector('#app').appendChild(renderer.domElement)

let geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight)
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    time: { value: 1.0 },
    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  },
  transparent: true,
})
let plane = new THREE.Mesh(geometry, material)
scene.add(plane)

camera.position.z = 5

function animate() {
  requestAnimationFrame(animate)

  renderer.render(scene, camera)
}

// Update time value by 0.1 every second
setInterval(() => {
  const myTextInput = document.getElementById('myTextInput')
  if (myTextInput && myTextInput.value !== '') {
    material.uniforms.time.value += 0.01
  }
}, 10); // Frequency of update

animate()

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight)
  // Re-create geometry to match new size
  scene.remove(plane)
  geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight)
  plane = new THREE.Mesh(geometry, material)
  scene.add(plane)
}

window.addEventListener('resize', onWindowResize)

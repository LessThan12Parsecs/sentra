import './style.css'
import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import nlp from 'compromise'
import plg from 'compromise-dates'
nlp.plugin(plg)
import { currentMonitor, appWindow, PhysicalPosition } from '@tauri-apps/api/window';


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
    time: { value: 0.0 },
    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    duration: {value: 0.0}
  },
  transparent: true,
})
let plane = new THREE.Mesh(geometry, material)
scene.add(plane)

camera.position.z = 5

let lastTime = 0; // Initialize lastTime for deltaTime calculation
async function animate(time = 0) {
  const deltaTime = time - lastTime; // Calculate deltaTime
  lastTime = time; // Update lastTime for the next frame

  if (running) {
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < taskDuration) {
      material.uniforms.time.value += deltaTime * 0.001; // Update time based on deltaTime
    } else {
      try {
        await appWindow.center();
      } catch (error) {
        console.error(error);
      }
      running = false; // Stop updating time after task duration
    }
  }
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

async function moveToMonitorBottomRight() {
  const monitor = await currentMonitor()
  const monitorWidth = monitor.size.width;
  const monitorHeight = monitor.size.height;

  const size = await appWindow.innerSize();

  const newX = monitorWidth - size.width; 
  const newY = monitorHeight - size.height;
  const newPos = new PhysicalPosition(newX,newY);
  await appWindow.setPosition(newPos); 
}


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

let running = false
let startTime = 0
let taskDuration = 0 // Duration in milliseconds

document.getElementById('myTextInput').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    let duration = nlp(this.value).durations().json()[0]
    if (duration) {
      let task = this.value.replace(new RegExp(`for\\s*${duration.text}`, 'i'), '').trim()
      taskDuration = (((duration.duration.week || 0) * 604800 + (duration.duration.day || 0) * 86400
       + (duration.duration.hour || 0) * 3600 + (duration.duration.minute || 0) * 60 + (duration.duration.second || 0)) * 1000)
      this.value = task
      startTime = Date.now()
      running = true
      moveToMonitorBottomRight()
      material.uniforms.time.value = 0.0
      material.uniforms.duration.value = taskDuration
    }
  }
})

animate()


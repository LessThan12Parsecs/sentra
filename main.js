import './style.css'
import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import nlp from 'compromise'
import plg from 'compromise-dates'
nlp.plugin(plg)
import { currentMonitor, appWindow, PhysicalPosition, PhysicalSize } from '@tauri-apps/api/window';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ alpha: true }) // Enable transparency
let lastPosition = await getBottomRightPosition(); // Variable that holds the last position of the window pre-centered, it initializes to bottom right.
let centerPos = await appWindow.innerPosition();

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

windowResetSize();

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
        await windowResetSize();
      } catch (error) {
        console.error(error);
      }
      running = false; // Stop updating time after task duration
    }
  }
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

async function moveToPosition(pos) {
  await appWindow.setPosition(pos); 
}

async function getBottomRightPosition(){
  const monitor = await currentMonitor()
  const monitorWidth = monitor.size.width;
  const monitorHeight = monitor.size.height;
  const size = await appWindow.innerSize();
  const newX = monitorWidth - size.width; 
  const newY = monitorHeight - size.height;
  const bottomRight = new PhysicalPosition(newX,newY);
  return bottomRight;
}

appWindow.onMoved(async () => {
  let newPos = await appWindow.innerPosition();
  if (newPos.x === centerPos.x && newPos.y === centerPos.y){
    return;
  }
  lastPosition = newPos;
});

// Handle window resize3
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

// Ugly workaround to the border no being rendered correctly. I think it might be a tauri/web renderer issue
async function windowResetSize(){
  const size = await appWindow.innerSize();
  // Trigger a resize to the same size, effectively forcing a re-render
  await appWindow.setSize(new PhysicalSize(size.width * 2, size.height * 1.5));
  await appWindow.setSize(new PhysicalSize(size.width, size.height)); 
}

window.addEventListener('resize', onWindowResize)

let running = false
let startTime = 0
let taskDuration = 0 // Duration in milliseconds

document.getElementById('myTextInput').addEventListener('keypress', async function(event) {
  if (event.key === 'Enter') {
    const processInput = (endTime, duration) => {
      let taskDurationMs = 0;
      let task = '';
      if (endTime) {
        task = this.value.replace(endTime.text, '').trim();
        taskDurationMs = new Date(endTime.dates.end).getTime() - Date.now();
      } else if (duration) {
        task = this.value.replace(new RegExp(`for\\s*${duration.text}`, 'i'), '').trim();
        taskDurationMs = (((duration.duration.week || 0) * 604800 + (duration.duration.day || 0) * 86400
          + (duration.duration.hour || 0) * 3600 + (duration.duration.minute || 0) * 60 + (duration.duration.second || 0)) * 1000);
      }
      return { task, taskDurationMs };
    };

    let endTime = nlp(this.value).dates().json()[0];
    let duration = nlp(this.value).durations().json()[0];
    const { task, taskDurationMs } = processInput(endTime, duration);

    if (taskDurationMs > 0) {
      this.value = task;
      taskDuration = taskDurationMs;
      startTime = Date.now();
      running = true;
      await moveToPosition(lastPosition);
      material.uniforms.time.value = 0.0;
      material.uniforms.duration.value = taskDuration;
    }
  }
})

animate()


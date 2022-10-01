import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { HemisphereLight } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffaaee, 0.3)

// Point Light
const pointLight = new THREE.PointLight(0xffddaa, 0.5)
// Decay won't work if distance is not set
pointLight.decay = 2 
// You can set distance as the 3rd argument on initiation as well
pointLight.distance = 5
pointLight.position.y = 1
pointLight.position.z = 1
console.log(pointLight)

// Directional Light
const directionalLight = new THREE.DirectionalLight()
directionalLight.color = new THREE.Color(0xffffff)
directionalLight.intensity = 0.3

// Hemisphere Light
const hemiSphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff)
hemiSphereLight.intensity = 0.5

// Area Light
const areaLight = new THREE.RectAreaLight(0x0000ff,3, 1, 1)


scene.add(ambientLight, pointLight, directionalLight, directionalLight.target, hemiSphereLight, areaLight)



// Add lights to DEBUG GUI
const AmbientLightFolder = gui.addFolder('Ambient Light')
AmbientLightFolder.add(ambientLight, 'intensity', 0, 1, 0.1)
AmbientLightFolder.addColor(ambientLight, 'color')
const pointLightFolder = gui.addFolder('Point Light')
pointLightFolder.add(pointLight, 'intensity').min(0).max(1).step(0.1)
pointLightFolder.addColor(pointLight,'color')
pointLightFolder.add(pointLight.position, 'x', 0, 20, 0.5)
pointLightFolder.add(pointLight.position, 'y', 0, 20, 0.5)
pointLightFolder.add(pointLight.position, 'z', 0, 20, 0.5)
pointLightFolder.add(pointLight, 'decay', 1, 10, 0.1)
pointLightFolder.add(pointLight, 'distance', 1, 10, 0.1)


const directionalLightFolder = gui.addFolder('Directional Light')
directionalLightFolder.add(directionalLight, 'intensity', 0,1,0.1)
directionalLightFolder.addColor(directionalLight, 'color')
directionalLightFolder.add(directionalLight.target.position, 'x', -5, 5, 0.1)
directionalLightFolder.add(directionalLight.target.position, 'y', -5, 5, 0.1)
directionalLightFolder.add(directionalLight.target.position, 'z', -5, 5, 0.1)

const hemiSphereLightFolder = gui.addFolder('HemiSphere Light')
hemiSphereLightFolder.add(hemiSphereLight, 'intensity',0 ,1, 0.1)
hemiSphereLightFolder.addColor(hemiSphereLight, 'color').name('Sky Color')
hemiSphereLightFolder.addColor(hemiSphereLight, 'groundColor').name('Ground Color')

const areaLightFolder = gui.addFolder('Area Light')
areaLightFolder.add(areaLight, 'intensity', 0, 5, 0.1)
areaLightFolder.add(areaLight, 'height', 0, 3, 0.1)
areaLightFolder.add(areaLight.position, 'x', -5, 5, 0.1)
areaLightFolder.add(areaLight.position, 'y', -5, 5, 0.1)
areaLightFolder.add(areaLight.position, 'z', -5, 5, 0.1)

console.log(areaLight)
const property ={
    thriller: thrillerLightingEffect,
    calmDown: calmDown
}
gui.add(property,'thriller').name('Thriller Mode')
gui.add(property, 'calmDown').name('Dreamy Mode')


/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let poinLightBlinkCounter = 0
let isThriller = false
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    if (poinLightBlinkCounter % 20 === 0 && isThriller) {
        pointLight.distance = Math.random() * 5
    }
    poinLightBlinkCounter++
    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    areaLight.lookAt(cube.position)


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

function thrillerLightingEffect(){
    isThriller = true
    ambientLight.intensity =0.01
    directionalLight.intensity=0.01
    hemiSphereLight.intensity=0.01
    areaLight.intensity = 0.9
    areaLight.height = 1
    areaLight.position.set(-0.4,1.1,-1.5)
}

function calmDown(){
    isThriller = false
    pointLight.intensity = 0.5
    ambientLight.intensity = 0.3
    directionalLight.intensity = 0.3
    hemiSphereLight.intensity = 0.5
    areaLight.intensity = 3
    areaLight.height = 1
    areaLight.position.set(0,1,1)

}
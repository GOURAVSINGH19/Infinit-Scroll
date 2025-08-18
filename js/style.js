import Lenis from 'lenis'
import gsap from 'gsap'
import { CustomEase } from 'gsap/all'
import * as THREE from 'three'

import { resizeThreeCanvas, calcFov, debounce } from './utils'

import baseVertex from '../shaders/baseVertex.glsl'
import baseFragment from '../shaders/baseFragment.glsl'

gsap.registerPlugin(CustomEase)

// smooth scroll (lenis)
let scroll = {
  scrollY: window.scrollY,
  scrollVelocity: 0
}

const lenis = new Lenis()

lenis.on('scroll', (e) => {
  scroll.scrollY = window.scrollY
  scroll.scrollVelocity = e.velocity
})

function scrollRaf(time) {
  lenis.raf(time)
  requestAnimationFrame(scrollRaf)
}

requestAnimationFrame(scrollRaf)

const setMediaStore = (scrollY) => {
  const media = [...document.querySelectorAll('[data-webgl-media]')]

  mediaStore = media.map((media, i) => {
    observer.observe(media)

    media.dataset.index = String(i)

    const bounds = media.getBoundingClientRect()
    const imageMaterial = material.clone()

    const imageMesh = new THREE.Mesh(geometry, imageMaterial)

    let texture = null

    texture = new THREE.Texture(media)
    texture.needsUpdate = true

    imageMaterial.uniforms.uTexture.value = texture
    imageMaterial.uniforms.uTextureSize.value.x = media.naturalWidth
    imageMaterial.uniforms.uTextureSize.value.y = media.naturalHeight
    imageMaterial.uniforms.uQuadSize.value.x = bounds.width
    imageMaterial.uniforms.uQuadSize.value.y = bounds.height
    imageMaterial.uniforms.uBorderRadius.value = getComputedStyle(media).borderRadius.replace('px', '')

    imageMesh.scale.set(bounds.width, bounds.height, 1)

    if (!(bounds.top >= 0 && bounds.top <= window.innerHeight)) {
      imageMesh.position.y = 2 * window.innerHeight
    }

    scene.add(imageMesh)

    return {
      media,
      material: imageMaterial,
      mesh: imageMesh,
      width: bounds.width,
      height: bounds.height,
      top: bounds.top + scrollY,
      left: bounds.left,
      isInView: bounds.top >= -500 && bounds.top <= window.innerHeight + 500,
    }
  })
}

const setPositions = () => {
  mediaStore.forEach((object) => {
    if (object.isInView) {
      object.mesh.position.x = object.left - window.innerWidth / 2 + object.width / 2
      object.mesh.position.y = -object.top + window.innerHeight / 2 - object.height / 2 + scroll.scrollY
    }
  })
}

const CAMERA_POS = 500

const canvas = document.querySelector('canvas')

let observer
let mediaStore
let scene
let geometry
let material

// create intersection observer to only render in view elements
observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const index = entry.target.dataset.index

      if (index) {
        mediaStore[parseInt(index)].isInView = entry.isIntersecting
      }
    })
  },
  { rootMargin: '500px 0px 500px 0px' }
)

// scene
scene = new THREE.Scene()

// camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 10, 1000)
camera.position.z = CAMERA_POS
camera.fov = calcFov(CAMERA_POS)
camera.updateProjectionMatrix()

// geometry and material
geometry = new THREE.PlaneGeometry(1, 1, 100, 100)
material = new THREE.ShaderMaterial({
  uniforms: {
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uTime: { value: 0 },
    uCursor: { value: new THREE.Vector2(0.5, 0.5) },
    uScrollVelocity: { value: 0 },
    uTexture: { value: null },
    uTextureSize: { value: new THREE.Vector2(100, 100) },
    uQuadSize: { value: new THREE.Vector2(100, 100) },
    uBorderRadius: { value: 0 },
  },
  vertexShader: baseVertex,
  fragmentShader:  baseFragment,
  glslVersion: THREE.GLSL3
})

// renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// render loop
const render = (time = 0) => {
  time /= 1000

  mediaStore.forEach((object) => {
    if (object.isInView) {
      object.material.uniforms.uResolution.value.x = window.innerWidth
      object.material.uniforms.uResolution.value.y = window.innerHeight
      object.material.uniforms.uTime.value = time
      object.material.uniforms.uScrollVelocity.value = scroll.scrollVelocity
    } else {
      object.mesh.position.y = 2 * window.innerHeight
    }
  })

  setPositions()

  renderer.render(scene, camera)

  requestAnimationFrame(render)
}

window.addEventListener('resize', debounce(() => {
  const fov = calcFov(CAMERA_POS)

  resizeThreeCanvas({ camera, fov, renderer })

  mediaStore.forEach((object) => {
    const bounds = object.media.getBoundingClientRect()
    object.mesh.scale.set(bounds.width, bounds.height, 1)
    object.width = bounds.width
    object.height = bounds.height
    object.top = bounds.top + scroll.scrollY
    object.left = bounds.left
    object.isInView = bounds.top >= 0 && bounds.top <= window.innerHeight,
    object.material.uniforms.uTextureSize.value.x = object.media.naturalWidth
    object.material.uniforms.uTextureSize.value.y = object.media.naturalHeight
    object.material.uniforms.uQuadSize.value.x = bounds.width
    object.material.uniforms.uQuadSize.value.y = bounds.height
    object.material.uniforms.uBorderRadius.value = getComputedStyle(object.media).borderRadius.replace('px', '')
  })
}))

window.addEventListener('load', () => {
  // media details
  setMediaStore(scroll.scrollY)

  requestAnimationFrame(render)

  document.body.classList.remove('loading')
})
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

const LIGHT_TYPES = new Set(['pointlight','spotlight','dirlight'])

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas
    this.groupMap = {}
    this.lightMap = {}   // id -> THREE light
    this.selectedId = null
    this.onObjectChange = null
    this.onSelect = null
    this._animFrame = null
    this._init()
  }

  _init() {
    const w = this.canvas.clientWidth || 800
    const h = this.canvas.clientHeight || 600

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(w, h)
    this.renderer.shadowMap.enabled = true

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1e1e2e)

    this.camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000)
    this.camera.position.set(8, 6, 10)
    this.camera.lookAt(0, 0, 0)

    // Default ambient (will be overridden by level settings)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(this.ambientLight)

    this.grid = new THREE.GridHelper(50, 50, 0x444466, 0x333355)
    this.scene.add(this.grid)

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement)
    this.orbit.enableDamping = true
    this.orbit.dampingFactor = 0.08
    this.orbit.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }

    this.transform = new TransformControls(this.camera, this.renderer.domElement)
    this.transform.setMode('translate')
    this.scene.add(this.transform)

    this.transform.addEventListener('dragging-changed', e => { this.orbit.enabled = !e.value })
    this.transform.addEventListener('objectChange', () => {
      if (!this.selectedId) return
      const group = this.groupMap[this.selectedId]
      if (!group) return
      this.onObjectChange && this.onObjectChange(this.selectedId, {
        position: { x:+group.position.x.toFixed(3), y:+group.position.y.toFixed(3), z:+group.position.z.toFixed(3) },
        rotation: {
          x:+THREE.MathUtils.radToDeg(group.rotation.x).toFixed(2),
          y:+THREE.MathUtils.radToDeg(group.rotation.y).toFixed(2),
          z:+THREE.MathUtils.radToDeg(group.rotation.z).toFixed(2),
        },
        scale: { x:+group.scale.x.toFixed(3), y:+group.scale.y.toFixed(3), z:+group.scale.z.toFixed(3) },
      })
      // Sync light position
      const light = this.lightMap[this.selectedId]
      if (light) light.position.copy(group.position)
    })

    this.renderer.domElement.addEventListener('pointerdown', this._onPointerDown.bind(this))
    this._ro = new ResizeObserver(() => this._onResize())
    this._ro.observe(this.canvas.parentElement)
    this._animate()
  }

  applyLevelSettings(level) {
    if (!level) return
    this.scene.background = new THREE.Color(level.skyColor || '#111122')
    if (level.fogEnabled) {
      const size = level.mapSize || 50
      this.scene.fog = new THREE.Fog(new THREE.Color(level.skyColor||'#111122'), size, size*3)
    } else {
      this.scene.fog = null
    }
    this.ambientLight.color.set(level.ambientColor || '#ffffff')
    this.ambientLight.intensity = level.ambientIntensity ?? 0.5

    // Resize grid
    const size = level.mapSize || 50
    this.scene.remove(this.grid)
    this.grid.dispose ? this.grid.dispose() : null
    this.grid = new THREE.GridHelper(size*2, size*2, 0x444466, 0x333355)
    this.scene.add(this.grid)

    // Set initial camera
    if (level.cameraPosition) {
      const p = level.cameraPosition
      const t = level.cameraLookAt || {x:0,y:0,z:0}
      this.camera.position.set(p.x, p.y, p.z)
      this.orbit.target.set(t.x, t.y, t.z)
      this.camera.fov = level.cameraFOV || 60
      this.camera.updateProjectionMatrix()
      this.orbit.update()
    }
  }

  setCameraPreset(preset) {
    const presets = {
      perspective: { pos:[8,6,10], target:[0,0,0] },
      topdown:     { pos:[0,30,0],  target:[0,0,0] },
      isometric:   { pos:[20,20,20], target:[0,0,0] },
      front:       { pos:[0,5,20],  target:[0,0,0] },
      side:        { pos:[20,5,0],  target:[0,0,0] },
    }
    const p = presets[preset]
    if (!p) return
    this.camera.position.set(...p.pos)
    this.orbit.target.set(...p.target)
    this.orbit.update()
  }

  getCameraState() {
    return {
      position: { x:+this.camera.position.x.toFixed(2), y:+this.camera.position.y.toFixed(2), z:+this.camera.position.z.toFixed(2) },
      lookAt: { x:+this.orbit.target.x.toFixed(2), y:+this.orbit.target.y.toFixed(2), z:+this.orbit.target.z.toFixed(2) },
      fov: +this.camera.fov.toFixed(0),
    }
  }

  _onPointerDown(e) {
    if (e.button !== 0 || this.transform.dragging) return
    const rect = this.canvas.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX-rect.left)/rect.width)*2-1,
      -((e.clientY-rect.top)/rect.height)*2+1
    )
    const ray = new THREE.Raycaster()
    ray.setFromCamera(mouse, this.camera)
    const meshes = []
    for (const [id, group] of Object.entries(this.groupMap)) {
      group.traverse(c => { if (c.isMesh) { c._objectId=id; meshes.push(c) } })
    }
    const hits = ray.intersectObjects(meshes, false)
    if (hits.length) {
      const id = hits[0].object._objectId
      if (id) { this.selectObject(id); this.onSelect&&this.onSelect(id) }
    } else {
      this.deselectAll(); this.onSelect&&this.onSelect(null)
    }
  }

  _animate() {
    this._animFrame = requestAnimationFrame(this._animate.bind(this))
    this.orbit.update()
    this.renderer.render(this.scene, this.camera)
  }

  _onResize() {
    const p = this.canvas.parentElement; if (!p) return
    const w=p.clientWidth, h=p.clientHeight
    this.camera.aspect=w/h; this.camera.updateProjectionMatrix()
    this.renderer.setSize(w,h)
  }

  _makeGeometry(type) {
    switch(type) {
      case 'sphere':   return new THREE.SphereGeometry(0.5,32,32)
      case 'cylinder': return new THREE.CylinderGeometry(0.5,0.5,1,32)
      case 'cone':     return new THREE.ConeGeometry(0.5,1,32)
      case 'plane':    return new THREE.PlaneGeometry(1,1)
      default:         return new THREE.BoxGeometry(1,1,1)
    }
  }

  _makeLightGizmo(type, color) {
    // Visible editor icon for lights
    let geo
    if (type==='pointlight') geo = new THREE.SphereGeometry(0.2, 16, 16)
    else if (type==='dirlight') geo = new THREE.ConeGeometry(0.15,0.5,8)
    else geo = new THREE.CylinderGeometry(0.1,0.25,0.4,8)
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color||'#ffdd88'), wireframe: false, transparent:true, opacity:0.85 })
    const mesh = new THREE.Mesh(geo, mat)
    // Lens flare ring
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.25,0.35,16), new THREE.MeshBasicMaterial({color:new THREE.Color(color||'#ffdd88'),side:THREE.DoubleSide,transparent:true,opacity:0.4}))
    ring.rotation.x = -Math.PI/2
    const group = new THREE.Group()
    group.add(mesh); group.add(ring)
    return group
  }

  _addLight(obj) {
    let light
    const col = new THREE.Color(obj.lightColor||obj.color||'#ffffff')
    const intensity = obj.lightIntensity ?? 1.0
    if (obj.type==='pointlight') {
      light = new THREE.PointLight(col, intensity, obj.lightDistance||20)
    } else if (obj.type==='dirlight') {
      light = new THREE.DirectionalLight(col, intensity)
      light.position.set(0,0,0)
    } else if (obj.type==='spotlight') {
      light = new THREE.SpotLight(col, intensity, obj.lightDistance||30, THREE.MathUtils.degToRad(obj.lightAngle||45))
    }
    if (!light) return
    if (obj.castShadow !== false) light.castShadow = true
    light.position.set(obj.position.x, obj.position.y, obj.position.z)
    this.scene.add(light)
    this.lightMap[obj.id] = light
  }

  addObject(obj) {
    if (this.groupMap[obj.id]) return
    const group = new THREE.Group()
    group.name = obj.id

    if (LIGHT_TYPES.has(obj.type)) {
      // Editor gizmo only
      const gizmo = this._makeLightGizmo(obj.type, obj.lightColor||obj.color)
      group.add(gizmo)
      this._addLight(obj)
    } else if (obj.parts && obj.parts.length>0) {
      for (const part of obj.parts) {
        const mesh = new THREE.Mesh(this._makeGeometry(part.type), new THREE.MeshStandardMaterial({color:part.color,roughness:0.6}))
        mesh.position.set(part.position.x,part.position.y,part.position.z)
        mesh.rotation.set(THREE.MathUtils.degToRad(part.rotation.x),THREE.MathUtils.degToRad(part.rotation.y),THREE.MathUtils.degToRad(part.rotation.z))
        mesh.scale.set(part.scale.x,part.scale.y,part.scale.z)
        mesh.castShadow=true; mesh.receiveShadow=true
        group.add(mesh)
      }
    } else {
      const mesh = new THREE.Mesh(this._makeGeometry(obj.type), new THREE.MeshStandardMaterial({color:obj.color||'#4a90e2',roughness:0.6,metalness:0.1}))
      mesh.castShadow=true; mesh.receiveShadow=true
      group.add(mesh)
    }

    this._applyTransform(group, obj)
    group.visible = obj.visible !== false
    this.scene.add(group)
    this.groupMap[obj.id] = group
  }

  removeObject(id) {
    const group = this.groupMap[id]
    if (!group) return
    if (this.selectedId===id) { this.transform.detach(); this.selectedId=null }
    this.scene.remove(group)
    group.traverse(c => { if(c.isMesh){c.geometry.dispose();c.material.dispose()} })
    delete this.groupMap[id]
    const light = this.lightMap[id]
    if (light) { this.scene.remove(light); delete this.lightMap[id] }
  }

  updateObject(id, changes) {
    const group = this.groupMap[id]
    if (!group) return
    if (changes.color||changes.lightColor||changes.lightIntensity||changes.lightDistance||changes.parts!==undefined) {
      const fullObj = { ...changes }
      const wasSelected = this.selectedId===id
      this.removeObject(id)
      this.addObject(fullObj)
      if (wasSelected) this.selectObject(id)
      return
    }
    if (changes.visible!==undefined) group.visible = changes.visible
    this._applyTransform(group, changes)
    const light = this.lightMap[id]
    if (light && changes.position) light.position.set(changes.position.x, changes.position.y, changes.position.z)
  }

  syncObjects(objects) {
    const ids = new Set(objects.map(o=>o.id))
    for (const id of Object.keys(this.groupMap)) { if(!ids.has(id)) this.removeObject(id) }
    for (const obj of objects) {
      if (!this.groupMap[obj.id]) {
        this.addObject(obj)
      } else {
        this._applyTransform(this.groupMap[obj.id], obj)
        this.groupMap[obj.id].visible = obj.visible !== false
        // Sync single-mesh color
        if (!LIGHT_TYPES.has(obj.type) && (!obj.parts||obj.parts.length===0)) {
          this.groupMap[obj.id].traverse(c => { if(c.isMesh && c.material.type==='MeshStandardMaterial') c.material.color.set(obj.color) })
        }
        // Sync light position
        const light = this.lightMap[obj.id]
        if (light) light.position.set(obj.position.x, obj.position.y, obj.position.z)
      }
    }
  }

  _applyTransform(group, obj) {
    if (obj.position) group.position.set(obj.position.x, obj.position.y, obj.position.z)
    if (obj.rotation) group.rotation.set(
      THREE.MathUtils.degToRad(obj.rotation.x),
      THREE.MathUtils.degToRad(obj.rotation.y),
      THREE.MathUtils.degToRad(obj.rotation.z),
    )
    if (obj.scale) group.scale.set(obj.scale.x, obj.scale.y, obj.scale.z)
  }

  selectObject(id) {
    const group = this.groupMap[id]; if (!group) return
    this.selectedId = id; this.transform.attach(group)
  }
  deselectAll() { this.selectedId=null; this.transform.detach() }
  setTransformMode(mode) { this.transform.setMode(mode) }

  destroy() {
    cancelAnimationFrame(this._animFrame)
    this._ro?.disconnect()
    this.renderer.dispose()
    this.transform.dispose()
    this.orbit.dispose()
  }
}

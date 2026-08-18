import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { useStore } from '../store'

const TYPES = ['cube','sphere','cylinder','cone','plane']
const TYPE_ICONS = { cube:'⬛', sphere:'⚽', cylinder:'🥫', cone:'🔺', plane:'▱' }

const BTN = ({ onClick, children, active, color, title }) => (
  <button onClick={onClick} title={title} style={{
    padding: '4px 10px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
    background: active ? (color || '#4a90e2') : '#1e1e30',
    color: active ? '#fff' : '#aaaacc',
  }}>{children}</button>
)

export default function SpriteEditor({ objectId, onClose }) {
  const canvasRef = useRef()
  const sceneRef = useRef()
  const [selectedPartId, setSelectedPartId] = useState(null)
  const [transformMode, setTransformMode] = useState('translate')

  const { objects, addPart, updatePart, removePart, duplicatePart } = useStore()
  const obj = objects.find(o => o.id === objectId)

  useEffect(() => {
    if (!canvasRef.current || !obj) return
    const canvas = canvasRef.current
    const w = canvas.clientWidth, h = canvas.clientHeight

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.shadowMap.enabled = true

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x181828)

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
    camera.position.set(3, 3, 5)
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const sun = new THREE.DirectionalLight(0xffffff, 1)
    sun.position.set(5, 10, 5); sun.castShadow = true
    scene.add(sun)
    scene.add(new THREE.GridHelper(10, 10, 0x333355, 0x222244))

    const orbit = new OrbitControls(camera, renderer.domElement)
    orbit.enableDamping = true; orbit.dampingFactor = 0.08
    orbit.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }

    const transform = new TransformControls(camera, renderer.domElement)
    transform.setMode(transformMode)
    scene.add(transform)
    transform.addEventListener('dragging-changed', e => { orbit.enabled = !e.value })

    const meshMap = {}

    const makeMesh = (part) => {
      let geo
      switch (part.type) {
        case 'sphere':   geo = new THREE.SphereGeometry(0.5, 24, 24); break
        case 'cylinder': geo = new THREE.CylinderGeometry(0.5,0.5,1,24); break
        case 'cone':     geo = new THREE.ConeGeometry(0.5,1,24); break
        case 'plane':    geo = new THREE.PlaneGeometry(1,1); break
        default:         geo = new THREE.BoxGeometry(1,1,1)
      }
      const mat = new THREE.MeshStandardMaterial({ color: part.color || '#4a90e2', roughness: 0.6 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.castShadow = true; mesh.receiveShadow = true
      mesh.position.set(part.position.x, part.position.y, part.position.z)
      mesh.rotation.set(
        THREE.MathUtils.degToRad(part.rotation.x),
        THREE.MathUtils.degToRad(part.rotation.y),
        THREE.MathUtils.degToRad(part.rotation.z),
      )
      mesh.scale.set(part.scale.x, part.scale.y, part.scale.z)
      mesh._partId = part.id
      scene.add(mesh)
      meshMap[part.id] = mesh
      return mesh
    }

    const parts = obj.parts && obj.parts.length > 0 ? obj.parts : [
      { id: '__single__', type: obj.type, position: {x:0,y:0,z:0}, rotation: {x:0,y:0,z:0}, scale: {x:1,y:1,z:1}, color: obj.color }
    ]
    for (const p of parts) makeMesh(p)

    // Click to select part
    renderer.domElement.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || transform.dragging) return
      const rect = canvas.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      const ray = new THREE.Raycaster()
      ray.setFromCamera(mouse, camera)
      const hits = ray.intersectObjects(Object.values(meshMap))
      if (hits.length) {
        const mesh = hits[0].object
        setSelectedPartId(mesh._partId)
        transform.attach(mesh)
      } else {
        setSelectedPartId(null)
        transform.detach()
      }
    })

    // Save transform changes back to store
    transform.addEventListener('objectChange', () => {
      const mesh = transform.object
      if (!mesh || mesh._partId === '__single__') return
      updatePart(objectId, mesh._partId, {
        position: { x: +mesh.position.x.toFixed(3), y: +mesh.position.y.toFixed(3), z: +mesh.position.z.toFixed(3) },
        rotation: {
          x: +THREE.MathUtils.radToDeg(mesh.rotation.x).toFixed(2),
          y: +THREE.MathUtils.radToDeg(mesh.rotation.y).toFixed(2),
          z: +THREE.MathUtils.radToDeg(mesh.rotation.z).toFixed(2),
        },
        scale: { x: +mesh.scale.x.toFixed(3), y: +mesh.scale.y.toFixed(3), z: +mesh.scale.z.toFixed(3) },
      })
    })

    transform.setMode(transformMode)

    let af
    const animate = () => {
      af = requestAnimationFrame(animate)
      orbit.update()
      renderer.render(scene, camera)
    }
    animate()

    sceneRef.current = { renderer, scene, camera, orbit, transform, meshMap, makeMesh }

    return () => {
      cancelAnimationFrame(af)
      orbit.dispose(); transform.dispose(); renderer.dispose()
    }
  }, [objectId])

  // Sync transform mode
  useEffect(() => {
    sceneRef.current?.transform.setMode(transformMode)
  }, [transformMode])

  // Sync part color changes
  const syncPartColor = (partId, color) => {
    const mesh = sceneRef.current?.meshMap[partId]
    if (mesh) mesh.material.color.set(color)
    updatePart(objectId, partId, { color })
  }

  // Mirror on axis
  const mirror = (axis) => {
    const mesh = sceneRef.current?.meshMap[selectedPartId]
    if (!mesh || !selectedPartId || selectedPartId === '__single__') return
    mesh.scale[axis] *= -1
    updatePart(objectId, selectedPartId, {
      scale: { x: +mesh.scale.x.toFixed(3), y: +mesh.scale.y.toFixed(3), z: +mesh.scale.z.toFixed(3) }
    })
  }

  const handleAddPart = (type) => {
    const id = addPart(objectId, type)
    // Add mesh to preview scene
    if (sceneRef.current) {
      const part = { id, type, position:{x:0,y:1,z:0}, rotation:{x:0,y:0,z:0}, scale:{x:1,y:1,z:1}, color:'#4a90e2' }
      sceneRef.current.makeMesh(part)
    }
  }

  const selectedPart = obj?.parts?.find(p => p.id === selectedPartId)
  const hasParts = obj?.parts && obj.parts.length > 0

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:'#13131f', borderRadius:12, border:'1px solid #2a2a3e',
        width:'90vw', height:'90vh', display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderBottom:'1px solid #2a2a3e', background:'#0c0c18' }}>
          <span style={{ fontSize:14, fontWeight:700, color:'#4a90e2' }}>✏️ Sprite Editor — {obj?.name}</span>
          <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
            {['translate','rotate','scale'].map(m => (
              <BTN key={m} active={transformMode===m} onClick={() => setTransformMode(m)}>
                {m === 'translate' ? '↔ Move' : m === 'rotate' ? '↻ Rotate' : '⤡ Scale'}
              </BTN>
            ))}
            {selectedPartId && selectedPartId !== '__single__' && (
              <>
                <BTN onClick={() => mirror('x')} title="Mirror X">⇔ X</BTN>
                <BTN onClick={() => mirror('y')} title="Mirror Y">⇕ Y</BTN>
                <BTN onClick={() => mirror('z')} title="Mirror Z">⇄ Z</BTN>
                <BTN onClick={() => duplicatePart(objectId, selectedPartId)} title="Clone part">⧉ Clone</BTN>
                <BTN onClick={() => { removePart(objectId, selectedPartId); setSelectedPartId(null) }} color="#c0392b" title="Delete part">✕ Delete</BTN>
              </>
            )}
            <BTN onClick={onClose} color="#333">✕ Close</BTN>
          </div>
        </div>

        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
          {/* Left: add parts */}
          <div style={{ width:160, borderRight:'1px solid #2a2a3e', padding:12, display:'flex', flexDirection:'column', gap:8, background:'#0f0f1a' }}>
            <div style={{ fontSize:11, color:'#6666aa', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Add Part</div>
            {TYPES.map(t => (
              <button key={t} onClick={() => handleAddPart(t)} style={{
                padding:'8px', borderRadius:6, border:'1px solid #2a2a3e',
                background:'#1a1a2e', color:'#c0c0e0', cursor:'pointer', fontSize:13,
                display:'flex', alignItems:'center', gap:8,
              }}>
                <span>{TYPE_ICONS[t]}</span>{t}
              </button>
            ))}

            {hasParts && (
              <>
                <div style={{ fontSize:11, color:'#6666aa', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginTop:8 }}>Parts</div>
                {obj.parts.map(p => (
                  <div key={p.id} onClick={() => {
                    setSelectedPartId(p.id)
                    const mesh = sceneRef.current?.meshMap[p.id]
                    if (mesh) sceneRef.current.transform.attach(mesh)
                  }} style={{
                    padding:'5px 8px', borderRadius:5, cursor:'pointer', fontSize:12,
                    background: selectedPartId === p.id ? '#1e2840' : '#131320',
                    border: selectedPartId === p.id ? '1px solid #4a90e2' : '1px solid #2a2a3e',
                    color: '#c0c0e0',
                    display:'flex', alignItems:'center', gap:6,
                  }}>
                    <span>{TYPE_ICONS[p.type]}</span>
                    <span style={{ flex:1 }}>{p.type}</span>
                    <input type="color" value={p.color} onClick={e => e.stopPropagation()}
                      onChange={e => syncPartColor(p.id, e.target.value)}
                      style={{ width:20, height:20, border:'none', background:'none', cursor:'pointer' }} />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Center: 3D preview */}
          <div style={{ flex:1, position:'relative' }}>
            <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />
            <div style={{ position:'absolute', bottom:8, left:8, color:'#33334a', fontSize:11, pointerEvents:'none' }}>
              Right-drag to orbit · Scroll to zoom · Click to select part
            </div>
          </div>

          {/* Right: part properties */}
          {selectedPart && (
            <div style={{ width:200, borderLeft:'1px solid #2a2a3e', padding:12, background:'#0f0f1a', overflowY:'auto' }}>
              <div style={{ fontSize:11, color:'#6666aa', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Part Properties</div>
              <div style={{ fontSize:12, color:'#8888aa', marginBottom:8 }}>{selectedPart.type}</div>

              {['position','rotation','scale'].map(prop => (
                <div key={prop} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:10, color:'#6666aa', textTransform:'uppercase', marginBottom:4 }}>{prop}</div>
                  {['x','y','z'].map(axis => (
                    <div key={axis} style={{ display:'flex', alignItems:'center', gap:4, marginBottom:3 }}>
                      <span style={{ color:'#6666aa', fontSize:11, width:12 }}>{axis.toUpperCase()}</span>
                      <input type="number" step="0.1"
                        value={selectedPart[prop][axis]}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0
                          updatePart(objectId, selectedPartId, { [prop]: { ...selectedPart[prop], [axis]: val } })
                          const mesh = sceneRef.current?.meshMap[selectedPartId]
                          if (mesh && prop === 'position') mesh.position[axis] = val
                          if (mesh && prop === 'scale') mesh.scale[axis] = val
                          if (mesh && prop === 'rotation') mesh.rotation[axis] = THREE.MathUtils.degToRad(val)
                        }}
                        style={{ flex:1, background:'#1a1a2e', border:'1px solid #2a2a3e', color:'#e0e0f0', padding:'2px 4px', borderRadius:3, fontSize:11 }}
                      />
                    </div>
                  ))}
                </div>
              ))}

              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:10, color:'#6666aa', textTransform:'uppercase', marginBottom:4 }}>Color</div>
                <input type="color" value={selectedPart.color}
                  onChange={e => syncPartColor(selectedPartId, e.target.value)}
                  style={{ width:'100%', height:32, border:'none', background:'none', cursor:'pointer' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

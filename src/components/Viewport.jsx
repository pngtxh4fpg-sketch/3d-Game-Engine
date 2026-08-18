import { useEffect, useRef, useState } from 'react'
import { useStore, getCurrentLevel } from '../store'
import { SceneManager } from '../engine/SceneManager'
import { ScriptRuntime } from '../engine/ScriptRuntime'

export default function Viewport() {
  const canvasRef = useRef()
  const sceneRef = useRef()
  const runtimeRef = useRef()
  const [transformMode, setTransformMode] = useState('translate')
  const [gameResult, setGameResult] = useState(null)

  const store = useStore()
  const { selectedId, selectObject, updateObject, updateLevel, mode, currentLevelId } = store
  const level = getCurrentLevel(store)
  const objects = level?.objects || []
  const uiElements = level?.uiElements || []

  // ── EDIT MODE ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'edit') return
    const canvas = canvasRef.current; if (!canvas) return
    const sm = new SceneManager(canvas)
    sceneRef.current = sm
    sm.onSelect = id => selectObject(id)
    sm.onObjectChange = (id, changes) => updateObject(id, changes)
    return () => { sm.destroy(); sceneRef.current = null }
  }, [mode])

  // Apply level settings to scene
  useEffect(() => {
    if (mode !== 'edit') return
    sceneRef.current?.applyLevelSettings(level)
  }, [mode, currentLevelId, level?.skyColor, level?.mapSize, level?.fogEnabled, level?.ambientColor, level?.ambientIntensity, level?.cameraPosition, level?.cameraLookAt, level?.cameraFOV])

  useEffect(() => {
    if (mode !== 'edit') return
    sceneRef.current?.syncObjects(objects)
  }, [objects, mode])

  useEffect(() => {
    if (mode !== 'edit') return
    if (selectedId) sceneRef.current?.selectObject(selectedId)
    else sceneRef.current?.deselectAll()
  }, [selectedId, mode])

  useEffect(() => {
    if (mode !== 'edit') return
    sceneRef.current?.setTransformMode(transformMode)
  }, [transformMode, mode])

  // ── PLAY MODE ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'play') return
    const canvas = canvasRef.current; if (!canvas) return
    setGameResult(null)
    const rt = new ScriptRuntime(canvas, objects, uiElements, level)
    runtimeRef.current = rt
    rt.onGameEnd = win => setGameResult(win ? 'win' : 'lose')
    return () => { rt.destroy(); runtimeRef.current = null }
  }, [mode])

  const isPlay = mode === 'play'

  const saveCameraAsDefault = () => {
    const state = sceneRef.current?.getCameraState()
    if (state && currentLevelId) {
      updateLevel(currentLevelId, { cameraPosition: state.position, cameraLookAt: state.lookAt, cameraFOV: state.fov })
    }
  }

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', background:'#111122' }}>
      <canvas ref={canvasRef} style={{ display:'block', width:'100%', height:'100%' }} />

      {/* Transform toolbar */}
      {!isPlay && (
        <div style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', display:'flex', gap:4, background:'rgba(0,0,0,0.7)', padding:'4px 8px', borderRadius:6 }}>
          {[['translate','↔ Move'],['rotate','↻ Rotate'],['scale','⤡ Scale']].map(([m,label]) => (
            <button key={m} onClick={() => setTransformMode(m)} style={{
              padding:'3px 10px', borderRadius:4, border:'none',
              background: transformMode===m ? '#4a90e2' : '#1a1a2e',
              color: transformMode===m ? '#fff' : '#8888aa',
              cursor:'pointer', fontSize:12,
            }}>{label}</button>
          ))}
        </div>
      )}

      {/* Camera presets + save */}
      {!isPlay && (
        <div style={{ position:'absolute', top:10, right:10, display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ display:'flex', gap:3, background:'rgba(0,0,0,0.7)', padding:'4px 6px', borderRadius:6, flexWrap:'wrap', maxWidth:220 }}>
            {[['perspective','🎥'],['topdown','⬇️'],['isometric','💠'],['front','⬛'],['side','▶️']].map(([p,icon]) => (
              <button key={p} onClick={() => sceneRef.current?.setCameraPreset(p)} title={p} style={{
                padding:'3px 7px', borderRadius:3, border:'none', background:'#1a1a2e', color:'#aaaacc', cursor:'pointer', fontSize:11,
              }}>{icon} {p}</button>
            ))}
          </div>
          <button onClick={saveCameraAsDefault} title="Save current camera view as game start camera" style={{
            padding:'4px 8px', borderRadius:5, border:'1px solid #4a90e2', background:'rgba(0,0,0,0.7)', color:'#4a90e2', cursor:'pointer', fontSize:11,
          }}>💾 Save Camera</button>
        </div>
      )}

      {!isPlay && (
        <div style={{ position:'absolute', bottom:8, left:8, color:'#44445a', fontSize:11, pointerEvents:'none' }}>
          Right-drag to orbit · Scroll to zoom · Left-click to select
        </div>
      )}

      {isPlay && gameResult && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, zIndex:10 }}>
          <div style={{ fontSize:36 }}>{gameResult==='win' ? '🏆 You Win!' : '💀 Game Over'}</div>
          <button onClick={() => useStore.getState().setMode('edit')} style={{ padding:'10px 28px', borderRadius:8, border:'none', background:'#4a90e2', color:'#fff', fontSize:16, cursor:'pointer' }}>
            ← Back to Editor
          </button>
        </div>
      )}
    </div>
  )
}

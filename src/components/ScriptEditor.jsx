import { useEffect, useRef, useCallback, useState } from 'react'
import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { TOOLBOX } from '../blocks/definitions'
import { useStore } from '../store'

const DARK_THEME = Blockly.Theme.defineTheme('engine3d_dark', {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: '#111122',
    toolboxBackgroundColour: '#0c0c18',
    toolboxForegroundColour: '#c0c0e0',
    flyoutBackgroundColour: '#13131f',
    flyoutForegroundColour: '#e0e0f0',
    flyoutOpacity: 0.95,
    scrollbarColour: '#2a2a3e',
  },
  fontStyle: { family: "'Segoe UI', system-ui, sans-serif", size: 12 },
})

function BlocklyWorkspace({ fullscreen }) {
  const containerRef = useRef()
  const workspaceRef = useRef()
  const activeIdRef = useRef(null)
  const suppressRef = useRef(false)
  const { objects, selectedId, updateObjectScript, mode } = useStore()
  const selectedObj = objects.find(o => o.id === selectedId)

  const saveWorkspace = useCallback(() => {
    const ws = workspaceRef.current
    const id = activeIdRef.current
    if (!ws || !id || suppressRef.current) return
    const state = Blockly.serialization.workspaces.save(ws)
    let code = ''
    try { code = javascriptGenerator.workspaceToCode(ws) } catch {}
    updateObjectScript(id, state, code)
  }, [updateObjectScript])

  useEffect(() => {
    if (!containerRef.current) return
    const ws = Blockly.inject(containerRef.current, {
      toolbox: TOOLBOX,
      theme: DARK_THEME,
      grid: { spacing: 20, length: 3, colour: '#1a1a2e', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.85, maxScale: 3, minScale: 0.3 },
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: false },
    })
    workspaceRef.current = ws
    ws.addChangeListener(e => { if (!e.isUiEvent) saveWorkspace() })
    return () => { ws.dispose(); workspaceRef.current = null }
  }, [])

  useEffect(() => {
    const ws = workspaceRef.current
    if (!ws) return
    if (activeIdRef.current && activeIdRef.current !== selectedId) saveWorkspace()
    activeIdRef.current = selectedId
    suppressRef.current = true
    ws.clear()
    if (selectedObj?.scriptState) {
      try { Blockly.serialization.workspaces.load(selectedObj.scriptState, ws) } catch {}
    }
    suppressRef.current = false
  }, [selectedId])

  const hasSelection = !!selectedId
  const isPlay = mode === 'play'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px',
        background: '#0c0c18', borderBottom: '1px solid #2a2a3e', flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#6666aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Visual Script</span>
        {selectedObj && <span style={{ color: '#4a90e2', fontSize: 12 }}>— {selectedObj.name}</span>}
        {!hasSelection && <span style={{ color: '#44445a', fontSize: 12 }}>Select an object to edit its script</span>}
        {isPlay && <span style={{ marginLeft: 'auto', color: '#e67e22', fontSize: 11 }}>⏵ Stop to edit scripts</span>}
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={containerRef} style={{
          position: 'absolute', inset: 0,
          opacity: hasSelection ? 1 : 0.3,
          pointerEvents: hasSelection && !isPlay ? 'auto' : 'none',
        }} />
        {!hasSelection && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#33334a', fontSize: 14, pointerEvents: 'none' }}>
            Select a scene object, then add blocks here
          </div>
        )}
      </div>
    </div>
  )
}

export default function ScriptEditor() {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderTop: '1px solid #2a2a3e' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2a3e', background: '#0c0c18', flexShrink: 0 }}>
          <button onClick={() => setFullscreen(true)} title="Open fullscreen script editor" style={{
            marginLeft: 'auto', padding: '4px 10px', background: 'none', border: 'none',
            color: '#6666aa', cursor: 'pointer', fontSize: 16,
          }}>⛶</button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <BlocklyWorkspace />
        </div>
      </div>

      {fullscreen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000, background: '#0c0c18',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid #2a2a3e', background: '#0c0c18', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#4a90e2' }}>📜 Script Editor — Fullscreen</span>
            <button onClick={() => setFullscreen(false)} style={{
              marginLeft: 'auto', padding: '5px 14px', borderRadius: 6, border: 'none',
              background: '#c0392b', color: '#fff', cursor: 'pointer', fontSize: 13,
            }}>✕ Close</button>
          </div>
          <div style={{ flex: 1 }}>
            <BlocklyWorkspace fullscreen />
          </div>
        </div>
      )}
    </>
  )
}

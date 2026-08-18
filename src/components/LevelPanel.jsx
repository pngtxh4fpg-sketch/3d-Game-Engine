import { useState } from 'react'
import { useStore, getCurrentLevel } from '../store'

export default function LevelPanel() {
  const { levels, currentLevelId, addLevel, removeLevel, switchLevel, updateLevel, duplicateLevel, getProject } = useStore()
  const [editingId, setEditingId] = useState(null)

  const current = levels.find(l => l.id === currentLevelId) || levels[0]

  const up = (changes) => updateLevel(currentLevelId, changes)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Level list */}
      <div style={{ padding:'8px 12px', fontSize:11, fontWeight:700, color:'#6666aa', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid #2a2a3e' }}>
        Levels / Maps
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:4 }}>
        {levels.map(lvl => (
          <div key={lvl.id} onClick={() => switchLevel(lvl.id)} style={{
            display:'flex', alignItems:'center', gap:6, padding:'5px 8px', borderRadius:5, marginBottom:2, cursor:'pointer',
            background: currentLevelId===lvl.id ? '#1e2840' : 'transparent',
            border: currentLevelId===lvl.id ? '1px solid #4a90e2' : '1px solid transparent',
          }}>
            {editingId===lvl.id ? (
              <input autoFocus value={lvl.name}
                onChange={e => updateLevel(lvl.id, { name: e.target.value })}
                onBlur={() => setEditingId(null)}
                onKeyDown={e => e.key==='Enter' && setEditingId(null)}
                onClick={e => e.stopPropagation()}
                style={{ flex:1, background:'#1a1a2e', border:'1px solid #4a90e2', color:'#e0e0f0', padding:'2px 4px', borderRadius:3, fontSize:12 }} />
            ) : (
              <span style={{ flex:1, fontSize:12, color: currentLevelId===lvl.id ? '#e0e8ff' : '#c0c0d8' }}
                onDblClick={e => { e.stopPropagation(); setEditingId(lvl.id) }}>
                🗺 {lvl.name}
              </span>
            )}
            {currentLevelId===lvl.id && (
              <>
                <button onClick={e=>{e.stopPropagation();duplicateLevel(lvl.id)}} title="Duplicate level"
                  style={iconBtn}>⧉</button>
                {levels.length>1 && (
                  <button onClick={e=>{e.stopPropagation();removeLevel(lvl.id)}} title="Delete level"
                    style={{...iconBtn,color:'#c0392b'}}>✕</button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <button onClick={addLevel} style={{
        margin:'6px 8px', padding:'6px', borderRadius:5, border:'1px dashed #2a2a3e',
        background:'transparent', color:'#6666aa', cursor:'pointer', fontSize:12,
      }}>+ Add Level</button>

      {/* Current level settings */}
      {current && (
        <div style={{ borderTop:'1px solid #2a2a3e', padding:'8px 12px', overflowY:'auto', maxHeight:280 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#6666aa', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
            Map Settings — {current.name}
          </div>

          <Row label="Sky Color">
            <input type="color" value={current.skyColor||'#111122'} onChange={e=>up({skyColor:e.target.value})}
              style={{width:36,height:24,border:'none',background:'none',cursor:'pointer'}} />
            <span style={{color:'#8888aa',fontSize:11,marginLeft:4}}>{current.skyColor}</span>
          </Row>

          <Row label="Map Size">
            <input type="range" min={10} max={500} value={current.mapSize||50} onChange={e=>up({mapSize:parseInt(e.target.value)})}
              style={{flex:1}} />
            <span style={{color:'#8888aa',fontSize:11,minWidth:30,textAlign:'right'}}>{current.mapSize||50}</span>
          </Row>

          <Row label="Fog">
            <input type="checkbox" checked={current.fogEnabled!==false} onChange={e=>up({fogEnabled:e.target.checked})} />
          </Row>

          <Row label="Ambient">
            <input type="color" value={current.ambientColor||'#ffffff'} onChange={e=>up({ambientColor:e.target.value})}
              style={{width:28,height:22,border:'none',background:'none',cursor:'pointer'}} />
            <input type="range" min={0} max={2} step={0.05} value={current.ambientIntensity??0.5} onChange={e=>up({ambientIntensity:parseFloat(e.target.value)})}
              style={{flex:1,marginLeft:4}} />
            <span style={{color:'#8888aa',fontSize:11,minWidth:28,textAlign:'right'}}>{(current.ambientIntensity??0.5).toFixed(2)}</span>
          </Row>

          <div style={{fontSize:10,fontWeight:700,color:'#6666aa',textTransform:'uppercase',letterSpacing:'0.08em',margin:'10px 0 6px'}}>
            Initial Camera
          </div>

          {['x','y','z'].map(axis => (
            <Row key={axis} label={`Pos ${axis.toUpperCase()}`}>
              <input type="number" step="1" value={(current.cameraPosition||{x:0,y:15,z:20})[axis]}
                onChange={e => up({ cameraPosition:{ ...(current.cameraPosition||{x:0,y:15,z:20}), [axis]:parseFloat(e.target.value)||0 } })}
                style={numInput} />
            </Row>
          ))}
          {['x','y','z'].map(axis => (
            <Row key={'t'+axis} label={`Look ${axis.toUpperCase()}`}>
              <input type="number" step="1" value={(current.cameraLookAt||{x:0,y:0,z:0})[axis]}
                onChange={e => up({ cameraLookAt:{ ...(current.cameraLookAt||{x:0,y:0,z:0}), [axis]:parseFloat(e.target.value)||0 } })}
                style={numInput} />
            </Row>
          ))}
          <Row label="FOV">
            <input type="number" min={20} max={120} value={current.cameraFOV||60}
              onChange={e=>up({cameraFOV:parseInt(e.target.value)||60})}
              style={{...numInput,width:60}} />
          </Row>
        </div>
      )}
    </div>
  )
}

const Row = ({label,children}) => (
  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
    <span style={{color:'#7777aa',fontSize:11,width:64,flexShrink:0}}>{label}</span>
    {children}
  </div>
)
const iconBtn = {background:'none',border:'none',color:'#8888aa',cursor:'pointer',padding:'2px 4px',fontSize:12}
const numInput = {background:'#1a1a2e',border:'1px solid #2a2a3e',color:'#e0e0f0',padding:'2px 4px',borderRadius:3,fontSize:11,width:70}

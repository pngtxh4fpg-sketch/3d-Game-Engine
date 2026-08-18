import { useState } from 'react'
import { useStore, getCurrentLevel } from '../store'
import SpriteEditor from './SpriteEditor'

const LIGHT_TYPES = new Set(['pointlight','dirlight','spotlight'])

export default function Properties() {
  const store = useStore()
  const { selectedId, updateObject, mode } = store
  const level = getCurrentLevel(store)
  const objects = level?.objects || []
  const obj = objects.find(o => o.id === selectedId)
  const [spriteOpen, setSpriteOpen] = useState(false)
  const editable = mode === 'edit'
  const up = (changes) => editable && updateObject(obj.id, changes)

  if (!obj) return <div style={{ color:'#44445a', padding:20, textAlign:'center', marginTop:40, fontSize:12 }}>Select an object to edit properties</div>

  const isLight = LIGHT_TYPES.has(obj.type)

  return (
    <div style={{ overflow:'auto', height:'100%', padding:'4px 0' }}>
      <SectionHeader label="Object" />
      <Row label="Name"><Input value={obj.name} onChange={v=>up({name:v})} disabled={!editable}/></Row>
      <Row label="Tag"><Input value={obj.tag} onChange={v=>up({tag:v})} placeholder="enemy, tower…" disabled={!editable}/></Row>
      <Row label="Type"><span style={{ color:'#8888aa', fontSize:12 }}>{obj.type}{obj.parts?.length>0?` (${obj.parts.length} parts)`:''}</span></Row>
      <Row label="Visible"><input type="checkbox" checked={obj.visible} onChange={e=>up({visible:e.target.checked})} disabled={!editable}/></Row>

      {!isLight && (
        <Row label="Color">
          <input type="color" value={obj.color} onChange={e=>up({color:e.target.value})} disabled={!editable}
            style={{width:36,height:24,border:'none',background:'none',cursor:'pointer'}}/>
          <span style={{color:'#8888aa',fontSize:11,marginLeft:4}}>{obj.color}</span>
        </Row>
      )}
      {!isLight && <Row label="Health"><NumInput value={obj.health} onChange={v=>up({health:v})} disabled={!editable}/></Row>}

      {/* Light properties */}
      {isLight && (
        <>
          <SectionHeader label="Light" />
          <Row label="Color">
            <input type="color" value={obj.lightColor||'#ffffff'} onChange={e=>up({lightColor:e.target.value,color:e.target.value})} disabled={!editable}
              style={{width:36,height:24,border:'none',background:'none',cursor:'pointer'}}/>
          </Row>
          <Row label="Intensity">
            <input type="range" min={0} max={5} step={0.05} value={obj.lightIntensity??1} onChange={e=>up({lightIntensity:parseFloat(e.target.value)})} disabled={!editable} style={{flex:1}}/>
            <span style={{color:'#8888aa',fontSize:11,minWidth:30,textAlign:'right'}}>{(obj.lightIntensity??1).toFixed(2)}</span>
          </Row>
          {obj.type!=='dirlight' && (
            <Row label="Distance">
              <input type="range" min={1} max={100} value={obj.lightDistance||20} onChange={e=>up({lightDistance:parseFloat(e.target.value)})} disabled={!editable} style={{flex:1}}/>
              <span style={{color:'#8888aa',fontSize:11,minWidth:28,textAlign:'right'}}>{obj.lightDistance||20}</span>
            </Row>
          )}
          {obj.type==='spotlight' && (
            <Row label="Angle°">
              <input type="range" min={5} max={90} value={obj.lightAngle||45} onChange={e=>up({lightAngle:parseFloat(e.target.value)})} disabled={!editable} style={{flex:1}}/>
              <span style={{color:'#8888aa',fontSize:11,minWidth:28,textAlign:'right'}}>{obj.lightAngle||45}°</span>
            </Row>
          )}
          <Row label="Shadow"><input type="checkbox" checked={obj.castShadow!==false} onChange={e=>up({castShadow:e.target.checked})} disabled={!editable}/></Row>
        </>
      )}

      {editable && !isLight && (
        <div style={{ padding:'8px 12px' }}>
          <button onClick={()=>setSpriteOpen(true)} style={{ width:'100%', padding:'7px', borderRadius:6, border:'1px solid #4a90e2', background:'#1a2840', color:'#4a90e2', cursor:'pointer', fontSize:12, fontWeight:600 }}>
            ✏️ Open Sprite Editor
          </button>
        </div>
      )}

      <SectionHeader label="Position" />
      <Vec3Row vec={obj.position} onChange={v=>up({position:v})} disabled={!editable}/>
      <SectionHeader label="Rotation (°)" />
      <Vec3Row vec={obj.rotation} onChange={v=>up({rotation:v})} disabled={!editable}/>
      <SectionHeader label="Scale" />
      <Vec3Row vec={obj.scale} onChange={v=>up({scale:v})} disabled={!editable}/>

      {obj.scriptCode && (
        <>
          <SectionHeader label="Script" />
          <div style={{padding:'4px 12px'}}>
            <div style={{background:'#0a0a14',borderRadius:4,padding:8,fontFamily:'monospace',fontSize:10,color:'#7777aa',maxHeight:60,overflow:'auto',whiteSpace:'pre'}}>
              {obj.scriptCode.slice(0,200)}{obj.scriptCode.length>200?'…':''}
            </div>
          </div>
        </>
      )}

      {spriteOpen && <SpriteEditor objectId={obj.id} onClose={()=>setSpriteOpen(false)}/>}
    </div>
  )
}

const SectionHeader = ({label}) => <div style={{padding:'8px 12px 3px',fontSize:10,fontWeight:700,color:'#6666aa',letterSpacing:'0.08em',textTransform:'uppercase',borderTop:'1px solid #2a2a3e',marginTop:4}}>{label}</div>
const Row = ({label,children}) => <div style={{display:'flex',alignItems:'center',padding:'3px 12px',gap:8}}><span style={{color:'#7777aa',fontSize:12,width:64,flexShrink:0}}>{label}</span>{children}</div>
const iStyle = {background:'#1a1a2e',border:'1px solid #2a2a3e',color:'#e0e0f0',padding:'3px 6px',borderRadius:4,fontSize:12,width:'100%',outline:'none'}
const Input = ({value,onChange,placeholder,disabled}) => <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={iStyle}/>
const NumInput = ({value,onChange,disabled}) => <input type="number" value={value} onChange={e=>onChange(parseFloat(e.target.value)||0)} disabled={disabled} step="0.1" style={{...iStyle,width:70}}/>
const Vec3Row = ({vec,onChange,disabled}) => (
  <div style={{display:'flex',gap:4,padding:'3px 12px'}}>
    {['x','y','z'].map(a=>(
      <div key={a} style={{flex:1,display:'flex',flexDirection:'column',gap:2}}>
        <span style={{color:'#6666aa',fontSize:10,textAlign:'center'}}>{a.toUpperCase()}</span>
        <input type="number" value={vec[a]} step="0.1" onChange={e=>onChange({...vec,[a]:parseFloat(e.target.value)||0})} disabled={disabled} style={{...iStyle,textAlign:'center',padding:'3px 2px'}}/>
      </div>
    ))}
  </div>
)

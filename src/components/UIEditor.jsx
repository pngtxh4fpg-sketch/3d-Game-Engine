import { useState } from 'react'
import { useStore, getCurrentLevel } from '../store'

const TYPES = [
  { type:'text',     label:'💬 Text' },
  { type:'score',    label:'⭐ Score' },
  { type:'lives',    label:'❤️ Lives' },
  { type:'button',   label:'🔘 Button' },
  { type:'healthbar',label:'🟩 Health Bar' },
]

const Input = ({label,value,onChange,type='text',step}) => (
  <div style={{marginBottom:6}}>
    <div style={{fontSize:10,color:'#6666aa',textTransform:'uppercase',marginBottom:2}}>{label}</div>
    <input type={type} value={value} step={step} onChange={e=>onChange(type==='number'?parseFloat(e.target.value)||0:e.target.value)}
      style={{width:'100%',background:'#1a1a2e',border:'1px solid #2a2a3e',color:'#e0e0f0',padding:'3px 6px',borderRadius:4,fontSize:12}}/>
  </div>
)

export default function UIEditor() {
  const store = useStore()
  const { selectedUIId, addUIElement, removeUIElement, updateUIElement, selectUIElement } = store
  const level = getCurrentLevel(store)
  const uiElements = level?.uiElements || []
  const sel = uiElements.find(e => e.id === selectedUIId)
  const up = (changes) => sel && updateUIElement(sel.id, changes)

  return (
    <div style={{display:'flex',height:'100%',overflow:'hidden'}}>
      {/* Left: element list */}
      <div style={{width:180,borderRight:'1px solid #2a2a3e',display:'flex',flexDirection:'column',background:'#0f0f1a'}}>
        <div style={{padding:'8px 12px',fontSize:11,fontWeight:700,color:'#6666aa',textTransform:'uppercase',letterSpacing:'0.08em',borderBottom:'1px solid #2a2a3e'}}>UI Elements</div>
        <div style={{padding:8,display:'flex',flexDirection:'column',gap:4,borderBottom:'1px solid #2a2a3e'}}>
          <div style={{fontSize:10,color:'#44445a',marginBottom:2}}>Add element:</div>
          {TYPES.map(({type,label})=>(
            <button key={type} onClick={()=>addUIElement(type)} style={{padding:'4px 8px',borderRadius:4,border:'1px solid #2a2a3e',background:'#1a1a2e',color:'#c0c0e0',cursor:'pointer',fontSize:11,textAlign:'left'}}>{label}</button>
          ))}
        </div>
        <div style={{flex:1,overflowY:'auto',padding:4}}>
          {uiElements.length===0 && <div style={{color:'#33334a',padding:12,fontSize:11,textAlign:'center'}}>No UI elements yet</div>}
          {uiElements.map(el=>(
            <div key={el.id} onClick={()=>selectUIElement(el.id)} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 8px',borderRadius:5,marginBottom:2,cursor:'pointer',background:selectedUIId===el.id?'#1e2840':'transparent',border:selectedUIId===el.id?'1px solid #4a90e2':'1px solid transparent'}}>
              <span style={{fontSize:13}}>{TYPES.find(t=>t.type===el.type)?.label.split(' ')[0]||'❓'}</span>
              <span style={{flex:1,fontSize:12,color:'#c0c0e0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{el.label}</span>
              <button onClick={e=>{e.stopPropagation();removeUIElement(el.id)}} style={{background:'none',border:'none',color:'#c0392b',cursor:'pointer',fontSize:12}}>✕</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Preview */}
        <div style={{flex:1,position:'relative',background:'#111122',overflow:'hidden',borderBottom:'1px solid #2a2a3e'}}>
          {uiElements.filter(e=>e.visible).map(el=>(
            <div key={el.id} onClick={()=>selectUIElement(el.id)} style={{position:'absolute',left:`${el.x}%`,top:`${el.y}%`,transform:'translateX(-50%)',minWidth:el.width,minHeight:el.height,fontSize:el.fontSize,color:el.color,background:el.bgColor,borderRadius:el.borderRadius,display:'flex',alignItems:'center',justifyContent:'center',padding:'4px 12px',fontWeight:el.bold?700:400,cursor:'pointer',outline:selectedUIId===el.id?'2px solid #4a90e2':'none',outlineOffset:2,whiteSpace:'nowrap',userSelect:'none',fontFamily:"'Segoe UI', system-ui, sans-serif"}}>
              {el.label.replace('{score}','0').replace('{lives}','10')}
            </div>
          ))}
          <div style={{position:'absolute',bottom:6,left:8,color:'#33334a',fontSize:10,pointerEvents:'none'}}>Preview — click to select</div>
        </div>

        {sel && (
          <div style={{height:220,overflowY:'auto',padding:12,background:'#0f0f1a'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <Input label="Label / Text" value={sel.label} onChange={v=>up({label:v})}/>
              <Input label="Script ID" value={sel.customId||sel.id} onChange={v=>up({customId:v})}/>
              <Input label="X position (%)" value={sel.x} onChange={v=>up({x:v})} type="number" step="1"/>
              <Input label="Y position (%)" value={sel.y} onChange={v=>up({y:v})} type="number" step="1"/>
              <Input label="Width (px)" value={sel.width} onChange={v=>up({width:v})} type="number"/>
              <Input label="Font size" value={sel.fontSize} onChange={v=>up({fontSize:v})} type="number"/>
              <div><div style={{fontSize:10,color:'#6666aa',textTransform:'uppercase',marginBottom:2}}>Text Color</div><input type="color" value={sel.color} onChange={e=>up({color:e.target.value})} style={{width:'100%',height:28,border:'none',background:'none',cursor:'pointer'}}/></div>
              <div><div style={{fontSize:10,color:'#6666aa',textTransform:'uppercase',marginBottom:2}}>Visible</div><input type="checkbox" checked={sel.visible} onChange={e=>up({visible:e.target.checked})}/></div>
            </div>
            <div style={{fontSize:10,color:'#44445a',marginTop:4}}>Use {'{score}'} / {'{lives}'} in label for live values.</div>
          </div>
        )}
        {!sel && <div style={{padding:20,color:'#33334a',fontSize:12,textAlign:'center'}}>Select an element to edit its properties</div>}
      </div>
    </div>
  )
}

import { useRef } from 'react'
import { useStore, getCurrentLevel } from '../store'
import { saveProject, loadProject, exportGame } from '../engine/Exporter'

const Btn = ({onClick,active,children,title,color}) => (
  <button onClick={onClick} title={title} style={{
    padding:'4px 10px', background:active?(color||'#4a90e2'):'#1e1e30',
    color:active?'#fff':'#aaaacc', border:`1px solid ${active?(color||'#4a90e2'):'#2a2a3e'}`,
    borderRadius:5, cursor:'pointer', fontSize:12, fontWeight:active?600:400, whiteSpace:'nowrap',
  }}>{children}</button>
)
const Sep = () => <div style={{width:1,background:'#2a2a3e',margin:'0 4px',alignSelf:'stretch'}}/>

export default function Toolbar() {
  const store = useStore()
  const { mode, setMode, addObject, gameName, setGameName, getProject, loadProject:loadStore, levels, currentLevelId, switchLevel } = store
  const fileRef = useRef()
  const isPlay = mode === 'play'

  const PRIMITIVES = [
    {type:'cube',label:'⬛'},
    {type:'sphere',label:'⚽'},
    {type:'cylinder',label:'🥫'},
    {type:'cone',label:'🔺'},
    {type:'plane',label:'▱'},
  ]
  const LIGHTS = [
    {type:'pointlight',label:'💡',title:'Point Light'},
    {type:'dirlight',label:'☀️',title:'Directional Light'},
    {type:'spotlight',label:'🔦',title:'Spot Light'},
  ]

  return (
    <div style={{display:'flex',alignItems:'center',gap:6,padding:'0 12px',height:48,background:'#0c0c18',borderBottom:'1px solid #2a2a3e',overflowX:'auto'}}>
      <span style={{color:'#4a90e2',fontWeight:700,fontSize:15,marginRight:4}}>⬡ Engine3D</span>
      <Sep/>
      <input value={gameName} onChange={e=>setGameName(e.target.value)}
        style={{background:'#1a1a2e',border:'1px solid #2a2a3e',color:'#e0e0f0',padding:'3px 8px',borderRadius:4,fontSize:12,width:120}}/>
      <Sep/>

      {/* Level switcher */}
      {levels.length>1 && (
        <>
          <select value={currentLevelId} onChange={e=>switchLevel(e.target.value)}
            style={{background:'#1a1a2e',border:'1px solid #2a2a3e',color:'#e0e0f0',padding:'3px 6px',borderRadius:4,fontSize:12,cursor:'pointer'}}>
            {levels.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <Sep/>
        </>
      )}

      {/* Objects */}
      {!isPlay && PRIMITIVES.map(p=>(
        <Btn key={p.type} onClick={()=>addObject(p.type)} title={`Add ${p.type}`}>{p.label} {p.type}</Btn>
      ))}
      {!isPlay && <Sep/>}

      {/* Lights */}
      {!isPlay && LIGHTS.map(l=>(
        <Btn key={l.type} onClick={()=>addObject(l.type)} title={l.title}>{l.label}</Btn>
      ))}
      {!isPlay && <Sep/>}

      <Btn onClick={()=>setMode(isPlay?'edit':'play')} active color={isPlay?'#c0392b':'#27ae60'}>
        {isPlay?'⏹ Stop':'▶ Play'}
      </Btn>
      <Sep/>
      <Btn onClick={()=>saveProject(getProject())} title="Save project">💾 Save</Btn>
      <Btn onClick={()=>fileRef.current.click()} title="Open project">📂 Open</Btn>
      <Btn onClick={()=>exportGame(getProject())} title="Export standalone HTML game">📤 Export</Btn>

      <input ref={fileRef} type="file" accept=".json,.e3d.json" style={{display:'none'}}
        onChange={async e=>{
          const f=e.target.files[0]; if(!f)return
          try{loadStore(await loadProject(f))}catch{alert('Failed to load project.')}
          e.target.value=''
        }}/>
    </div>
  )
}

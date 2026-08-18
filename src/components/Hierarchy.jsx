import { useStore, getCurrentLevel } from '../store'

const TYPE_ICONS = { cube:'⬛', sphere:'⚽', cylinder:'🥫', cone:'🔺', plane:'▱', pointlight:'💡', dirlight:'☀️', spotlight:'🔦' }

export default function Hierarchy() {
  const store = useStore()
  const { selectedId, selectObject, removeObject, duplicateObject, mode } = store
  const level = getCurrentLevel(store)
  const objects = level?.objects || []
  const editable = mode === 'edit'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'8px 12px', fontSize:11, fontWeight:700, color:'#6666aa', letterSpacing:'0.08em', textTransform:'uppercase', borderBottom:'1px solid #2a2a3e' }}>
        Scene Objects
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:4 }}>
        {objects.length===0 && (
          <div style={{ color:'#44445a', padding:'16px 12px', fontSize:12, textAlign:'center' }}>No objects.<br/>Add from toolbar.</div>
        )}
        {objects.map(obj => (
          <div key={obj.id} onClick={() => selectObject(obj.id)} style={{
            display:'flex', alignItems:'center', padding:'5px 8px', marginBottom:2, borderRadius:5, cursor:'pointer', gap:6, userSelect:'none',
            background: selectedId===obj.id ? '#1e2840' : 'transparent',
            border: selectedId===obj.id ? '1px solid #4a90e2' : '1px solid transparent',
          }}>
            <span style={{ fontSize:14 }}>{TYPE_ICONS[obj.type] || '📦'}</span>
            <span style={{ flex:1, color: selectedId===obj.id ? '#e0e8ff' : '#c0c0d8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:12 }}>
              {obj.name}
            </span>
            {obj.tag && <span style={{ fontSize:10, background:'#2a2a4e', color:'#8888cc', padding:'1px 5px', borderRadius:3 }}>{obj.tag}</span>}
            {obj.scriptCode && <span title="Has script" style={{ fontSize:11 }}>📜</span>}
            {obj.parts?.length>0 && <span title={`${obj.parts.length} parts`} style={{ fontSize:10, color:'#6666aa' }}>+{obj.parts.length}</span>}
            {editable && selectedId===obj.id && (
              <>
                <button onClick={e=>{e.stopPropagation();duplicateObject(obj.id)}} title="Duplicate" style={iconBtn}>⧉</button>
                <button onClick={e=>{e.stopPropagation();removeObject(obj.id)}} title="Delete" style={{...iconBtn,color:'#c0392b'}}>✕</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
const iconBtn = { background:'none', border:'none', color:'#8888aa', cursor:'pointer', padding:'2px 4px', fontSize:12 }

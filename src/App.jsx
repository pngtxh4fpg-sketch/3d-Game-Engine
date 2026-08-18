import { useState } from 'react'
import Toolbar from './components/Toolbar'
import Hierarchy from './components/Hierarchy'
import Viewport from './components/Viewport'
import Properties from './components/Properties'
import ScriptEditor from './components/ScriptEditor'
import UIEditor from './components/UIEditor'
import LevelPanel from './components/LevelPanel'
import './blocks/definitions'
import './blocks/scratchBlocks'
import './blocks/cameraBlocks'

const Tab = ({active,onClick,children}) => (
  <button onClick={onClick} style={{
    padding:'5px 14px', border:'none', borderBottom:active?'2px solid #4a90e2':'2px solid transparent',
    background:'none', color:active?'#e0e0f0':'#6666aa', cursor:'pointer', fontSize:12, fontWeight:active?600:400,
  }}>{children}</button>
)

const LeftTab = ({active,onClick,children}) => (
  <button onClick={onClick} style={{
    flex:1, padding:'5px 8px', border:'none', borderBottom:active?'2px solid #4a90e2':'2px solid transparent',
    background:'none', color:active?'#e0e0f0':'#6666aa', cursor:'pointer', fontSize:11, fontWeight:active?600:400,
  }}>{children}</button>
)

export default function App() {
  const [bottomTab, setBottomTab] = useState('script')
  const [leftTab, setLeftTab] = useState('hierarchy')

  return (
    <div style={{
      display:'grid', gridTemplateRows:'48px 1fr', gridTemplateColumns:'220px 1fr 280px',
      width:'100vw', height:'100vh', background:'#0f0f1a', color:'#e0e0f0',
      fontFamily:"'Segoe UI', system-ui, sans-serif", fontSize:13, overflow:'hidden',
    }}>
      <div style={{gridColumn:'1 / -1'}}><Toolbar/></div>

      {/* Left panel: tabs for Hierarchy / Levels */}
      <div style={{background:'#13131f',borderRight:'1px solid #2a2a3e',overflow:'hidden',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',borderBottom:'1px solid #2a2a3e',background:'#0c0c18',flexShrink:0}}>
          <LeftTab active={leftTab==='hierarchy'} onClick={()=>setLeftTab('hierarchy')}>🌳 Scene</LeftTab>
          <LeftTab active={leftTab==='levels'} onClick={()=>setLeftTab('levels')}>🗺 Levels</LeftTab>
        </div>
        <div style={{flex:1,overflow:'hidden'}}>
          {leftTab==='hierarchy' && <Hierarchy/>}
          {leftTab==='levels'    && <LevelPanel/>}
        </div>
      </div>

      {/* Center: Viewport + tabbed bottom */}
      <div style={{display:'grid',gridTemplateRows:'60% 40%',overflow:'hidden',borderRight:'1px solid #2a2a3e'}}>
        <Viewport/>
        <div style={{display:'flex',flexDirection:'column',overflow:'hidden',borderTop:'1px solid #2a2a3e'}}>
          <div style={{display:'flex',alignItems:'center',background:'#0c0c18',borderBottom:'1px solid #2a2a3e',flexShrink:0}}>
            <Tab active={bottomTab==='script'} onClick={()=>setBottomTab('script')}>📜 Script Editor</Tab>
            <Tab active={bottomTab==='ui'} onClick={()=>setBottomTab('ui')}>🖼 UI Editor</Tab>
          </div>
          <div style={{flex:1,overflow:'hidden'}}>
            {bottomTab==='script' && <ScriptEditor/>}
            {bottomTab==='ui'     && <UIEditor/>}
          </div>
        </div>
      </div>

      {/* Right: Properties */}
      <div style={{background:'#13131f',overflow:'hidden',display:'flex',flexDirection:'column'}}>
        <Properties/>
      </div>
    </div>
  )
}

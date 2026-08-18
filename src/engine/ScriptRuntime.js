import * as THREE from 'three'

const LIGHT_TYPES = new Set(['pointlight','spotlight','dirlight'])

export class ScriptRuntime {
  constructor(canvas, objects, uiElements=[], levelSettings={}) {
    this.canvas = canvas
    this.sourceObjects = objects
    this.uiElements = uiElements
    this.levelSettings = levelSettings
    this.gameObjects = {}
    this._animFrame = null
    this._clock = new THREE.Clock()
    this._timerOffset = 0
    this._keys = {}
    this._mouse = { x:0, z:0, down:false }
    this._score = 0
    this._lives = 10
    this._running = false
    this._pendingSpawns = []
    this._pendingDestroys = []
    this._msgHandlers = {}
    this._keyHandlers = {}
    this._activeP = {}
    this._uiContainer = null
    this._uiNodes = {}
    this._cameraFollow = null  // { tag, ox, oy, oz }
    this._shakeEnd = 0
    this._shakeIntensity = 0
    this._defaultCamPos = null
    this._defaultCamTarget = null
    this.onGameEnd = null

    this._initThree()
    this._initInput()
    this._buildUI()
    this._loadObjects()
    this._runStartScripts()
    this._loop()
  }

  _initThree() {
    const w = this.canvas.clientWidth||800, h = this.canvas.clientHeight||600
    this.renderer = new THREE.WebGLRenderer({canvas:this.canvas,antialias:true})
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2))
    this.renderer.setSize(w,h)
    this.renderer.shadowMap.enabled = true

    this.scene = new THREE.Scene()
    const sky = this.levelSettings.skyColor||'#111122'
    this.scene.background = new THREE.Color(sky)
    if (this.levelSettings.fogEnabled!==false) {
      const s = this.levelSettings.mapSize||50
      this.scene.fog = new THREE.Fog(new THREE.Color(sky), s, s*3)
    }

    const fov = this.levelSettings.cameraFOV||60
    this.camera = new THREE.PerspectiveCamera(fov, w/h, 0.1, 1000)
    const cp = this.levelSettings.cameraPosition||{x:0,y:15,z:20}
    const cl = this.levelSettings.cameraLookAt||{x:0,y:0,z:0}
    this.camera.position.set(cp.x,cp.y,cp.z)
    this.camera.lookAt(cl.x,cl.y,cl.z)
    this._defaultCamPos = new THREE.Vector3(cp.x,cp.y,cp.z)
    this._defaultCamTarget = new THREE.Vector3(cl.x,cl.y,cl.z)
    this._camTarget = new THREE.Vector3(cl.x,cl.y,cl.z)

    const ai = this.levelSettings.ambientIntensity??0.5
    const ac = this.levelSettings.ambientColor||'#ffffff'
    this.scene.add(new THREE.AmbientLight(new THREE.Color(ac), ai))

    const mapSize = this.levelSettings.mapSize||50
    this.scene.add(new THREE.GridHelper(mapSize*2, mapSize*2, 0x333355, 0x222244))
  }

  _initInput() {
    this._keydown = (e) => {
      if (!this._keys[e.code]) {
        const h = this._keyHandlers[e.code]||[]
        for (const {go,fn} of h) { if(!go._destroyed){const p=fn();if(p&&p.then)this._activeP[go.id+'k'+e.code]=p} }
      }
      this._keys[e.code]=true
    }
    this._keyup = (e) => { this._keys[e.code]=false }
    this._mousedown = () => { this._mouse.down=true }
    this._mouseup = () => { this._mouse.down=false }
    this._mousemove = (e) => {
      const rect=this.canvas.getBoundingClientRect()
      const ray=new THREE.Raycaster()
      ray.setFromCamera(new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1),this.camera)
      const plane=new THREE.Plane(new THREE.Vector3(0,1,0),0)
      const hit=new THREE.Vector3()
      ray.ray.intersectPlane(plane,hit)
      this._mouse.x=hit.x; this._mouse.z=hit.z
    }
    window.addEventListener('keydown',this._keydown)
    window.addEventListener('keyup',this._keyup)
    this.canvas.addEventListener('pointerdown',this._mousedown)
    this.canvas.addEventListener('pointerup',this._mouseup)
    this.canvas.addEventListener('pointermove',this._mousemove)
  }

  _buildUI() {
    const container=document.createElement('div')
    container.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden;'
    this.canvas.parentElement.style.position='relative'
    this.canvas.parentElement.appendChild(container)
    this._uiContainer=container
    for (const el of this.uiElements) {
      if (!el.visible) continue
      const node=document.createElement('div')
      node.style.cssText=`position:absolute;left:${el.x}%;top:${el.y}%;min-width:${el.width}px;min-height:${el.height}px;font-size:${el.fontSize}px;color:${el.color};background:${el.bgColor};border-radius:${el.borderRadius}px;display:flex;align-items:center;justify-content:center;padding:4px 12px;font-weight:${el.bold?700:400};font-family:'Segoe UI',system-ui,sans-serif;pointer-events:${el.type==='button'?'auto':'none'};transform:translateX(-50%);white-space:nowrap;user-select:none;`
      node.textContent=this._resolveLabel(el.label)
      container.appendChild(node)
      this._uiNodes[el.id]=node
      if (el.customId) this._uiNodes[el.customId]=node
    }
  }

  _resolveLabel(label) { return label.replace('{score}',this._score).replace('{lives}',this._lives) }
  _updateUIBindings() {
    for (const el of this.uiElements) {
      const n=this._uiNodes[el.id]; if(!n) continue
      if(el.label.includes('{score}')||el.label.includes('{lives}')) n.textContent=this._resolveLabel(el.label)
    }
  }

  _makeMeshGroup(def) {
    const group=new THREE.Group()
    if (def.parts&&def.parts.length>0) {
      for (const p of def.parts) { const m=this._makeMesh(p); group.add(m) }
    } else if (!LIGHT_TYPES.has(def.type)) {
      group.add(this._makeMesh(def))
    }
    group.position.set(def.position.x,def.position.y,def.position.z)
    group.rotation.set(THREE.MathUtils.degToRad(def.rotation.x),THREE.MathUtils.degToRad(def.rotation.y),THREE.MathUtils.degToRad(def.rotation.z))
    group.scale.set(def.scale.x,def.scale.y,def.scale.z)
    if(!def.visible)group.visible=false
    this.scene.add(group)
    // Add actual light for light types
    if (LIGHT_TYPES.has(def.type)) {
      const col=new THREE.Color(def.lightColor||def.color||'#ffffff')
      const int=def.lightIntensity??1
      let light
      if(def.type==='pointlight') light=new THREE.PointLight(col,int,def.lightDistance||20)
      else if(def.type==='dirlight') light=new THREE.DirectionalLight(col,int)
      else if(def.type==='spotlight') light=new THREE.SpotLight(col,int,def.lightDistance||30,THREE.MathUtils.degToRad(def.lightAngle||45))
      if(light){ light.castShadow=def.castShadow!==false; light.position.copy(group.position); this.scene.add(light); group._light=light }
    }
    return group
  }

  _makeMesh(def) {
    let geo
    switch(def.type){case 'sphere':geo=new THREE.SphereGeometry(0.5,24,24);break;case 'cylinder':geo=new THREE.CylinderGeometry(0.5,0.5,1,24);break;case 'cone':geo=new THREE.ConeGeometry(0.5,1,24);break;case 'plane':geo=new THREE.PlaneGeometry(1,1);break;default:geo=new THREE.BoxGeometry(1,1,1)}
    const mat=new THREE.MeshStandardMaterial({color:def.color||'#4a90e2',roughness:0.6})
    const m=new THREE.Mesh(geo,mat); m.castShadow=true; m.receiveShadow=true
    return m
  }

  _createGameObject(def) {
    const group=this._makeMeshGroup(def)
    const rt=this
    let _sayEl=null
    const say=(text)=>{ if(_sayEl){_sayEl.remove();_sayEl=null} if(!text)return; const el=document.createElement('div'); el.style.cssText='position:absolute;background:white;color:#111;padding:4px 10px;border-radius:12px;font-size:14px;pointer-events:none;white-space:nowrap;z-index:10;'; el.textContent=text; rt._uiContainer&&rt._uiContainer.appendChild(el); _sayEl=el }
    const go={
      id:def.id, name:def.name, tag:def.tag||'', mesh:group, _group:group,
      _health:def.health||100, _data:{}, _destroyed:false, _scriptCode:def.scriptCode||'',
      _sayEl:()=>_sayEl,
      onStart:null, onUpdate:null, onClick:null,
      get position(){return{x:group.position.x,y:group.position.y,z:group.position.z}},
      move:(x,y,z)=>{group.position.x+=x;group.position.y+=y;group.position.z+=z; if(group._light)group._light.position.copy(group.position)},
      moveTo:(x,y,z)=>{group.position.set(x,y,z); if(group._light)group._light.position.set(x,y,z)},
      moveToward:(tId,speed,delta)=>{const t=rt.gameObjects[tId];if(!t||t._destroyed)return;const d=new THREE.Vector3().subVectors(t._group.position,group.position).normalize();group.position.addScaledVector(d,speed*delta);if(group._light)group._light.position.copy(group.position)},
      rotate:(x,y,z)=>{group.rotation.x+=THREE.MathUtils.degToRad(x);group.rotation.y+=THREE.MathUtils.degToRad(y);group.rotation.z+=THREE.MathUtils.degToRad(z)},
      lookAt:(x,y,z)=>group.lookAt(x,y,z),
      setColor:hex=>{group.traverse(c=>{if(c.isMesh)c.material.color.set(hex)}); if(group._light)group._light.color.set(hex)},
      setVisible:v=>{group.visible=v}, setScale:(x,y,z)=>group.scale.set(x,y,z), say,
      getHealth:()=>go._health, setHealth:n=>{go._health=n}, addHealth:n=>{go._health+=n},
      getData:k=>go._data[k], setData:(k,v)=>{go._data[k]=v},
      destroy:()=>rt._pendingDestroys.push(go.id),
      spawn:(templateId,x,y,z)=>{const tmpl=rt.sourceObjects.find(o=>o.id===templateId||o.name===templateId);if(tmpl)rt._pendingSpawns.push({tmpl,x,y,z})},
    }
    return go
  }

  _cameraAPI() {
    const rt=this
    return {
      setPosition:(x,y,z)=>{rt.camera.position.set(x,y,z);rt._cameraFollow=null},
      move:(x,y,z)=>{rt.camera.position.x+=x;rt.camera.position.y+=y;rt.camera.position.z+=z},
      lookAt:(x,y,z)=>{rt._camTarget.set(x,y,z);rt.camera.lookAt(x,y,z)},
      followTag:(tag,ox,oy,oz)=>{rt._cameraFollow={tag,ox:ox||0,oy:oy||10,oz:oz||15}},
      stopFollow:()=>{rt._cameraFollow=null},
      setFOV:(fov)=>{rt.camera.fov=fov;rt.camera.updateProjectionMatrix()},
      shake:(intensity,duration)=>{rt._shakeIntensity=intensity;rt._shakeEnd=performance.now()/1000+duration},
      reset:()=>{rt.camera.position.copy(rt._defaultCamPos);rt.camera.lookAt(rt._defaultCamTarget);rt._cameraFollow=null},
      position:()=>({x:rt.camera.position.x,y:rt.camera.position.y,z:rt.camera.position.z}),
      glideTo:(secs,tx,ty,tz)=>new Promise(r=>{
        const sx=rt.camera.position.x,sy=rt.camera.position.y,sz=rt.camera.position.z,st=performance.now()
        const step=()=>{const t=Math.min((performance.now()-st)/(secs*1000),1);rt.camera.position.set(sx+(tx-sx)*t,sy+(ty-sy)*t,sz+(tz-sz)*t);rt._cameraFollow=null;t<1?requestAnimationFrame(step):r()}
        requestAnimationFrame(step)
      }),
    }
  }

  _gameAPI() {
    const rt=this
    return {
      getScore:()=>rt._score, addScore:n=>{rt._score+=n;rt._updateUIBindings()}, setScore:n=>{rt._score=n;rt._updateUIBindings()},
      getLives:()=>rt._lives, addLives:n=>{rt._lives+=n;rt._updateUIBindings()}, setLives:n=>{rt._lives=n;rt._updateUIBindings()},
      endGame:win=>{rt._running=false;rt.onGameEnd&&rt.onGameEnd(win)},
      findByTag:tag=>Object.values(rt.gameObjects).filter(o=>!o._destroyed&&o.tag===tag),
      findNearest:(tag,x,y,z)=>{const c=Object.values(rt.gameObjects).filter(o=>!o._destroyed&&o.tag===tag);if(!c.length)return null;return c.reduce((a,b)=>a._group.position.distanceTo(new THREE.Vector3(x,y,z))<b._group.position.distanceTo(new THREE.Vector3(x,y,z))?a:b)},
      isTouching:(go,tag)=>{const bA=new THREE.Box3().setFromObject(go._group);return Object.values(rt.gameObjects).filter(o=>!o._destroyed&&o.tag===tag&&o.id!==go.id).some(o=>bA.intersectsBox(new THREE.Box3().setFromObject(o._group)))},
      getTime:()=>rt._clock.getElapsedTime()-rt._timerOffset, resetTimer:()=>{rt._timerOffset=rt._clock.getElapsedTime()},
      getName:()=>'Engine3D',
      sleep:s=>new Promise(r=>setTimeout(r,s*1000)),
      glide:(go,s,tx,ty,tz)=>new Promise(r=>{const sx=go._group.position.x,sy=go._group.position.y,sz=go._group.position.z,st=performance.now();const step=()=>{const t=Math.min((performance.now()-st)/(s*1000),1);go._group.position.set(sx+(tx-sx)*t,sy+(ty-sy)*t,sz+(tz-sz)*t);t<1?requestAnimationFrame(step):r()};requestAnimationFrame(step)}),
      broadcast:msg=>{const h=rt._msgHandlers[msg]||[];for(const{go,fn}of h){if(!go._destroyed){const p=fn();if(p&&p.then)rt._activeP[go.id+'m'+msg]=p}}},
      broadcastAndWait:async msg=>{const h=rt._msgHandlers[msg]||[];await Promise.all(h.filter(x=>!x.go._destroyed).map(x=>x.fn()))},
      onReceive:(go,msg,fn)=>{if(!rt._msgHandlers[msg])rt._msgHandlers[msg]=[];rt._msgHandlers[msg].push({go,fn})},
      onKeyDown:(go,key,fn)=>{if(!rt._keyHandlers[key])rt._keyHandlers[key]=[];rt._keyHandlers[key].push({go,fn})},
      setUIText:(id,text)=>{const n=rt._uiNodes[id];if(n)n.textContent=text},
      setUIVisible:(id,v)=>{const n=rt._uiNodes[id];if(n)n.style.display=v?'flex':'none'},
      camera: rt._cameraAPI(),
    }
  }

  _inputAPI() {
    const rt=this
    return { isKeyDown:c=>!!rt._keys[c], isMouseDown:()=>rt._mouse.down, getMouseWorld:()=>({x:rt._mouse.x,y:0,z:rt._mouse.z}) }
  }
  _mathAPI() {
    return { distance:(x1,y1,z1,x2,y2,z2)=>Math.sqrt((x2-x1)**2+(y2-y1)**2+(z2-z1)**2), lerp:(a,b,t)=>a+(b-a)*t, clamp:(v,mn,mx)=>Math.max(mn,Math.min(mx,v)), random:(a,b)=>a+Math.random()*(b-a), sin:Math.sin, cos:Math.cos, abs:Math.abs, floor:Math.floor, round:Math.round }
  }

  _compileScript(go) {
    if (!go._scriptCode) return
    try { const fn=new Function('self','game','input','math',go._scriptCode); fn(go,this._gameAPI(),this._inputAPI(),this._mathAPI()) }
    catch(e) { console.warn(`Script error in ${go.name}:`,e) }
  }

  _loadObjects() {
    for (const def of this.sourceObjects) {
      const go=this._createGameObject(def)
      this._compileScript(go)
      this.gameObjects[go.id]=go
    }
  }
  _runStartScripts() {
    for (const go of Object.values(this.gameObjects)) {
      if(go.onStart){const p=go.onStart();if(p&&p.then)this._activeP[go.id+'s']=p.catch(()=>{})}
    }
  }

  _loop() {
    this._running=true
    const animate=()=>{
      if(!this._running)return
      this._animFrame=requestAnimationFrame(animate)
      const delta=this._clock.getDelta()

      // Camera follow
      if (this._cameraFollow) {
        const {tag,ox,oy,oz}=this._cameraFollow
        const target=Object.values(this.gameObjects).find(o=>!o._destroyed&&o.tag===tag)
        if(target){
          const tp=target._group.position
          this.camera.position.lerp(new THREE.Vector3(tp.x+ox,tp.y+oy,tp.z+oz),0.08)
          this.camera.lookAt(tp.x,tp.y,tp.z)
        }
      }

      // Camera shake
      const now=performance.now()/1000
      if(now<this._shakeEnd){
        const i=this._shakeIntensity
        this.camera.position.x+=( Math.random()-0.5)*i
        this.camera.position.y+=( Math.random()-0.5)*i
      }

      for (const go of Object.values(this.gameObjects)) {
        if(go._destroyed) continue
        if(go.onUpdate&&!this._activeP[go.id]){
          const p=go.onUpdate(delta)
          if(p&&p.then)this._activeP[go.id]=p.catch(()=>{}).finally(()=>delete this._activeP[go.id])
        }
        if(go._sayEl()){
          const pos=go._group.position.clone().project(this.camera)
          const el=go._sayEl()
          el.style.left=((pos.x+1)/2*this.canvas.clientWidth)+'px'
          el.style.top=((-pos.y+1)/2*this.canvas.clientHeight-60)+'px'
        }
      }

      for(const{tmpl,x,y,z}of this._pendingSpawns){
        const id='sp_'+Math.random().toString(36).slice(2)
        const nd={...tmpl,id,position:{x,y,z}}
        const go=this._createGameObject(nd); go._scriptCode=tmpl.scriptCode||''; this._compileScript(go); this.gameObjects[id]=go
        if(go.onStart){const p=go.onStart();if(p&&p.then)this._activeP[id+'s']=p.catch(()=>{})}
      }
      this._pendingSpawns=[]

      for(const id of this._pendingDestroys){
        const go=this.gameObjects[id]; if(!go)continue; go._destroyed=true
        if(go._sayEl())go._sayEl().remove()
        if(go._group._light)this.scene.remove(go._group._light)
        this.scene.remove(go._group); go._group.traverse(c=>{if(c.isMesh){c.geometry.dispose();c.material.dispose()}})
        delete this.gameObjects[id]; delete this._activeP[id]
      }
      this._pendingDestroys=[]

      this.renderer.render(this.scene,this.camera)
    }
    animate()
  }

  destroy() {
    this._running=false
    cancelAnimationFrame(this._animFrame)
    window.removeEventListener('keydown',this._keydown)
    window.removeEventListener('keyup',this._keyup)
    this.canvas.removeEventListener('pointerdown',this._mousedown)
    this.canvas.removeEventListener('pointerup',this._mouseup)
    this.canvas.removeEventListener('pointermove',this._mousemove)
    if(this._uiContainer)this._uiContainer.remove()
    this.renderer.dispose()
  }
}

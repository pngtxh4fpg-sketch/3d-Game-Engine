export function saveProject(projectData) {
  const json = JSON.stringify(projectData, null, 2)
  download(json, `${projectData.gameName||'project'}.e3d.json`, 'application/json')
}

export function loadProject(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = e => { try { resolve(JSON.parse(e.target.result)) } catch(err) { reject(err) } }
    r.onerror = reject
    r.readAsText(file)
  })
}

export function exportGame(projectData) {
  const { gameName = 'My Game', objects = [], uiElements = [] } = projectData
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${gameName}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#111122;overflow:hidden;width:100vw;height:100vh;font-family:'Segoe UI',system-ui,sans-serif;color:#fff;}
    #c{width:100%;height:100%;display:block;}
    #ui-layer{position:fixed;inset:0;pointer-events:none;}
    .ui-el{position:absolute;display:flex;align-items:center;justify-content:center;padding:4px 12px;white-space:nowrap;transform:translateX(-50%);}
    .ui-btn{pointer-events:auto;cursor:pointer;}
    #overlay{position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;}
    #overlay h1{font-size:36px;}
    #overlay button{padding:12px 32px;font-size:18px;background:#4a90e2;color:#fff;border:none;border-radius:8px;cursor:pointer;}
    .hidden{display:none!important;}
  </style>
</head>
<body>
<canvas id="c"></canvas>
<div id="ui-layer"></div>
<div id="overlay">
  <h1>${gameName}</h1>
  <button id="start-btn">▶ Start Game</button>
</div>
<script src="https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.min.js"></script>
<script>
const OBJECTS=${JSON.stringify(objects)};
const UI_ELEMENTS=${JSON.stringify(uiElements)};
${buildRuntime()}
document.getElementById('start-btn').onclick=()=>{
  document.getElementById('overlay').classList.add('hidden');
  startGame(OBJECTS,UI_ELEMENTS);
};
</script>
</body>
</html>`
  download(html, `${gameName}.html`, 'text/html')
}

function buildRuntime() { return `
function startGame(objects, uiElements) {
  const canvas=document.getElementById('c');
  const uiLayer=document.getElementById('ui-layer');

  // Build UI
  const uiNodes={};
  for(const el of uiElements){
    if(!el.visible)continue;
    const node=document.createElement('div');
    node.className='ui-el'+(el.type==='button'?' ui-btn':'');
    node.style.cssText='left:'+el.x+'%;top:'+el.y+'%;min-width:'+el.width+'px;min-height:'+el.height+'px;font-size:'+el.fontSize+'px;color:'+el.color+';background:'+el.bgColor+';border-radius:'+el.borderRadius+'px;font-weight:'+(el.bold?700:400)+';';
    node.textContent=el.label.replace('{score}','0').replace('{lives}','10');
    node.dataset.elId=el.id;node.dataset.label=el.label;
    uiLayer.appendChild(node);
    uiNodes[el.customId||el.id]=node;
    uiNodes[el.id]=node;
  }
  function updateUI(score,lives){
    for(const el of uiElements){
      const node=uiNodes[el.id];if(!node)continue;
      node.textContent=el.label.replace('{score}',score).replace('{lives}',lives);
    }
  }

  const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(canvas.clientWidth,canvas.clientHeight);
  renderer.shadowMap.enabled=true;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x111122);
  const camera=new THREE.PerspectiveCamera(60,canvas.clientWidth/canvas.clientHeight,0.1,1000);
  camera.position.set(0,15,20);camera.lookAt(0,0,0);
  scene.add(new THREE.AmbientLight(0xffffff,0.6));
  const sun=new THREE.DirectionalLight(0xffffff,1.2);sun.position.set(10,20,10);sun.castShadow=true;scene.add(sun);
  scene.add(new THREE.GridHelper(50,50,0x333355,0x222244));
  window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

  let _score=0,_lives=10,_running=true,_timerOffset=performance.now()/1000;
  const _keys={},_mouse={x:0,z:0,down:false};
  const _msgHandlers={},_keyHandlers={},_activeP={};
  const pendingSpawns=[],pendingDestroys=[];
  const gameObjects={};

  window.addEventListener('keydown',e=>{
    if(!_keys[e.code]){const h=_keyHandlers[e.code]||[];for(const{go,fn}of h){if(!go._destroyed){const p=fn();if(p&&p.then)_activeP[go.id+'_k'+e.code]=p;}}}
    _keys[e.code]=true;
  });
  window.addEventListener('keyup',e=>{_keys[e.code]=false;});
  canvas.addEventListener('pointerdown',()=>_mouse.down=true);
  canvas.addEventListener('pointerup',()=>_mouse.down=false);
  canvas.addEventListener('pointermove',e=>{
    const nx=(e.clientX/innerWidth)*2-1,ny=-(e.clientY/innerHeight)*2+1;
    const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(nx,ny),camera);
    const plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);const hit=new THREE.Vector3();
    ray.ray.intersectPlane(plane,hit);_mouse.x=hit.x;_mouse.z=hit.z;
  });

  const gameAPI={
    getScore:()=>_score,addScore:n=>{_score+=n;updateUI(_score,_lives);},setScore:n=>{_score=n;updateUI(_score,_lives);},
    getLives:()=>_lives,addLives:n=>{_lives+=n;updateUI(_score,_lives);},setLives:n=>{_lives=n;updateUI(_score,_lives);},
    endGame:win=>{_running=false;const o=document.getElementById('overlay');o.classList.remove('hidden');o.querySelector('h1').textContent=win?'🏆 You Win!':'💀 Game Over';o.querySelector('button').textContent='↺ Restart';o.querySelector('button').onclick=()=>location.reload();},
    findByTag:tag=>Object.values(gameObjects).filter(o=>!o._destroyed&&o.tag===tag),
    findNearest:(tag,x,y,z)=>{const c=Object.values(gameObjects).filter(o=>!o._destroyed&&o.tag===tag);if(!c.length)return null;return c.reduce((a,b)=>a._group.position.distanceTo(new THREE.Vector3(x,y,z))<b._group.position.distanceTo(new THREE.Vector3(x,y,z))?a:b);},
    isTouching:(go,tag)=>{const bA=new THREE.Box3().setFromObject(go._group);return Object.values(gameObjects).filter(o=>!o._destroyed&&o.tag===tag&&o.id!==go.id).some(o=>bA.intersectsBox(new THREE.Box3().setFromObject(o._group)));},
    getTime:()=>performance.now()/1000-_timerOffset,resetTimer:()=>{_timerOffset=performance.now()/1000;},getName:()=>'Engine3D',
    sleep:s=>new Promise(r=>setTimeout(r,s*1000)),
    glide:(go,s,tx,ty,tz)=>new Promise(r=>{const sx=go._group.position.x,sy=go._group.position.y,sz=go._group.position.z,st=performance.now();const step=()=>{const t=Math.min((performance.now()-st)/(s*1000),1);go._group.position.set(sx+(tx-sx)*t,sy+(ty-sy)*t,sz+(tz-sz)*t);t<1?requestAnimationFrame(step):r();};requestAnimationFrame(step);}),
    broadcast:msg=>{const h=_msgHandlers[msg]||[];for(const{go,fn}of h){if(!go._destroyed){const p=fn();if(p&&p.then)_activeP[go.id+'_m'+msg]=p;}}},
    broadcastAndWait:async msg=>{const h=_msgHandlers[msg]||[];await Promise.all(h.filter(x=>!x.go._destroyed).map(x=>x.fn()));},
    onReceive:(go,msg,fn)=>{if(!_msgHandlers[msg])_msgHandlers[msg]=[];_msgHandlers[msg].push({go,fn});},
    onKeyDown:(go,key,fn)=>{if(!_keyHandlers[key])_keyHandlers[key]=[];_keyHandlers[key].push({go,fn});},
    setUIText:(id,text)=>{const n=uiNodes[id];if(n)n.textContent=text;},
    setUIVisible:(id,v)=>{const n=uiNodes[id];if(n)n.style.display=v?'flex':'none';},
  };
  const inputAPI={isKeyDown:c=>!!_keys[c],isMouseDown:()=>_mouse.down,getMouseWorld:()=>({x:_mouse.x,y:0,z:_mouse.z})};
  const mathAPI={distance:(x1,y1,z1,x2,y2,z2)=>Math.sqrt((x2-x1)**2+(y2-y1)**2+(z2-z1)**2),lerp:(a,b,t)=>a+(b-a)*t,clamp:(v,mn,mx)=>Math.max(mn,Math.min(mx,v)),random:(a,b)=>a+Math.random()*(b-a),sin:Math.sin,cos:Math.cos,abs:Math.abs,floor:Math.floor,round:Math.round};

  function makeMesh(def){
    let geo;
    switch(def.type){case 'sphere':geo=new THREE.SphereGeometry(0.5,24,24);break;case 'cylinder':geo=new THREE.CylinderGeometry(0.5,0.5,1,24);break;case 'cone':geo=new THREE.ConeGeometry(0.5,1,24);break;case 'plane':geo=new THREE.PlaneGeometry(1,1);break;default:geo=new THREE.BoxGeometry(1,1,1);}
    const mat=new THREE.MeshStandardMaterial({color:def.color||'#4a90e2',roughness:0.6});
    const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;
    m.position.set(def.position.x,def.position.y,def.position.z);
    m.rotation.set(THREE.MathUtils.degToRad(def.rotation.x),THREE.MathUtils.degToRad(def.rotation.y),THREE.MathUtils.degToRad(def.rotation.z));
    m.scale.set(def.scale.x,def.scale.y,def.scale.z);
    return m;
  }
  function buildGroup(def){
    const group=new THREE.Group();
    if(def.parts&&def.parts.length>0){for(const p of def.parts)group.add(makeMesh(p));}
    else group.add(makeMesh(def));
    group.position.set(def.position.x,def.position.y,def.position.z);
    group.rotation.set(THREE.MathUtils.degToRad(def.rotation.x),THREE.MathUtils.degToRad(def.rotation.y),THREE.MathUtils.degToRad(def.rotation.z));
    group.scale.set(def.scale.x,def.scale.y,def.scale.z);
    if(!def.visible)group.visible=false;
    scene.add(group);return group;
  }
  function createGO(def){
    const group=buildGroup(def);
    const go={id:def.id,name:def.name,tag:def.tag||'',mesh:group,_group:group,_health:def.health||100,_data:{},_destroyed:false,_scriptCode:def.scriptCode||'',
      onStart:null,onUpdate:null,onClick:null,
      get position(){return{x:group.position.x,y:group.position.y,z:group.position.z};},
      move:(x,y,z)=>{group.position.x+=x;group.position.y+=y;group.position.z+=z;},
      moveTo:(x,y,z)=>group.position.set(x,y,z),
      moveToward:(tId,speed,delta)=>{const t=gameObjects[tId];if(!t||t._destroyed)return;const d=new THREE.Vector3().subVectors(t._group.position,group.position).normalize();group.position.addScaledVector(d,speed*delta);},
      rotate:(x,y,z)=>{group.rotation.x+=THREE.MathUtils.degToRad(x);group.rotation.y+=THREE.MathUtils.degToRad(y);group.rotation.z+=THREE.MathUtils.degToRad(z);},
      lookAt:(x,y,z)=>group.lookAt(x,y,z),
      setColor:hex=>{group.traverse(c=>{if(c.isMesh)c.material.color.set(hex);});},
      setVisible:v=>{group.visible=v;},setScale:(x,y,z)=>group.scale.set(x,y,z),
      say:text=>{},
      getHealth:()=>go._health,setHealth:n=>{go._health=n;},addHealth:n=>{go._health+=n;},
      getData:k=>go._data[k],setData:(k,v)=>{go._data[k]=v;},
      destroy:()=>pendingDestroys.push(go.id),
      spawn:(templateId,x,y,z)=>{const tmpl=objects.find(o=>o.id===templateId||o.name===templateId);if(tmpl)pendingSpawns.push({tmpl,x,y,z});},
    };return go;
  }
  function compile(go){
    if(!go._scriptCode)return;
    try{const fn=new Function('self','game','input','math',go._scriptCode);fn(go,gameAPI,inputAPI,mathAPI);}
    catch(e){console.warn('Script error',go.name,e);}
  }

  for(const def of objects){const go=createGO(def);compile(go);gameObjects[go.id]=go;}
  for(const go of Object.values(gameObjects)){if(go.onStart){const p=go.onStart();if(p&&p.then)_activeP[go.id+'_s']=p.catch(()=>{});}}

  let last=performance.now();
  function loop(){
    if(!_running)return;requestAnimationFrame(loop);
    const now=performance.now(),delta=(now-last)/1000;last=now;
    for(const go of Object.values(gameObjects)){
      if(go._destroyed)continue;
      if(go.onUpdate&&!_activeP[go.id]){
        const p=go.onUpdate(delta);
        if(p&&p.then)_activeP[go.id]=p.catch(()=>{}).finally(()=>delete _activeP[go.id]);
      }
    }
    for(const{tmpl,x,y,z}of pendingSpawns){
      const id='sp_'+Math.random().toString(36).slice(2);
      const nd={...tmpl,id,position:{x,y,z}};
      const go=createGO(nd);go._scriptCode=tmpl.scriptCode||'';compile(go);gameObjects[id]=go;
      if(go.onStart){const p=go.onStart();if(p&&p.then)_activeP[id+'_s']=p.catch(()=>{});}
    }
    pendingSpawns.length=0;
    for(const id of pendingDestroys){
      const go=gameObjects[id];if(!go)continue;go._destroyed=true;
      scene.remove(go._group);go._group.traverse(c=>{if(c.isMesh){c.geometry.dispose();c.material.dispose();}});
      delete gameObjects[id];delete _activeP[id];
    }
    pendingDestroys.length=0;
    renderer.render(scene,camera);
  }
  loop();
}
`}

function download(content, filename, mime) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type: mime }))
  a.download = filename; a.click()
  URL.revokeObjectURL(a.href)
}

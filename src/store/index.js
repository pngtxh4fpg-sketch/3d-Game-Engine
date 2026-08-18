import { create } from 'zustand'

let nextId = 1
let nextPartId = 1
let nextLevelId = 1

const DEFAULT_LEVEL = (name) => ({
  id: `lvl_${nextLevelId++}`,
  name: name || `Level ${nextLevelId}`,
  objects: [],
  uiElements: [],
  skyColor: '#111122',
  mapSize: 50,
  fogEnabled: true,
  ambientColor: '#ffffff',
  ambientIntensity: 0.5,
  cameraPosition: { x: 0, y: 15, z: 20 },
  cameraLookAt:   { x: 0, y: 0,  z: 0  },
  cameraFOV: 60,
})

const DEFAULT_OBJECT = (type, name) => ({
  id: `obj_${nextId++}`,
  name: name || `${type}_${nextId}`,
  type,
  tag: '',
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  color: '#4a90e2',
  visible: true,
  health: 100,
  parts: [],
  scriptState: null,
  scriptCode: '',
  // Light-specific (only used when type is pointlight/spotlight/dirlight)
  lightColor: '#ffffff',
  lightIntensity: 1.0,
  lightDistance: 20,
  lightAngle: 45,
  castShadow: true,
})

const DEFAULT_UI = (type) => ({
  id: `ui_${nextId++}`,
  type,
  label: type==='score'?'Score: {score}':type==='lives'?'Lives: {lives}':'Text',
  x: 50, y: 5, width: 120, height: 36, fontSize: 18,
  color: '#ffffff', bgColor: 'rgba(0,0,0,0.5)', borderRadius: 8,
  bold: false, visible: true,
  binding: type==='score'?'score':type==='lives'?'lives':'',
  customId: `ui_${nextId}`,
})

// Helpers used outside the store
export const getLevelById = (levels, id) => levels.find(l => l.id === id)
export const getCurrentLevel = (s) => s.levels.find(l => l.id === s.currentLevelId) || s.levels[0]

export const useStore = create((set, get) => {
  const firstLevel = DEFAULT_LEVEL('Level 1')

  const onCurrentLevel = (fn) => set(s => ({
    levels: s.levels.map(l => l.id === s.currentLevelId ? { ...l, ...fn(l) } : l)
  }))

  return {
    levels: [firstLevel],
    currentLevelId: firstLevel.id,
    selectedId: null,
    selectedUIId: null,
    mode: 'edit',
    gameName: 'My Game',

    // ── Level selectors (call from components) ──────────────────────────────
    getCurrentLevel: () => getCurrentLevel(get()),
    getObjects: () => getCurrentLevel(get()).objects,
    getUIElements: () => getCurrentLevel(get()).uiElements,

    // ── Level CRUD ──────────────────────────────────────────────────────────
    addLevel: () => {
      const lvl = DEFAULT_LEVEL()
      set(s => ({ levels: [...s.levels, lvl], currentLevelId: lvl.id, selectedId: null }))
      return lvl.id
    },
    removeLevel: (id) => set(s => {
      if (s.levels.length <= 1) return s
      const remaining = s.levels.filter(l => l.id !== id)
      return { levels: remaining, currentLevelId: s.currentLevelId === id ? remaining[0].id : s.currentLevelId }
    }),
    switchLevel: (id) => set({ currentLevelId: id, selectedId: null, selectedUIId: null }),
    updateLevel: (id, changes) => set(s => ({
      levels: s.levels.map(l => l.id === id ? { ...l, ...changes } : l)
    })),
    duplicateLevel: (id) => {
      const src = get().levels.find(l => l.id === id)
      if (!src) return
      const copy = { ...src, id: `lvl_${nextLevelId++}`, name: src.name + ' (copy)',
        objects: src.objects.map(o => ({ ...o, id: `obj_${nextId++}` })),
        uiElements: src.uiElements.map(e => ({ ...e, id: `ui_${nextId++}` })),
      }
      set(s => ({ levels: [...s.levels, copy], currentLevelId: copy.id }))
    },

    // ── Object CRUD (on current level) ──────────────────────────────────────
    addObject: (type) => {
      const obj = DEFAULT_OBJECT(type, `${type}_${nextId}`)
      // Light defaults
      if (type === 'pointlight') { obj.color = '#ffdd88'; obj.lightColor = '#ffdd88' }
      if (type === 'dirlight')   { obj.color = '#ffffff'; obj.lightColor = '#ffffff'; obj.rotation = { x: -45, y: 30, z: 0 } }
      if (type === 'spotlight')  { obj.color = '#ffffff'; obj.lightColor = '#ffffff'; obj.rotation = { x: -90, y: 0, z: 0 } }
      onCurrentLevel(l => ({ objects: [...l.objects, obj] }))
      return obj.id
    },
    removeObject: (id) => {
      onCurrentLevel(l => ({ objects: l.objects.filter(o => o.id !== id) }))
      set(s => s.selectedId === id ? { selectedId: null } : {})
    },
    selectObject: (id) => set({ selectedId: id }),
    updateObject: (id, changes) => onCurrentLevel(l => ({
      objects: l.objects.map(o => o.id === id ? { ...o, ...changes } : o)
    })),
    updateObjectScript: (id, scriptState, scriptCode) => onCurrentLevel(l => ({
      objects: l.objects.map(o => o.id === id ? { ...o, scriptState, scriptCode } : o)
    })),
    duplicateObject: (id) => {
      const obj = getCurrentLevel(get()).objects.find(o => o.id === id)
      if (!obj) return
      const copy = { ...obj, id: `obj_${nextId++}`, name: obj.name+'_copy', position: { ...obj.position, x: obj.position.x+1 } }
      onCurrentLevel(l => ({ objects: [...l.objects, copy] }))
      return copy.id
    },

    // ── Parts ───────────────────────────────────────────────────────────────
    addPart: (objectId, type) => {
      const part = { id:`part_${nextPartId++}`, type, position:{x:0,y:0,z:0}, rotation:{x:0,y:0,z:0}, scale:{x:1,y:1,z:1}, color:'#4a90e2' }
      onCurrentLevel(l => ({ objects: l.objects.map(o => o.id===objectId?{...o,parts:[...o.parts,part]}:o) }))
      return part.id
    },
    updatePart: (objectId, partId, changes) => onCurrentLevel(l => ({
      objects: l.objects.map(o => o.id===objectId?{...o,parts:o.parts.map(p=>p.id===partId?{...p,...changes}:p)}:o)
    })),
    removePart: (objectId, partId) => onCurrentLevel(l => ({
      objects: l.objects.map(o => o.id===objectId?{...o,parts:o.parts.filter(p=>p.id!==partId)}:o)
    })),
    duplicatePart: (objectId, partId) => {
      const obj = getCurrentLevel(get()).objects.find(o => o.id===objectId)
      const part = obj?.parts.find(p => p.id===partId)
      if (!part) return
      const copy = { ...part, id:`part_${nextPartId++}`, position:{...part.position,y:part.position.y+0.5} }
      onCurrentLevel(l => ({ objects: l.objects.map(o => o.id===objectId?{...o,parts:[...o.parts,copy]}:o) }))
    },

    // ── UI elements ─────────────────────────────────────────────────────────
    addUIElement: (type) => {
      const el = DEFAULT_UI(type)
      onCurrentLevel(l => ({ uiElements: [...l.uiElements, el] }))
      set({ selectedUIId: el.id })
      return el.id
    },
    removeUIElement: (id) => {
      onCurrentLevel(l => ({ uiElements: l.uiElements.filter(e => e.id!==id) }))
      set(s => s.selectedUIId===id?{selectedUIId:null}:{})
    },
    updateUIElement: (id, changes) => onCurrentLevel(l => ({
      uiElements: l.uiElements.map(e => e.id===id?{...e,...changes}:e)
    })),
    selectUIElement: (id) => set({ selectedUIId: id }),

    // ── Mode ────────────────────────────────────────────────────────────────
    setMode: (mode) => set({ mode }),
    setGameName: (gameName) => set({ gameName }),

    // ── Project I/O ─────────────────────────────────────────────────────────
    loadProject: (data) => {
      nextId = data.nextId || 100
      if (data.levels) {
        set({ levels: data.levels, currentLevelId: data.currentLevelId||data.levels[0].id, gameName: data.gameName||'My Game', selectedId: null, mode: 'edit' })
      } else {
        // Legacy format
        const lvl = { ...DEFAULT_LEVEL('Level 1'), objects: data.objects||[], uiElements: data.uiElements||[] }
        set({ levels: [lvl], currentLevelId: lvl.id, gameName: data.gameName||'My Game', selectedId: null, mode: 'edit' })
      }
    },
    getProject: () => {
      const s = get()
      return { version: 3, gameName: s.gameName, levels: s.levels, currentLevelId: s.currentLevelId, nextId }
    },
    clearScene: () => onCurrentLevel(() => ({ objects: [], uiElements: [] })),
  }
})

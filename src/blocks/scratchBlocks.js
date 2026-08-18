import * as Blockly from 'blockly'
import { javascriptGenerator, Order } from 'blockly/javascript'

const C = {
  MOTION:  '#2980b9',
  LOOKS:   '#9b59b6',
  CONTROL: '#e67e22',
  SENSING: '#16a085',
  EVENTS:  '#c0392b',
  SOUND:   '#1abc9c',
}

// ── MOTION ───────────────────────────────────────────────────────────────────

Blockly.Blocks['scratch_move_steps'] = {
  init() {
    this.appendValueInput('STEPS').setCheck('Number').appendField('move')
    this.appendDummyInput().appendField('steps forward')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
    this.setTooltip('Move forward along the direction the object is facing')
  }
}
javascriptGenerator.forBlock['scratch_move_steps'] = (block, gen) => {
  const steps = gen.valueToCode(block, 'STEPS', Order.ATOMIC) || '10'
  return `(function(){const _a=self.mesh?self.mesh.rotation.y:0;self.move(Math.sin(_a)*${steps},0,Math.cos(_a)*${steps});})();\n`
}

Blockly.Blocks['scratch_turn_cw'] = {
  init() {
    this.appendValueInput('DEG').setCheck('Number').appendField('turn ↻')
    this.appendDummyInput().appendField('degrees')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['scratch_turn_cw'] = (block, gen) => {
  const deg = gen.valueToCode(block, 'DEG', Order.ATOMIC) || '15'
  return `self.rotate(0, -${deg}, 0);\n`
}

Blockly.Blocks['scratch_turn_ccw'] = {
  init() {
    this.appendValueInput('DEG').setCheck('Number').appendField('turn ↺')
    this.appendDummyInput().appendField('degrees')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['scratch_turn_ccw'] = (block, gen) => {
  const deg = gen.valueToCode(block, 'DEG', Order.ATOMIC) || '15'
  return `self.rotate(0, ${deg}, 0);\n`
}

Blockly.Blocks['scratch_glide'] = {
  init() {
    this.appendValueInput('SECS').setCheck('Number').appendField('glide')
    this.appendValueInput('X').setCheck('Number').appendField('secs to X')
    this.appendValueInput('Y').setCheck('Number').appendField('Y')
    this.appendValueInput('Z').setCheck('Number').appendField('Z')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
    this.setTooltip('Smoothly move to position over N seconds (use in On Start or with await)')
  }
}
javascriptGenerator.forBlock['scratch_glide'] = (block, gen) => {
  const secs = gen.valueToCode(block, 'SECS', Order.ATOMIC) || '1'
  const x = gen.valueToCode(block, 'X', Order.ATOMIC) || '0'
  const y = gen.valueToCode(block, 'Y', Order.ATOMIC) || '0'
  const z = gen.valueToCode(block, 'Z', Order.ATOMIC) || '0'
  return `await game.glide(self, ${secs}, ${x}, ${y}, ${z});\n`
}

Blockly.Blocks['scratch_change_x'] = {
  init() {
    this.appendValueInput('V').setCheck('Number').appendField('change X by')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['scratch_change_x'] = (block, gen) => {
  const v = gen.valueToCode(block, 'V', Order.ATOMIC) || '0'
  return `self.move(${v}, 0, 0);\n`
}

Blockly.Blocks['scratch_change_y'] = {
  init() {
    this.appendValueInput('V').setCheck('Number').appendField('change Y by')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['scratch_change_y'] = (block, gen) => {
  const v = gen.valueToCode(block, 'V', Order.ATOMIC) || '0'
  return `self.move(0, ${v}, 0);\n`
}

Blockly.Blocks['scratch_change_z'] = {
  init() {
    this.appendValueInput('V').setCheck('Number').appendField('change Z by')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['scratch_change_z'] = (block, gen) => {
  const v = gen.valueToCode(block, 'V', Order.ATOMIC) || '0'
  return `self.move(0, 0, ${v});\n`
}

Blockly.Blocks['scratch_set_x'] = {
  init() {
    this.appendValueInput('V').setCheck('Number').appendField('set X to')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['scratch_set_x'] = (block, gen) => {
  const v = gen.valueToCode(block, 'V', Order.ATOMIC) || '0'
  return `self.moveTo(${v}, self.position.y, self.position.z);\n`
}

Blockly.Blocks['scratch_set_y'] = {
  init() {
    this.appendValueInput('V').setCheck('Number').appendField('set Y to')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['scratch_set_y'] = (block, gen) => {
  const v = gen.valueToCode(block, 'V', Order.ATOMIC) || '0'
  return `self.moveTo(self.position.x, ${v}, self.position.z);\n`
}

Blockly.Blocks['scratch_set_z'] = {
  init() {
    this.appendValueInput('V').setCheck('Number').appendField('set Z to')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['scratch_set_z'] = (block, gen) => {
  const v = gen.valueToCode(block, 'V', Order.ATOMIC) || '0'
  return `self.moveTo(self.position.x, self.position.y, ${v});\n`
}

Blockly.Blocks['scratch_point_toward'] = {
  init() {
    this.appendValueInput('TAG').setCheck('String').appendField('point toward nearest tag')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['scratch_point_toward'] = (block, gen) => {
  const tag = gen.valueToCode(block, 'TAG', Order.ATOMIC) || '""'
  return `(function(){const _t=game.findNearest(${tag},self.position.x,self.position.y,self.position.z);if(_t)self.lookAt(_t.position.x,_t.position.y,_t.position.z);})();\n`
}

Blockly.Blocks['scratch_bounce_edge'] = {
  init() {
    this.appendValueInput('MIN').setCheck('Number').appendField('bounce on edge min')
    this.appendValueInput('MAX').setCheck('Number').appendField('max (X/Z)')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
    this.setTooltip('Reflects movement when object goes outside the min/max boundary on X and Z')
  }
}
javascriptGenerator.forBlock['scratch_bounce_edge'] = (block, gen) => {
  const min = gen.valueToCode(block, 'MIN', Order.ATOMIC) || '-10'
  const max = gen.valueToCode(block, 'MAX', Order.ATOMIC) || '10'
  return `(function(){
  const _mn=${min},_mx=${max};
  if(self.position.x<_mn){self.moveTo(_mn,self.position.y,self.position.z);self.rotate(0,180,0);}
  if(self.position.x>_mx){self.moveTo(_mx,self.position.y,self.position.z);self.rotate(0,180,0);}
  if(self.position.z<_mn){self.moveTo(self.position.x,self.position.y,_mn);self.rotate(0,180,0);}
  if(self.position.z>_mx){self.moveTo(self.position.x,self.position.y,_mx);self.rotate(0,180,0);}
})();\n`
}

Blockly.Blocks['scratch_direction'] = {
  init() {
    this.appendDummyInput().appendField('direction (°)')
    this.setOutput(true, 'Number'); this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['scratch_direction'] = () =>
  [`(self.mesh ? Math.round(self.mesh.rotation.y * 180 / Math.PI) : 0)`, Order.FUNCTION_CALL]

// ── LOOKS ────────────────────────────────────────────────────────────────────

Blockly.Blocks['scratch_say'] = {
  init() {
    this.appendValueInput('TEXT').appendField('say')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.LOOKS)
  }
}
javascriptGenerator.forBlock['scratch_say'] = (block, gen) => {
  const text = gen.valueToCode(block, 'TEXT', Order.ATOMIC) || '""'
  return `self.say(${text});\n`
}

Blockly.Blocks['scratch_say_for'] = {
  init() {
    this.appendValueInput('TEXT').appendField('say')
    this.appendValueInput('SECS').setCheck('Number').appendField('for')
    this.appendDummyInput().appendField('seconds')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.LOOKS)
  }
}
javascriptGenerator.forBlock['scratch_say_for'] = (block, gen) => {
  const text = gen.valueToCode(block, 'TEXT', Order.ATOMIC) || '""'
  const secs = gen.valueToCode(block, 'SECS', Order.ATOMIC) || '2'
  return `self.say(${text}); await game.sleep(${secs}); self.say('');\n`
}

Blockly.Blocks['scratch_think'] = {
  init() {
    this.appendValueInput('TEXT').appendField('think')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.LOOKS)
  }
}
javascriptGenerator.forBlock['scratch_think'] = (block, gen) => {
  const text = gen.valueToCode(block, 'TEXT', Order.ATOMIC) || '""'
  return `self.say('💭 '+${text});\n`
}

Blockly.Blocks['scratch_set_size'] = {
  init() {
    this.appendValueInput('SIZE').setCheck('Number').appendField('set size to')
    this.appendDummyInput().appendField('%')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.LOOKS)
  }
}
javascriptGenerator.forBlock['scratch_set_size'] = (block, gen) => {
  const size = gen.valueToCode(block, 'SIZE', Order.ATOMIC) || '100'
  return `self.setScale(${size}/100, ${size}/100, ${size}/100);\n`
}

Blockly.Blocks['scratch_change_size'] = {
  init() {
    this.appendValueInput('SIZE').setCheck('Number').appendField('change size by')
    this.appendDummyInput().appendField('%')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.LOOKS)
  }
}
javascriptGenerator.forBlock['scratch_change_size'] = (block, gen) => {
  const size = gen.valueToCode(block, 'SIZE', Order.ATOMIC) || '10'
  return `(function(){const _s=${size}/100;self.setScale(self.mesh.scale.x+_s,self.mesh.scale.y+_s,self.mesh.scale.z+_s);})();\n`
}

Blockly.Blocks['scratch_size'] = {
  init() {
    this.appendDummyInput().appendField('size (%)')
    this.setOutput(true, 'Number'); this.setColour(C.LOOKS)
  }
}
javascriptGenerator.forBlock['scratch_size'] = () =>
  [`(self.mesh ? Math.round(self.mesh.scale.x * 100) : 100)`, Order.FUNCTION_CALL]

// ── CONTROL ──────────────────────────────────────────────────────────────────

Blockly.Blocks['scratch_wait'] = {
  init() {
    this.appendValueInput('SECS').setCheck('Number').appendField('wait')
    this.appendDummyInput().appendField('seconds')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.CONTROL)
    this.setTooltip('Pause execution for N seconds. Only works inside On Start.')
  }
}
javascriptGenerator.forBlock['scratch_wait'] = (block, gen) => {
  const secs = gen.valueToCode(block, 'SECS', Order.ATOMIC) || '1'
  return `await game.sleep(${secs});\n`
}

Blockly.Blocks['scratch_forever'] = {
  init() {
    this.appendDummyInput().appendField('forever')
    this.appendStatementInput('BODY')
    this.setPreviousStatement(true)
    this.setColour(C.CONTROL)
    this.setTooltip('Loops forever. Use inside On Start with await sleep() to pace it.')
  }
}
javascriptGenerator.forBlock['scratch_forever'] = (block, gen) => {
  const body = gen.statementToCode(block, 'BODY')
  return `while(true) {\n${body}await game.sleep(0.016);\n}\n`
}

Blockly.Blocks['scratch_wait_until'] = {
  init() {
    this.appendValueInput('COND').setCheck('Boolean').appendField('wait until')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.CONTROL)
  }
}
javascriptGenerator.forBlock['scratch_wait_until'] = (block, gen) => {
  const cond = gen.valueToCode(block, 'COND', Order.ATOMIC) || 'true'
  return `while(!(${cond})){await game.sleep(0.016);}\n`
}

Blockly.Blocks['scratch_repeat_until'] = {
  init() {
    this.appendValueInput('COND').setCheck('Boolean').appendField('repeat until')
    this.appendStatementInput('BODY')
    this.setColour(C.CONTROL)
    this.setPreviousStatement(true); this.setNextStatement(true)
  }
}
javascriptGenerator.forBlock['scratch_repeat_until'] = (block, gen) => {
  const cond = gen.valueToCode(block, 'COND', Order.ATOMIC) || 'false'
  const body = gen.statementToCode(block, 'BODY')
  return `while(!(${cond})){\n${body}}\n`
}

Blockly.Blocks['scratch_stop_script'] = {
  init() {
    this.appendDummyInput().appendField('stop this script')
    this.setPreviousStatement(true)
    this.setColour(C.CONTROL)
  }
}
javascriptGenerator.forBlock['scratch_stop_script'] = () => `return;\n`

Blockly.Blocks['scratch_stop_all'] = {
  init() {
    this.appendDummyInput().appendField('stop all scripts')
    this.setPreviousStatement(true)
    this.setColour(C.CONTROL)
  }
}
javascriptGenerator.forBlock['scratch_stop_all'] = () => `game.endGame(false);\nreturn;\n`

Blockly.Blocks['scratch_create_clone'] = {
  init() {
    this.appendDummyInput().appendField('create clone of myself')
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.CONTROL)
  }
}
javascriptGenerator.forBlock['scratch_create_clone'] = () =>
  `self.spawn(self.name, self.position.x, self.position.y, self.position.z);\n`

Blockly.Blocks['scratch_delete_clone'] = {
  init() {
    this.appendDummyInput().appendField('delete this clone')
    this.setPreviousStatement(true)
    this.setColour(C.CONTROL)
  }
}
javascriptGenerator.forBlock['scratch_delete_clone'] = () => `self.destroy();\nreturn;\n`

// ── SENSING ──────────────────────────────────────────────────────────────────

Blockly.Blocks['scratch_touching_tag'] = {
  init() {
    this.appendValueInput('TAG').setCheck('String').appendField('touching tag')
    this.appendDummyInput().appendField('?')
    this.setInputsInline(true)
    this.setOutput(true, 'Boolean'); this.setColour(C.SENSING)
    this.setTooltip('True if this object overlaps any object with the given tag')
  }
}
javascriptGenerator.forBlock['scratch_touching_tag'] = (block, gen) => {
  const tag = gen.valueToCode(block, 'TAG', Order.ATOMIC) || '""'
  return [`game.isTouching(self, ${tag})`, Order.FUNCTION_CALL]
}

Blockly.Blocks['scratch_distance_to'] = {
  init() {
    this.appendValueInput('TAG').setCheck('String').appendField('distance to nearest tag')
    this.setInputsInline(true)
    this.setOutput(true, 'Number'); this.setColour(C.SENSING)
  }
}
javascriptGenerator.forBlock['scratch_distance_to'] = (block, gen) => {
  const tag = gen.valueToCode(block, 'TAG', Order.ATOMIC) || '""'
  return [`(function(){const _t=game.findNearest(${tag},self.position.x,self.position.y,self.position.z);return _t?math.distance(self.position.x,self.position.y,self.position.z,_t.position.x,_t.position.y,_t.position.z):9999;})()`, Order.FUNCTION_CALL]
}

Blockly.Blocks['scratch_timer'] = {
  init() {
    this.appendDummyInput().appendField('timer (s)')
    this.setOutput(true, 'Number'); this.setColour(C.SENSING)
  }
}
javascriptGenerator.forBlock['scratch_timer'] = () => [`game.getTime()`, Order.FUNCTION_CALL]

Blockly.Blocks['scratch_reset_timer'] = {
  init() {
    this.appendDummyInput().appendField('reset timer')
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.SENSING)
  }
}
javascriptGenerator.forBlock['scratch_reset_timer'] = () => `game.resetTimer();\n`

Blockly.Blocks['scratch_username'] = {
  init() {
    this.appendDummyInput().appendField('game name')
    this.setOutput(true, 'String'); this.setColour(C.SENSING)
  }
}
javascriptGenerator.forBlock['scratch_username'] = () => [`game.getName()`, Order.FUNCTION_CALL]

// ── EVENTS ───────────────────────────────────────────────────────────────────

Blockly.Blocks['scratch_broadcast'] = {
  init() {
    this.appendValueInput('MSG').setCheck('String').appendField('broadcast')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.EVENTS)
  }
}
javascriptGenerator.forBlock['scratch_broadcast'] = (block, gen) => {
  const msg = gen.valueToCode(block, 'MSG', Order.ATOMIC) || '""'
  return `game.broadcast(${msg});\n`
}

Blockly.Blocks['scratch_broadcast_wait'] = {
  init() {
    this.appendValueInput('MSG').setCheck('String').appendField('broadcast and wait')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.EVENTS)
  }
}
javascriptGenerator.forBlock['scratch_broadcast_wait'] = (block, gen) => {
  const msg = gen.valueToCode(block, 'MSG', Order.ATOMIC) || '""'
  return `await game.broadcastAndWait(${msg});\n`
}

Blockly.Blocks['scratch_on_receive'] = {
  init() {
    this.appendValueInput('MSG').setCheck('String').appendField('when I receive')
    this.appendStatementInput('BODY')
    this.setColour(C.EVENTS)
    this.setTooltip('Runs when the given broadcast message is received')
  }
}
javascriptGenerator.forBlock['scratch_on_receive'] = (block, gen) => {
  const msg = gen.valueToCode(block, 'MSG', Order.ATOMIC) || '""'
  const body = gen.statementToCode(block, 'BODY')
  return `game.onReceive(self, ${msg}, async function() {\n${body}});\n`
}

Blockly.Blocks['scratch_on_key_pressed'] = {
  init() {
    this.appendDummyInput()
      .appendField('when')
      .appendField(new Blockly.FieldDropdown([
        ['W','KeyW'],['A','KeyA'],['S','KeyS'],['D','KeyD'],
        ['↑','ArrowUp'],['↓','ArrowDown'],['←','ArrowLeft'],['→','ArrowRight'],
        ['Space','Space'],['Enter','Enter'],['Shift','ShiftLeft'],
        ['E','KeyE'],['Q','KeyQ'],['R','KeyR'],['F','KeyF'],
      ]), 'KEY')
      .appendField('key pressed')
    this.appendStatementInput('BODY')
    this.setColour(C.EVENTS)
    this.setTooltip('Runs once when the key is first pressed down')
  }
}
javascriptGenerator.forBlock['scratch_on_key_pressed'] = (block, gen) => {
  const key = block.getFieldValue('KEY')
  const body = gen.statementToCode(block, 'BODY')
  return `game.onKeyDown(self, '${key}', async function() {\n${body}});\n`
}

// ── OPERATORS ─────────────────────────────────────────────────────────────────

Blockly.Blocks['scratch_mod'] = {
  init() {
    this.appendValueInput('A').setCheck('Number')
    this.appendValueInput('B').setCheck('Number').appendField('mod')
    this.setInputsInline(true)
    this.setOutput(true, 'Number'); this.setColour('#7f8c8d')
  }
}
javascriptGenerator.forBlock['scratch_mod'] = (block, gen) => {
  const a = gen.valueToCode(block, 'A', Order.ATOMIC) || '0'
  const b = gen.valueToCode(block, 'B', Order.ATOMIC) || '1'
  return [`(${a} % ${b})`, Order.MODULUS]
}

Blockly.Blocks['scratch_round'] = {
  init() {
    this.appendValueInput('N').setCheck('Number').appendField('round')
    this.setInputsInline(true)
    this.setOutput(true, 'Number'); this.setColour('#7f8c8d')
  }
}
javascriptGenerator.forBlock['scratch_round'] = (block, gen) => {
  const n = gen.valueToCode(block, 'N', Order.ATOMIC) || '0'
  return [`Math.round(${n})`, Order.FUNCTION_CALL]
}

Blockly.Blocks['scratch_math_fn'] = {
  init() {
    this.appendValueInput('N').setCheck('Number')
      .appendField(new Blockly.FieldDropdown([
        ['abs','abs'],['floor','floor'],['ceiling','ceil'],['sqrt','sqrt'],
        ['sin','sin'],['cos','cos'],['tan','tan'],
        ['asin','asin'],['acos','acos'],['atan','atan'],
        ['ln','log'],['log','log10'],['e^','exp'],['10^','pow10'],
      ]), 'FN')
      .appendField('of')
    this.setInputsInline(true)
    this.setOutput(true, 'Number'); this.setColour('#7f8c8d')
  }
}
javascriptGenerator.forBlock['scratch_math_fn'] = (block, gen) => {
  const fn = block.getFieldValue('FN')
  const n = gen.valueToCode(block, 'N', Order.ATOMIC) || '0'
  const map = {
    abs: `Math.abs(${n})`, floor: `Math.floor(${n})`, ceil: `Math.ceil(${n})`,
    sqrt: `Math.sqrt(${n})`, sin: `Math.sin(${n}*Math.PI/180)`,
    cos: `Math.cos(${n}*Math.PI/180)`, tan: `Math.tan(${n}*Math.PI/180)`,
    asin: `Math.asin(${n})*180/Math.PI`, acos: `Math.acos(${n})*180/Math.PI`,
    atan: `Math.atan(${n})*180/Math.PI`, log: `Math.log(${n})`,
    log10: `Math.log10(${n})`, exp: `Math.exp(${n})`, pow10: `Math.pow(10,${n})`,
  }
  return [map[fn] || `Math.${fn}(${n})`, Order.FUNCTION_CALL]
}

Blockly.Blocks['scratch_join'] = {
  init() {
    this.appendValueInput('A').appendField('join')
    this.appendValueInput('B')
    this.setInputsInline(true)
    this.setOutput(true, 'String'); this.setColour('#1abc9c')
  }
}
javascriptGenerator.forBlock['scratch_join'] = (block, gen) => {
  const a = gen.valueToCode(block, 'A', Order.ATOMIC) || '""'
  const b = gen.valueToCode(block, 'B', Order.ATOMIC) || '""'
  return [`('' + ${a} + ${b})`, Order.ADDITION]
}

Blockly.Blocks['scratch_letter_of'] = {
  init() {
    this.appendValueInput('N').setCheck('Number').appendField('letter')
    this.appendValueInput('STR').appendField('of')
    this.setInputsInline(true)
    this.setOutput(true, 'String'); this.setColour('#1abc9c')
  }
}
javascriptGenerator.forBlock['scratch_letter_of'] = (block, gen) => {
  const n = gen.valueToCode(block, 'N', Order.ATOMIC) || '1'
  const str = gen.valueToCode(block, 'STR', Order.ATOMIC) || '""'
  return [`(${str}[(${n})-1]||'')`, Order.MEMBER]
}

Blockly.Blocks['scratch_length_of'] = {
  init() {
    this.appendValueInput('STR').appendField('length of')
    this.setInputsInline(true)
    this.setOutput(true, 'Number'); this.setColour('#1abc9c')
  }
}
javascriptGenerator.forBlock['scratch_length_of'] = (block, gen) => {
  const str = gen.valueToCode(block, 'STR', Order.ATOMIC) || '""'
  return [`(${str}).length`, Order.MEMBER]
}

Blockly.Blocks['scratch_contains'] = {
  init() {
    this.appendValueInput('A').appendField('string')
    this.appendValueInput('B').appendField('contains')
    this.appendDummyInput().appendField('?')
    this.setInputsInline(true)
    this.setOutput(true, 'Boolean'); this.setColour('#1abc9c')
  }
}
javascriptGenerator.forBlock['scratch_contains'] = (block, gen) => {
  const a = gen.valueToCode(block, 'A', Order.ATOMIC) || '""'
  const b = gen.valueToCode(block, 'B', Order.ATOMIC) || '""'
  return [`(${a}).includes(${b})`, Order.FUNCTION_CALL]
}

// ── UI BLOCKS ─────────────────────────────────────────────────────────────────

Blockly.Blocks['ui_set_text'] = {
  init() {
    this.appendValueInput('ID').setCheck('String').appendField('set UI element')
    this.appendValueInput('TEXT').appendField('text to')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour('#2c3e50')
    this.setTooltip('Update the text of a UI element by its ID')
  }
}
javascriptGenerator.forBlock['ui_set_text'] = (block, gen) => {
  const id = gen.valueToCode(block, 'ID', Order.ATOMIC) || '""'
  const text = gen.valueToCode(block, 'TEXT', Order.ATOMIC) || '""'
  return `game.setUIText(${id}, ${text});\n`
}

Blockly.Blocks['ui_set_visible'] = {
  init() {
    this.appendValueInput('ID').setCheck('String').appendField('set UI element')
    this.appendDummyInput()
      .appendField('visible')
      .appendField(new Blockly.FieldDropdown([['true','true'],['false','false']]), 'V')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour('#2c3e50')
  }
}
javascriptGenerator.forBlock['ui_set_visible'] = (block, gen) => {
  const id = gen.valueToCode(block, 'ID', Order.ATOMIC) || '""'
  const v = block.getFieldValue('V')
  return `game.setUIVisible(${id}, ${v});\n`
}

// Export toolbox categories for new blocks
export const SCRATCH_TOOLBOX_CATEGORIES = [
  {
    kind: 'category', name: '🏃 Motion+', colour: '#2980b9',
    contents: [
      { kind: 'block', type: 'scratch_move_steps' },
      { kind: 'block', type: 'scratch_turn_cw' },
      { kind: 'block', type: 'scratch_turn_ccw' },
      { kind: 'block', type: 'scratch_glide' },
      { kind: 'block', type: 'scratch_change_x' },
      { kind: 'block', type: 'scratch_change_y' },
      { kind: 'block', type: 'scratch_change_z' },
      { kind: 'block', type: 'scratch_set_x' },
      { kind: 'block', type: 'scratch_set_y' },
      { kind: 'block', type: 'scratch_set_z' },
      { kind: 'block', type: 'scratch_point_toward' },
      { kind: 'block', type: 'scratch_bounce_edge' },
      { kind: 'block', type: 'scratch_direction' },
    ]
  },
  {
    kind: 'category', name: '👀 Looks', colour: '#9b59b6',
    contents: [
      { kind: 'block', type: 'scratch_say' },
      { kind: 'block', type: 'scratch_say_for' },
      { kind: 'block', type: 'scratch_think' },
      { kind: 'block', type: 'scratch_set_size' },
      { kind: 'block', type: 'scratch_change_size' },
      { kind: 'block', type: 'scratch_size' },
    ]
  },
  {
    kind: 'category', name: '🕐 Control+', colour: '#e67e22',
    contents: [
      { kind: 'block', type: 'scratch_wait' },
      { kind: 'block', type: 'scratch_forever' },
      { kind: 'block', type: 'scratch_wait_until' },
      { kind: 'block', type: 'scratch_repeat_until' },
      { kind: 'block', type: 'scratch_stop_script' },
      { kind: 'block', type: 'scratch_stop_all' },
      { kind: 'block', type: 'scratch_create_clone' },
      { kind: 'block', type: 'scratch_delete_clone' },
    ]
  },
  {
    kind: 'category', name: '👁 Sensing', colour: '#16a085',
    contents: [
      { kind: 'block', type: 'scratch_touching_tag' },
      { kind: 'block', type: 'scratch_distance_to' },
      { kind: 'block', type: 'scratch_timer' },
      { kind: 'block', type: 'scratch_reset_timer' },
      { kind: 'block', type: 'scratch_username' },
    ]
  },
  {
    kind: 'category', name: '📡 Events+', colour: '#c0392b',
    contents: [
      { kind: 'block', type: 'scratch_broadcast' },
      { kind: 'block', type: 'scratch_broadcast_wait' },
      { kind: 'block', type: 'scratch_on_receive' },
      { kind: 'block', type: 'scratch_on_key_pressed' },
    ]
  },
  {
    kind: 'category', name: '🔣 Operators+', colour: '#7f8c8d',
    contents: [
      { kind: 'block', type: 'scratch_mod' },
      { kind: 'block', type: 'scratch_round' },
      { kind: 'block', type: 'scratch_math_fn' },
      { kind: 'block', type: 'scratch_join' },
      { kind: 'block', type: 'scratch_letter_of' },
      { kind: 'block', type: 'scratch_length_of' },
      { kind: 'block', type: 'scratch_contains' },
    ]
  },
  {
    kind: 'category', name: '🖼 UI', colour: '#2c3e50',
    contents: [
      { kind: 'block', type: 'ui_set_text' },
      { kind: 'block', type: 'ui_set_visible' },
    ]
  },
]

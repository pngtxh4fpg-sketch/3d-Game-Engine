import * as Blockly from 'blockly'
import { javascriptGenerator, Order } from 'blockly/javascript'

const C = '#16537e'

Blockly.Blocks['camera_set_position'] = {
  init() {
    this.appendValueInput('X').setCheck('Number').appendField('camera move to X')
    this.appendValueInput('Y').setCheck('Number').appendField('Y')
    this.appendValueInput('Z').setCheck('Number').appendField('Z')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C)
  }
}
javascriptGenerator.forBlock['camera_set_position'] = (block, gen) => {
  const x = gen.valueToCode(block,'X',Order.ATOMIC)||'0'
  const y = gen.valueToCode(block,'Y',Order.ATOMIC)||'10'
  const z = gen.valueToCode(block,'Z',Order.ATOMIC)||'20'
  return `game.camera.setPosition(${x},${y},${z});\n`
}

Blockly.Blocks['camera_move'] = {
  init() {
    this.appendValueInput('X').setCheck('Number').appendField('camera move by X')
    this.appendValueInput('Y').setCheck('Number').appendField('Y')
    this.appendValueInput('Z').setCheck('Number').appendField('Z')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C)
  }
}
javascriptGenerator.forBlock['camera_move'] = (block, gen) => {
  const x = gen.valueToCode(block,'X',Order.ATOMIC)||'0'
  const y = gen.valueToCode(block,'Y',Order.ATOMIC)||'0'
  const z = gen.valueToCode(block,'Z',Order.ATOMIC)||'0'
  return `game.camera.move(${x},${y},${z});\n`
}

Blockly.Blocks['camera_look_at'] = {
  init() {
    this.appendValueInput('X').setCheck('Number').appendField('camera look at X')
    this.appendValueInput('Y').setCheck('Number').appendField('Y')
    this.appendValueInput('Z').setCheck('Number').appendField('Z')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C)
  }
}
javascriptGenerator.forBlock['camera_look_at'] = (block, gen) => {
  const x = gen.valueToCode(block,'X',Order.ATOMIC)||'0'
  const y = gen.valueToCode(block,'Y',Order.ATOMIC)||'0'
  const z = gen.valueToCode(block,'Z',Order.ATOMIC)||'0'
  return `game.camera.lookAt(${x},${y},${z});\n`
}

Blockly.Blocks['camera_follow'] = {
  init() {
    this.appendValueInput('TAG').setCheck('String').appendField('camera follow nearest tag')
    this.appendValueInput('OX').setCheck('Number').appendField('offset X')
    this.appendValueInput('OY').setCheck('Number').appendField('Y')
    this.appendValueInput('OZ').setCheck('Number').appendField('Z')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C)
    this.setTooltip('Camera smoothly follows the nearest object with the given tag')
  }
}
javascriptGenerator.forBlock['camera_follow'] = (block, gen) => {
  const tag = gen.valueToCode(block,'TAG',Order.ATOMIC)||'""'
  const ox = gen.valueToCode(block,'OX',Order.ATOMIC)||'0'
  const oy = gen.valueToCode(block,'OY',Order.ATOMIC)||'10'
  const oz = gen.valueToCode(block,'OZ',Order.ATOMIC)||'15'
  return `game.camera.followTag(${tag},${ox},${oy},${oz});\n`
}

Blockly.Blocks['camera_stop_follow'] = {
  init() {
    this.appendDummyInput().appendField('camera stop following')
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C)
  }
}
javascriptGenerator.forBlock['camera_stop_follow'] = () => `game.camera.stopFollow();\n`

Blockly.Blocks['camera_set_fov'] = {
  init() {
    this.appendValueInput('FOV').setCheck('Number').appendField('camera set FOV to')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C)
  }
}
javascriptGenerator.forBlock['camera_set_fov'] = (block, gen) => {
  const fov = gen.valueToCode(block,'FOV',Order.ATOMIC)||'60'
  return `game.camera.setFOV(${fov});\n`
}

Blockly.Blocks['camera_shake'] = {
  init() {
    this.appendValueInput('INT').setCheck('Number').appendField('camera shake intensity')
    this.appendValueInput('DUR').setCheck('Number').appendField('duration (s)')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C)
  }
}
javascriptGenerator.forBlock['camera_shake'] = (block, gen) => {
  const i = gen.valueToCode(block,'INT',Order.ATOMIC)||'0.3'
  const d = gen.valueToCode(block,'DUR',Order.ATOMIC)||'0.5'
  return `game.camera.shake(${i},${d});\n`
}

Blockly.Blocks['camera_get_x'] = {
  init() { this.appendDummyInput().appendField('camera X'); this.setOutput(true,'Number'); this.setColour(C) }
}
javascriptGenerator.forBlock['camera_get_x'] = () => [`game.camera.position().x`,Order.MEMBER]

Blockly.Blocks['camera_get_y'] = {
  init() { this.appendDummyInput().appendField('camera Y'); this.setOutput(true,'Number'); this.setColour(C) }
}
javascriptGenerator.forBlock['camera_get_y'] = () => [`game.camera.position().y`,Order.MEMBER]

Blockly.Blocks['camera_get_z'] = {
  init() { this.appendDummyInput().appendField('camera Z'); this.setOutput(true,'Number'); this.setColour(C) }
}
javascriptGenerator.forBlock['camera_get_z'] = () => [`game.camera.position().z`,Order.MEMBER]

Blockly.Blocks['camera_reset'] = {
  init() { this.appendDummyInput().appendField('camera reset to default'); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(C) }
}
javascriptGenerator.forBlock['camera_reset'] = () => `game.camera.reset();\n`

Blockly.Blocks['camera_glide_to'] = {
  init() {
    this.appendValueInput('SECS').setCheck('Number').appendField('camera glide')
    this.appendValueInput('X').setCheck('Number').appendField('secs to X')
    this.appendValueInput('Y').setCheck('Number').appendField('Y')
    this.appendValueInput('Z').setCheck('Number').appendField('Z')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C)
  }
}
javascriptGenerator.forBlock['camera_glide_to'] = (block, gen) => {
  const s = gen.valueToCode(block,'SECS',Order.ATOMIC)||'1'
  const x = gen.valueToCode(block,'X',Order.ATOMIC)||'0'
  const y = gen.valueToCode(block,'Y',Order.ATOMIC)||'10'
  const z = gen.valueToCode(block,'Z',Order.ATOMIC)||'20'
  return `await game.camera.glideTo(${s},${x},${y},${z});\n`
}

export const CAMERA_TOOLBOX_CATEGORY = {
  kind: 'category', name: '📷 Camera', colour: C,
  contents: [
    { kind:'block', type:'camera_set_position' },
    { kind:'block', type:'camera_move' },
    { kind:'block', type:'camera_look_at' },
    { kind:'block', type:'camera_follow' },
    { kind:'block', type:'camera_stop_follow' },
    { kind:'block', type:'camera_set_fov' },
    { kind:'block', type:'camera_shake' },
    { kind:'block', type:'camera_glide_to' },
    { kind:'block', type:'camera_reset' },
    { kind:'block', type:'camera_get_x' },
    { kind:'block', type:'camera_get_y' },
    { kind:'block', type:'camera_get_z' },
  ]
}

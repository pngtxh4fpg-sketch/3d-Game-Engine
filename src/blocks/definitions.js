import * as Blockly from 'blockly'
import { javascriptGenerator, Order } from 'blockly/javascript'
import { SCRATCH_TOOLBOX_CATEGORIES } from './scratchBlocks'
import { CAMERA_TOOLBOX_CATEGORY } from './cameraBlocks'

const C = {
  EVENT:  '#c0392b',
  MOTION: '#2980b9',
  OBJECT: '#27ae60',
  GAME:   '#8e44ad',
  INPUT:  '#d35400',
  MATH:   '#7f8c8d',
}

Blockly.Blocks['event_on_start'] = {
  init() {
    this.appendDummyInput().appendField('▶ On Start')
    this.appendStatementInput('BODY')
    this.setColour(C.EVENT)
    this.setTooltip('Runs once when game starts. Supports await/sleep.')
  }
}
javascriptGenerator.forBlock['event_on_start'] = (block, gen) => {
  const body = gen.statementToCode(block, 'BODY')
  return `self.onStart = async function() {\n${body}};\n`
}

Blockly.Blocks['event_on_update'] = {
  init() {
    this.appendDummyInput().appendField('🔄 On Update (every frame)')
    this.appendStatementInput('BODY')
    this.setColour(C.EVENT)
  }
}
javascriptGenerator.forBlock['event_on_update'] = (block, gen) => {
  const body = gen.statementToCode(block, 'BODY')
  return `self.onUpdate = async function(delta) {\n${body}};\n`
}

Blockly.Blocks['event_on_click'] = {
  init() {
    this.appendDummyInput().appendField('🖱 On Click')
    this.appendStatementInput('BODY')
    this.setColour(C.EVENT)
  }
}
javascriptGenerator.forBlock['event_on_click'] = (block, gen) => {
  const body = gen.statementToCode(block, 'BODY')
  return `self.onClick = async function() {\n${body}};\n`
}

Blockly.Blocks['motion_move'] = {
  init() {
    this.appendValueInput('X').setCheck('Number').appendField('move X')
    this.appendValueInput('Y').setCheck('Number').appendField('Y')
    this.appendValueInput('Z').setCheck('Number').appendField('Z')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['motion_move'] = (block, gen) => {
  const x = gen.valueToCode(block, 'X', Order.ATOMIC) || '0'
  const y = gen.valueToCode(block, 'Y', Order.ATOMIC) || '0'
  const z = gen.valueToCode(block, 'Z', Order.ATOMIC) || '0'
  return `self.move(${x}, ${y}, ${z});\n`
}

Blockly.Blocks['motion_move_to'] = {
  init() {
    this.appendValueInput('X').setCheck('Number').appendField('move to X')
    this.appendValueInput('Y').setCheck('Number').appendField('Y')
    this.appendValueInput('Z').setCheck('Number').appendField('Z')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['motion_move_to'] = (block, gen) => {
  const x = gen.valueToCode(block, 'X', Order.ATOMIC) || '0'
  const y = gen.valueToCode(block, 'Y', Order.ATOMIC) || '0'
  const z = gen.valueToCode(block, 'Z', Order.ATOMIC) || '0'
  return `self.moveTo(${x}, ${y}, ${z});\n`
}

Blockly.Blocks['motion_move_toward'] = {
  init() {
    this.appendValueInput('TAG').setCheck('String').appendField('move toward nearest tag')
    this.appendValueInput('SPEED').setCheck('Number').appendField('speed')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['motion_move_toward'] = (block, gen) => {
  const tag = gen.valueToCode(block, 'TAG', Order.ATOMIC) || '""'
  const speed = gen.valueToCode(block, 'SPEED', Order.ATOMIC) || '1'
  return `(function(){\n  const _t = game.findNearest(${tag}, self.position.x, self.position.y, self.position.z);\n  if(_t) self.moveToward(_t.id, ${speed}, delta);\n})();\n`
}

Blockly.Blocks['motion_rotate'] = {
  init() {
    this.appendValueInput('X').setCheck('Number').appendField('rotate X°')
    this.appendValueInput('Y').setCheck('Number').appendField('Y°')
    this.appendValueInput('Z').setCheck('Number').appendField('Z°')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.MOTION)
  }
}
javascriptGenerator.forBlock['motion_rotate'] = (block, gen) => {
  const x = gen.valueToCode(block, 'X', Order.ATOMIC) || '0'
  const y = gen.valueToCode(block, 'Y', Order.ATOMIC) || '0'
  const z = gen.valueToCode(block, 'Z', Order.ATOMIC) || '0'
  return `self.rotate(${x}, ${y}, ${z});\n`
}

Blockly.Blocks['object_set_color'] = {
  init() {
    this.appendValueInput('COLOR').setCheck('Colour').appendField('set color')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.OBJECT)
  }
}
javascriptGenerator.forBlock['object_set_color'] = (block, gen) => {
  const color = gen.valueToCode(block, 'COLOR', Order.ATOMIC) || '"#ffffff"'
  return `self.setColor(${color});\n`
}

Blockly.Blocks['object_set_visible'] = {
  init() {
    this.appendDummyInput()
      .appendField('set visible')
      .appendField(new Blockly.FieldDropdown([['true','true'],['false','false']]), 'V')
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.OBJECT)
  }
}
javascriptGenerator.forBlock['object_set_visible'] = (block) => {
  return `self.setVisible(${block.getFieldValue('V')});\n`
}

Blockly.Blocks['object_spawn'] = {
  init() {
    this.appendValueInput('NAME').setCheck('String').appendField('spawn object named')
    this.appendValueInput('X').setCheck('Number').appendField('at X')
    this.appendValueInput('Y').setCheck('Number').appendField('Y')
    this.appendValueInput('Z').setCheck('Number').appendField('Z')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.OBJECT)
  }
}
javascriptGenerator.forBlock['object_spawn'] = (block, gen) => {
  const name = gen.valueToCode(block, 'NAME', Order.ATOMIC) || '""'
  const x = gen.valueToCode(block, 'X', Order.ATOMIC) || '0'
  const y = gen.valueToCode(block, 'Y', Order.ATOMIC) || '0'
  const z = gen.valueToCode(block, 'Z', Order.ATOMIC) || '0'
  return `self.spawn(${name}, ${x}, ${y}, ${z});\n`
}

Blockly.Blocks['object_destroy'] = {
  init() {
    this.appendDummyInput().appendField('destroy self')
    this.setPreviousStatement(true)
    this.setColour(C.OBJECT)
  }
}
javascriptGenerator.forBlock['object_destroy'] = () => `self.destroy();\n`

Blockly.Blocks['object_get_health'] = {
  init() {
    this.appendDummyInput().appendField('health')
    this.setOutput(true, 'Number'); this.setColour(C.OBJECT)
  }
}
javascriptGenerator.forBlock['object_get_health'] = () => [`self.getHealth()`, Order.FUNCTION_CALL]

Blockly.Blocks['object_set_health'] = {
  init() {
    this.appendValueInput('V').setCheck('Number').appendField('set health to')
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.OBJECT)
  }
}
javascriptGenerator.forBlock['object_set_health'] = (block, gen) => {
  return `self.setHealth(${gen.valueToCode(block, 'V', Order.ATOMIC) || '100'});\n`
}

Blockly.Blocks['object_add_health'] = {
  init() {
    this.appendValueInput('V').setCheck('Number').appendField('add health')
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.OBJECT)
  }
}
javascriptGenerator.forBlock['object_add_health'] = (block, gen) => {
  return `self.addHealth(${gen.valueToCode(block, 'V', Order.ATOMIC) || '0'});\n`
}

Blockly.Blocks['object_get_data'] = {
  init() {
    this.appendValueInput('KEY').setCheck('String').appendField('get data')
    this.setOutput(true, null); this.setColour(C.OBJECT)
  }
}
javascriptGenerator.forBlock['object_get_data'] = (block, gen) =>
  [`self.getData(${gen.valueToCode(block, 'KEY', Order.ATOMIC) || '""'})`, Order.FUNCTION_CALL]

Blockly.Blocks['object_set_data'] = {
  init() {
    this.appendValueInput('KEY').setCheck('String').appendField('set data')
    this.appendValueInput('VAL').appendField('=')
    this.setInputsInline(true)
    this.setPreviousStatement(true); this.setNextStatement(true)
    this.setColour(C.OBJECT)
  }
}
javascriptGenerator.forBlock['object_set_data'] = (block, gen) => {
  const key = gen.valueToCode(block, 'KEY', Order.ATOMIC) || '""'
  const val = gen.valueToCode(block, 'VAL', Order.ATOMIC) || 'null'
  return `self.setData(${key}, ${val});\n`
}

Blockly.Blocks['object_get_pos_x'] = {
  init() { this.appendDummyInput().appendField('position X'); this.setOutput(true, 'Number'); this.setColour(C.OBJECT) }
}
javascriptGenerator.forBlock['object_get_pos_x'] = () => [`self.position.x`, Order.MEMBER]

Blockly.Blocks['object_get_pos_y'] = {
  init() { this.appendDummyInput().appendField('position Y'); this.setOutput(true, 'Number'); this.setColour(C.OBJECT) }
}
javascriptGenerator.forBlock['object_get_pos_y'] = () => [`self.position.y`, Order.MEMBER]

Blockly.Blocks['object_get_pos_z'] = {
  init() { this.appendDummyInput().appendField('position Z'); this.setOutput(true, 'Number'); this.setColour(C.OBJECT) }
}
javascriptGenerator.forBlock['object_get_pos_z'] = () => [`self.position.z`, Order.MEMBER]

Blockly.Blocks['game_add_score'] = {
  init() {
    this.appendValueInput('V').setCheck('Number').appendField('add score')
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(C.GAME)
  }
}
javascriptGenerator.forBlock['game_add_score'] = (block, gen) =>
  `game.addScore(${gen.valueToCode(block, 'V', Order.ATOMIC) || '0'});\n`

Blockly.Blocks['game_get_score'] = {
  init() { this.appendDummyInput().appendField('score'); this.setOutput(true, 'Number'); this.setColour(C.GAME) }
}
javascriptGenerator.forBlock['game_get_score'] = () => [`game.getScore()`, Order.FUNCTION_CALL]

Blockly.Blocks['game_add_lives'] = {
  init() {
    this.appendValueInput('V').setCheck('Number').appendField('add lives')
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(C.GAME)
  }
}
javascriptGenerator.forBlock['game_add_lives'] = (block, gen) =>
  `game.addLives(${gen.valueToCode(block, 'V', Order.ATOMIC) || '0'});\n`

Blockly.Blocks['game_get_lives'] = {
  init() { this.appendDummyInput().appendField('lives'); this.setOutput(true, 'Number'); this.setColour(C.GAME) }
}
javascriptGenerator.forBlock['game_get_lives'] = () => [`game.getLives()`, Order.FUNCTION_CALL]

Blockly.Blocks['game_end'] = {
  init() {
    this.appendDummyInput()
      .appendField('end game')
      .appendField(new Blockly.FieldDropdown([['win 🏆','true'],['lose 💀','false']]), 'WIN')
    this.setPreviousStatement(true); this.setColour(C.GAME)
  }
}
javascriptGenerator.forBlock['game_end'] = (block) =>
  `game.endGame(${block.getFieldValue('WIN')});\n`

Blockly.Blocks['game_find_nearest'] = {
  init() {
    this.appendValueInput('TAG').setCheck('String').appendField('nearest with tag')
    this.setOutput(true, null); this.setColour(C.GAME)
  }
}
javascriptGenerator.forBlock['game_find_nearest'] = (block, gen) =>
  [`game.findNearest(${gen.valueToCode(block, 'TAG', Order.ATOMIC) || '""'}, self.position.x, self.position.y, self.position.z)`, Order.FUNCTION_CALL]

Blockly.Blocks['game_get_time'] = {
  init() { this.appendDummyInput().appendField('game time (s)'); this.setOutput(true, 'Number'); this.setColour(C.GAME) }
}
javascriptGenerator.forBlock['game_get_time'] = () => [`game.getTime()`, Order.FUNCTION_CALL]

Blockly.Blocks['input_key_down'] = {
  init() {
    this.appendDummyInput()
      .appendField('key')
      .appendField(new Blockly.FieldDropdown([
        ['W','KeyW'],['A','KeyA'],['S','KeyS'],['D','KeyD'],
        ['↑','ArrowUp'],['↓','ArrowDown'],['←','ArrowLeft'],['→','ArrowRight'],
        ['Space','Space'],['Enter','Enter'],['Shift','ShiftLeft'],
        ['E','KeyE'],['Q','KeyQ'],['R','KeyR'],['F','KeyF'],['1','Digit1'],['2','Digit2'],['3','Digit3'],
      ]), 'KEY')
      .appendField('is down?')
    this.setOutput(true, 'Boolean'); this.setColour(C.INPUT)
  }
}
javascriptGenerator.forBlock['input_key_down'] = (block) =>
  [`input.isKeyDown('${block.getFieldValue('KEY')}')`, Order.FUNCTION_CALL]

Blockly.Blocks['input_mouse_x'] = {
  init() { this.appendDummyInput().appendField('mouse world X'); this.setOutput(true, 'Number'); this.setColour(C.INPUT) }
}
javascriptGenerator.forBlock['input_mouse_x'] = () => [`input.getMouseWorld().x`, Order.MEMBER]

Blockly.Blocks['input_mouse_z'] = {
  init() { this.appendDummyInput().appendField('mouse world Z'); this.setOutput(true, 'Number'); this.setColour(C.INPUT) }
}
javascriptGenerator.forBlock['input_mouse_z'] = () => [`input.getMouseWorld().z`, Order.MEMBER]

Blockly.Blocks['math_delta'] = {
  init() { this.appendDummyInput().appendField('delta time'); this.setOutput(true, 'Number'); this.setColour(C.MATH) }
}
javascriptGenerator.forBlock['math_delta'] = () => [`delta`, Order.ATOMIC]

Blockly.Blocks['math_distance'] = {
  init() {
    this.appendValueInput('X1').setCheck('Number').appendField('distance (')
    this.appendValueInput('Y1').setCheck('Number').appendField(',')
    this.appendValueInput('Z1').setCheck('Number').appendField(',')
    this.appendValueInput('X2').setCheck('Number').appendField(') to (')
    this.appendValueInput('Y2').setCheck('Number').appendField(',')
    this.appendValueInput('Z2').setCheck('Number').appendField(',')
    this.appendDummyInput().appendField(')')
    this.setInputsInline(true)
    this.setOutput(true, 'Number'); this.setColour(C.MATH)
  }
}
javascriptGenerator.forBlock['math_distance'] = (block, gen) => {
  const o = Order.ATOMIC
  return [`math.distance(${gen.valueToCode(block,'X1',o)||'0'},${gen.valueToCode(block,'Y1',o)||'0'},${gen.valueToCode(block,'Z1',o)||'0'},${gen.valueToCode(block,'X2',o)||'0'},${gen.valueToCode(block,'Y2',o)||'0'},${gen.valueToCode(block,'Z2',o)||'0'})`, Order.FUNCTION_CALL]
}

Blockly.Blocks['math_random_range'] = {
  init() {
    this.appendValueInput('MIN').setCheck('Number').appendField('random from')
    this.appendValueInput('MAX').setCheck('Number').appendField('to')
    this.setInputsInline(true)
    this.setOutput(true, 'Number'); this.setColour(C.MATH)
  }
}
javascriptGenerator.forBlock['math_random_range'] = (block, gen) =>
  [`math.random(${gen.valueToCode(block,'MIN',Order.ATOMIC)||'0'},${gen.valueToCode(block,'MAX',Order.ATOMIC)||'1'})`, Order.FUNCTION_CALL]

export const TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category', name: '▶ Events', colour: C.EVENT,
      contents: [
        { kind: 'block', type: 'event_on_start' },
        { kind: 'block', type: 'event_on_update' },
        { kind: 'block', type: 'event_on_click' },
      ]
    },
    {
      kind: 'category', name: '↕ Motion', colour: C.MOTION,
      contents: [
        { kind: 'block', type: 'motion_move' },
        { kind: 'block', type: 'motion_move_to' },
        { kind: 'block', type: 'motion_move_toward' },
        { kind: 'block', type: 'motion_rotate' },
      ]
    },
    {
      kind: 'category', name: '📦 Object', colour: C.OBJECT,
      contents: [
        { kind: 'block', type: 'object_set_color' },
        { kind: 'block', type: 'object_set_visible' },
        { kind: 'block', type: 'object_spawn' },
        { kind: 'block', type: 'object_destroy' },
        { kind: 'block', type: 'object_get_health' },
        { kind: 'block', type: 'object_set_health' },
        { kind: 'block', type: 'object_add_health' },
        { kind: 'block', type: 'object_get_data' },
        { kind: 'block', type: 'object_set_data' },
        { kind: 'block', type: 'object_get_pos_x' },
        { kind: 'block', type: 'object_get_pos_y' },
        { kind: 'block', type: 'object_get_pos_z' },
      ]
    },
    {
      kind: 'category', name: '🎮 Game', colour: C.GAME,
      contents: [
        { kind: 'block', type: 'game_add_score' },
        { kind: 'block', type: 'game_get_score' },
        { kind: 'block', type: 'game_add_lives' },
        { kind: 'block', type: 'game_get_lives' },
        { kind: 'block', type: 'game_end' },
        { kind: 'block', type: 'game_find_nearest' },
        { kind: 'block', type: 'game_get_time' },
      ]
    },
    {
      kind: 'category', name: '⌨️ Input', colour: C.INPUT,
      contents: [
        { kind: 'block', type: 'input_key_down' },
        { kind: 'block', type: 'input_mouse_x' },
        { kind: 'block', type: 'input_mouse_z' },
      ]
    },
    {
      kind: 'category', name: '🔢 Math', colour: C.MATH,
      contents: [
        { kind: 'block', type: 'math_delta' },
        { kind: 'block', type: 'math_random_range' },
        { kind: 'block', type: 'math_distance' },
        { kind: 'block', type: 'math_number', fields: { NUM: 0 } },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_single' },
      ]
    },
    ...SCRATCH_TOOLBOX_CATEGORIES,
    {
      kind: 'category', name: '🔁 Control', colour: '#e67e22',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'controls_whileUntil' },
      ]
    },
    { kind: 'category', name: '📝 Variables', colour: '#9b59b6', custom: 'VARIABLE' },
    {
      kind: 'category', name: '⚙️ Logic', colour: '#2ecc71',
      contents: [
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_negate' },
        { kind: 'block', type: 'logic_boolean' },
      ]
    },
    {
      kind: 'category', name: '💬 Text', colour: '#1abc9c',
      contents: [
        { kind: 'block', type: 'text' },
        { kind: 'block', type: 'text_join' },
        { kind: 'block', type: 'text_print' },
      ]
    },
    {
      kind: 'category', name: '🎨 Colour', colour: '#e74c3c',
      contents: [
        { kind: 'block', type: 'colour_picker' },
        { kind: 'block', type: 'colour_rgb' },
      ]
    },
  ]
}

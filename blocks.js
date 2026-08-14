// --- BLOCK DEFINITIONEN ---

// 1. Würfel erstellen
Blockly.Blocks['create_cube'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Erstelle Würfel");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Erstellt einen neuen 3D-Würfel in der Welt.");
  }
};

// 2. Kugel erstellen
Blockly.Blocks['create_sphere'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Erstelle Kugel");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Erstellt eine neue 3D-Kugel.");
  }
};

// 3. Farbe ändern
Blockly.Blocks['set_color'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Setze Farbe auf")
        .appendField(new Blockly.FieldColour("#ff0000"), "COLOR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip("Ändert die Farbe des zuletzt erstellten Objekts.");
  }
};

// 4. Position setzen
Blockly.Blocks['set_position'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Setze Position");
    this.appendValueInput("X").setCheck("Number").appendField("X:");
    this.appendValueInput("Y").setCheck("Number").appendField("Y:");
    this.appendValueInput("Z").setCheck("Number").appendField("Z:");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Verschiebt das zuletzt erstellte Objekt an diese Koordinaten.");
  }
};

// 5. Dauerhaft drehen (Animation)
Blockly.Blocks['rotate_continuous'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Dauerhaft drehen um")
        .appendField(new Blockly.FieldDropdown([["Y-Achse (Seitlich)","y"], ["X-Achse (Vor/Zurück)","x"], ["Z-Achse (Rollen)","z"]]), "AXIS")
        .appendField("Tempo")
        .appendField(new Blockly.FieldNumber(0.02), "SPEED");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Dreht das Objekt kontinuierlich in jedem Frame.");
  }
};


// --- JAVASCRIPT GENERATOREN ---

Blockly.JavaScript['create_cube'] = function(block) {
  return 'engine.createCube();\n';
};

Blockly.JavaScript['create_sphere'] = function(block) {
  return 'engine.createSphere();\n';
};

Blockly.JavaScript['set_color'] = function(block) {
  var colour = block.getFieldValue('COLOR');
  return 'engine.setColor("' + colour + '");\n';
};

Blockly.JavaScript['set_position'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var z = Blockly.JavaScript.valueToCode(block, 'Z', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  return 'engine.setPosition(' + x + ', ' + y + ', ' + z + ');\n';
};

Blockly.JavaScript['rotate_continuous'] = function(block) {
  var axis = block.getFieldValue('AXIS');
  var speed = block.getFieldValue('SPEED');
  return 'engine.rotateContinuous("' + axis + '", ' + speed + ');\n';
};

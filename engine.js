// --- THREE.JS SETUP ---
const container = document.getElementById('renderDiv');
const overlay = document.getElementById('overlay');

// Szene, Kamera, Renderer erstellen
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Himmelblau

// Kamera
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 3, 10);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Licht hinzufügen
const ambientLight = new THREE.AmbientLight(0x606060);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Boden (Grid)
const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);


// --- ENGINE STATE (Speichert erstellte Objekte & Animationen) ---
let activeObjects = [];
let animatables = [];

// Die 'engine'-Schnittstelle, die von Blockly aufgerufen wird
window.engine = {
    createCube: function() {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.y = 1; // Auf den Boden setzen
        scene.add(cube);
        activeObjects.push(cube);
    },
    
    createSphere: function() {
        const geometry = new THREE.SphereGeometry(1.2, 32, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.y = 1.2;
        scene.add(sphere);
        activeObjects.push(sphere);
    },
    
    setColor: function(hexColor) {
        if(activeObjects.length === 0) return;
        const obj = activeObjects[activeObjects.length - 1]; // Holt das zuletzt erstellte Objekt
        obj.material.color.set(hexColor);
    },
    
    setPosition: function(x, y, z) {
        if(activeObjects.length === 0) return;
        const obj = activeObjects[activeObjects.length - 1];
        obj.position.set(x, y, z);
    },
    
    rotateContinuous: function(axis, speed) {
        if(activeObjects.length === 0) return;
        const obj = activeObjects[activeObjects.length - 1];
        animatables.push({ object: obj, axis: axis, speed: Number(speed) });
    },
    
    resetScene: function() {
        // Alle aktiven Objekte aus der Szene entfernen
        activeObjects.forEach(obj => {
            scene.remove(obj);
            if(obj.geometry) obj.geometry.dispose();
            if(obj.material) obj.material.dispose();
        });
        activeObjects = [];
        animatables = [];
    }
};

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    
    // Führe alle "Dauerhaft drehen"-Animationen aus
    animatables.forEach(anim => {
        if(anim.axis === 'x') anim.object.rotation.x += anim.speed;
        if(anim.axis === 'y') anim.object.rotation.y += anim.speed;
        if(anim.axis === 'z') anim.object.rotation.z += anim.speed;
    });

    renderer.render(scene, camera);
}
animate();

// --- BLOCKLY INITIALISIERUNG ---
let workspace;
// Warten, bis das DOM geladen ist
window.addEventListener('DOMContentLoaded', () => {
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox'),
        scrollbars: true,
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true }
    });
});

// --- FENSTER GRÖSSE ANPASSEN (RESIZE) ---
window.addEventListener('resize', () => {
    // 3D Engine Resize
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    // Blockly Resize
    Blockly.svgResize(workspace);
});

// --- UI BUTTON LOGIK ---
document.getElementById('runBtn').addEventListener('click', () => {
    overlay.style.display = 'none'; // Text ausblenden
    engine.resetScene(); // Alte Szene aufräumen
    
    // Block-Code in JS umwandeln
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    
    // Führe den generierten Code aus
    try {
        eval(code);
    } catch (e) {
        alert("Es gab einen Fehler in deinem Code:\n" + e);
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    engine.resetScene();
    overlay.style.display = 'block'; // Text wieder einblenden
});

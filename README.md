# Meine 3D Block Game Engine

Dies ist eine browserbasierte, handytaugliche 3D-Game-Engine im Scratch-Stil. 
Sie verwendet **Google Blockly** für die visuelle Programmierung und **Three.js** für die 3D-Darstellung.

## 🚀 Wie starte ich es?

Da dieses Projekt aus reinem HTML, CSS und JavaScript besteht, benötigst du keinen Server!
1. Entpacke diese ZIP-Datei.
2. Doppelklicke einfach auf die `index.html` Datei, um sie in deinem Browser zu öffnen.
3. Ziehe Blöcke auf der linken Seite in die Fläche.
4. Klicke oben rechts auf **"▶ Start"**, um deine Blöcke in 3D zu sehen!

## 📱 Handytauglich?
Ja! Das Layout nutzt CSS Flexbox und wandelt sich auf kleinen Bildschirmen automatisch in ein "Oben-Unten" Layout um (Blöcke oben, 3D-Szene unten). Blockly unterstützt Touch-Eingaben automatisch.

## 🌐 Auf GitHub hochladen (Kostenlos hosten)

Du kannst dieses Projekt in wenigen Minuten live ins Internet stellen:
1. Erstelle einen Account auf [GitHub.com](https://github.com/).
2. Erstelle ein neues Repository (z.B. `meine-3d-engine`).
3. Lade **alle Dateien** aus diesem Ordner (`index.html`, `css/`, `js/`, etc.) in das Repository hoch und speichere (commit).
4. Gehe in deinem Repository auf **Settings** -> **Pages**.
5. Wähle unter "Source" den `main` Branch aus und klicke auf "Save".
6. Nach ca. 1-2 Minuten ist deine Game-Engine unter `https://[dein-username].github.io/meine-3d-engine/` aufrufbar - auch auf dem Handy!

## 🛠️ Eigene Blöcke hinzufügen?
Öffne die `js/blocks.js`. Dort kannst du das Design und die Farbe der Blöcke ändern, sowie den JavaScript-Code bestimmen, der ausgeführt wird, wenn man auf "Start" drückt.
In `js/engine.js` kannst du Three.js Code ergänzen (z.B. Physik, neue 3D-Modelle oder Sound).

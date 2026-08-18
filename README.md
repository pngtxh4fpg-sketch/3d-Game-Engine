# Engine3D

A browser-based 3D game engine with visual scripting, similar to Scratch but in 3D. Built with Three.js, React, and Blockly.

## Getting Started

```bash
git clone https://github.com/yourname/engine3d
cd engine3d
npm install
npm run dev
```

Then open http://localhost:5173.

To deploy to GitHub Pages, build and push `dist/` to the `gh-pages` branch, or use the GitHub Actions workflow below.

## Editor Layout

| Panel | Purpose |
|---|---|
| **Toolbar** (top) | Add objects, play/stop, save, open, export |
| **Hierarchy** (left) | List of all scene objects |
| **Viewport** (center-top) | 3D view with transform gizmo |
| **Script Editor** (center-bottom) | Blockly visual scripting per object |
| **Properties** (right) | Position, rotation, scale, color, tag |

## Controls

**Viewport (edit mode)**
- Right-drag → orbit camera
- Scroll → zoom
- Click → select object
- W / E / R keys → switch between Move / Rotate / Scale

## Visual Scripting Blocks

### Events
| Block | Description |
|---|---|
| `On Start` | Runs once at game start |
| `On Update` | Runs every frame (use `delta time` for speed) |
| `On Click` | Runs when player clicks the object |

### Motion
| Block | Description |
|---|---|
| `move X Y Z` | Move relative to current position |
| `move to X Y Z` | Teleport to world position |
| `move toward nearest tag [speed]` | Chase nearest object with a tag |
| `rotate X° Y° Z°` | Rotate in degrees |

### Object
| Block | Description |
|---|---|
| `set color` | Change object color |
| `set visible` | Show or hide |
| `spawn object named [name] at X Y Z` | Clone an object by name into the scene |
| `destroy self` | Remove this object from the scene |
| `set health / add health / health` | Per-object health value |
| `set data [key] = [value]` | Store custom data on the object |
| `get data [key]` | Read custom data |
| `position X / Y / Z` | Current world position |

### Game
| Block | Description |
|---|---|
| `add score [n]` | Increase score |
| `score` | Get current score |
| `add lives [n]` | Change lives (use negative to subtract) |
| `lives` | Get current lives |
| `end game win/lose` | Trigger game over screen |
| `nearest with tag [tag]` | Returns nearest object object |
| `game time (s)` | Seconds since game started |

### Input
| Block | Description |
|---|---|
| `key [W/A/S/D/↑↓←→/Space...] is down?` | Keyboard input |
| `mouse world X / Z` | Mouse position projected onto the ground plane |

### Math
| Block | Description |
|---|---|
| `delta time` | Seconds since last frame — use for frame-rate independent movement |
| `random from [a] to [b]` | Random float |
| `distance (x1,y1,z1) to (x2,y2,z2)` | 3D distance |

## Building a BTD6-style Tower Defense Game

Here's the general pattern:

**Enemy object** — tag: `enemy`
- `On Start`: `set health 100`
- `On Update`: `move toward nearest tag "goal" speed 2 × delta time`; if health ≤ 0: `add lives -1`, `destroy self`

**Tower object** — tag: `tower`
- `On Update`: use `nearest with tag "enemy"` to find a target, then `spawn "bullet" at self position`

**Bullet object** — tag: `bullet`
- `On Start`: store target id with `set data "target" = ...`
- `On Update`: `move toward nearest tag "enemy" speed 8`; if within range: `add health -25` on target, `destroy self`

**Spawner object**
- `On Update`: use `game time` and a timer (`get data / set data`) to spawn enemies on an interval

## File Formats

| Format | Use |
|---|---|
| `.e3d.json` | Project file — save/load to continue editing |
| `.html` | Exported game — self-contained, runs in any browser with no server |

## GitHub Pages Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Tech Stack

- [Three.js](https://threejs.org) — 3D rendering
- [React 18](https://react.dev) — UI
- [Blockly](https://developers.google.com/blockly) — visual scripting
- [Zustand](https://github.com/pmndrs/zustand) — state management
- [Vite](https://vitejs.dev) — build tool

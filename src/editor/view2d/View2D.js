import * as SALT from 'engine';
import * as SUEY from 'gui';
import * as VIEW2D from 'view2d';

// import { SceneUtils } from './SceneUtils.js';
// import { ViewportEvents } from './ViewportEvents.js';
// import { ViewportRender } from './ViewportRender.js';
// import { ViewportSignals } from './ViewportSignals.js';
import { View2DToolbar } from './View2DToolbar.js';

import { Config } from '../config/Config.js';
import { SelectCommand } from '../commands/Commands.js';

class View2D extends SUEY.Panel {

    constructor() {
        super();
        const self = this;
        this.setClass('one-viewport');
        this.addClass('one-fullscreen');
        this.selectable(false);

        /******************** TOOLBAR */

        this.add(new View2DToolbar());

        /******************** PROPERTIES */

        // Forward Function Declarations
        this.addSprites = function() {};                        // Adds sprites to empty entities
        this.rebuildColliders = function() {};                  // Builds scene 'sceneColliders' from selected Stage
        this.buildTransformGroup = function() {};               // Builds transform group
        this.updateTransformGroup = function() {};              // Update selected entities from wireTrackers

        // Gui
        this.width = Math.max(2, this.getWidth());              // Width of dom element
        this.height = Math.max(2, this.getHeight());            // Height of dom element

        // Containers
        this.selected = [];                                     // Objects selected (can differ slightly from editor)

        // Objects
        let _sceneWorld = null;                                 // 'this.world'
        this.sceneColliders = null;
        this.sceneHelpers = null;
        this.sceneControls = null;
        this.sceneCanvasGrid = null;
        this.sceneInfiniteGrid = null;
        this.sceneSky = null;

        this.canvasGrid = null;
        this.infiniteGrid = null;
        this.dragLine = null;

        this.camera = null;
        this.cameraMode = undefined;
        this.cameraSky = null;
        this.skySphere = null;                                  // Skybox sphere for perspective camera

        this.fatX = null;
        this.fatY = null;
        this.fatZ = null;

        // Controls
        this.cameraControls = null;
        this.gizmo = null;
        this.dragPlane = null;
        this.rubberBandBox = null;
        this.rubberBandBoxHelper = null;
        this.transformControls = null;
        this.paintControls = null;

        // Input
        this.mouseMode = VIEW2D.MOUSE_MODES.SELECT;           // Left mouse button mode
        this.mouseState = VIEW2D.MOUSE_STATES.NONE;           // Current mouse state
        this.mouseIsDown = false;                               // True when mouse down
        this.mouseDownButton = -1;                              // Tracks button on last mouse down
        this.overrideCursor = null;                             // Tracks override cursor (mouse over TransformControls)
        this.startSelection = [];                               // Stores starting selection when mouse down with shift/ctrl

        this.facingPlane = '';                                  // Tracks which plane camera is facing
        this.camAngleX = 0;                                     // Angle X of camera facing object
        this.camAngleY = 0;                                     // Angle Y of camera facing object
        this.camAngleZ = 0;                                     // Angle Z of camera facing object

        this.dragStarted = false;                               // True when mouse has moved enough to start 'dragging'
        this.outlineStrength = VIEW2D.STYLING.EDGE_GLOW;      // Hide outlines when in 'rect' mode

        this.wantsGrid = false;                                 // When true, viewport wants to render grid
        this.wantsMini = false;                                 // When true, viewport wants to render mini grid

        /******************** VIEW2D */

        Object.defineProperty(this, 'world', {
            get: function() { return _sceneWorld; },
            set: function(world) {
                editor.selectEntities(/* none */);
                _sceneWorld = (world && world.isWorld) ? world : null;//_emptyWorld;

                // Scene Graph Signal
                signals.sceneGraphChanged.dispatch();

                // Active World / Stage Toggles
                editor.project.setActiveWorld((world && world.isWorld) ? world : undefined);
                if (world && world.isWorld) {
                    if (self.stage && world.activeStage() && self.stage.uuid === world.activeStage().uuid) {
                        // EMPTY
                    } else {
                        self.stage = world.activeStage();
                    }
                }
            }
        });

        Object.defineProperty(this, 'stage', {
            get: function() { return (_sceneWorld && _sceneWorld.isWorld3D) ? _sceneWorld.activeStage() : undefined; },
            set: function(stage) {
                const world = _sceneWorld;
                if (!world || !world.isWorld) return;
                world.setActiveStage(stage);

                // Stage Changed Signals
                signals.stageChanged.dispatch();
                self.updateSky();

                // Active World / Stage Toggles
                SceneUtils.toggleActiveStage(world);
                SceneUtils.toggleBoundaryObjects(Config.getKey('scene/render/bounds'), stage);
                SceneUtils.toggleColliders(Config.getKey('scene/render/colliders'));
            }
        });

        /******************** VIEW2D: GRIDS */

        const gridParams = {
            gridColor: SUEY.ColorScheme.color(SUEY.TRAIT.MIDLIGHT),
            color1: SUEY.ColorScheme.color(SUEY.TRAIT.BUTTON_DARK),
            color2: SUEY.ColorScheme.color(SUEY.TRAIT.BUTTON_LIGHT),
            gridAlpha: 0.40,
            checkerAlpha: 0.40,
        };

        // // xy plane: xyz
        // // yz plane: yzx
        // // xz plane: xzy
        // const gridSize = Config.getKey('scene/grid/translateSize');
        // const gridMultiplier = Config.getKey('scene/grid/canvasMultiplier');
        // const gridPlane = Config.getKey('scene/grid/plane');
        // this.canvasGrid = new CanvasGrid(gridSize, gridMultiplier, gridPlane, gridParams);
        // this.sceneCanvasGrid = new THREE.Scene();
        // this.sceneCanvasGrid.background = null;
        // this.sceneCanvasGrid.add(this.canvasGrid);

        // this.infiniteGrid = new InfiniteGrid(Config.getKey('scene/grid/translateSize'));
        // this.infiniteGrid.visible = false;
        // this.sceneInfiniteGrid = new THREE.Scene();
        // this.sceneInfiniteGrid.background = null;
        // this.sceneInfiniteGrid.add(this.infiniteGrid);

        /******************** VIEW2D: TEMP LIGHTS */

        // const ambLight = new THREE.AmbientLight(0xffffff, 1.5);
        // const dirLight1 = new THREE.DirectionalLight(0xffffff, 3); dirLight1.position.set(0, 10000,  10000);
        // const dirLight2 = new THREE.DirectionalLight(0xffffff, 3); dirLight2.position.set(0, 10000, -10000);

        // /******************** VIEW2D: COLLIDERS */

        // this.sceneColliders = new THREE.Scene();
        // this.sceneColliders.name = 'Colliders';
        // this.sceneColliders.background = null;

        // /******************** VIEW2D: HELPERS */

        // this.sceneHelpers = new THREE.Scene();
        // this.sceneHelpers.name = 'Helpers';
        // this.sceneHelpers.background = null;

        // /******************** VIEW2D: CONTROLS */

        // this.sceneControls = new THREE.Scene();
        // this.sceneControls.name = 'Controls';
        // this.sceneControls.background = null;

        // // Control Scene Lights
        // this.sceneControls.add(ambLight.clone(), dirLight1.clone(), dirLight2.clone());

        // // Origin Cross
        // const lineSize = 0.15;
        // this.fatX = new ONE.BasicLine(-lineSize, 0, 0, lineSize, 0, 0, SUEY.ColorScheme.color(VIEW2D.COLORS.X_COLOR));
        // this.fatY = new ONE.BasicLine(0, -lineSize, 0, 0, lineSize, 0, SUEY.ColorScheme.color(VIEW2D.COLORS.Y_COLOR));
        // this.fatZ = new ONE.BasicLine(0, 0, -lineSize, 0, 0, lineSize, SUEY.ColorScheme.color(VIEW2D.COLORS.Z_COLOR));
        // this.sceneControls.add(this.fatX, this.fatY, this.fatZ);
        // this.fatX.visible = Config.getKey('scene/render/origin');
        // this.fatY.visible = Config.getKey('scene/render/origin');
        // this.fatZ.visible = Config.getKey('scene/render/origin');

        // signals.schemeChanged.add(function() {
        //     self.fatX.material.color.setHex(SUEY.ColorScheme.color(VIEW2D.COLORS.X_COLOR));
        //     self.fatY.material.color.setHex(SUEY.ColorScheme.color(VIEW2D.COLORS.Y_COLOR));
        //     self.fatZ.material.color.setHex(SUEY.ColorScheme.color(VIEW2D.COLORS.Z_COLOR));
        // });

        // // Clean Up Lights
        // dirLight1.dispose();
        // dirLight2.dispose();

        /******************** OBJECTS */

        // // Drag Line
        // // this.dragLine = new ONE.FatLine(-1, -1, 0, 1, 1, 0, 2.0, SUEY.ColorScheme.color(SUEY.TRAIT.HIGHLIGHT));
        // this.dragLine = new ONE.BasicLine(-1, -1, 0, 1, 1, 0, SUEY.ColorScheme.color(SUEY.TRAIT.ICON_LIGHT));
        // this.dragLine.material.depthTest = false;
        // this.dragLine.material.side = THREE.FrontSide;
        // this.dragLine.visible = false;
        // this.sceneInfiniteGrid.add(this.dragLine);

        // // Cameras
        // const dw = this.dom.clientWidth;
        // const dh = this.dom.clientHeight;

        // this.camera = new ONE.Camera3D({ type: 'perspective', width: dw, height: dh });
        // this.camera.position.set(0, 0, 5);
        // this.camera.lookAt(0, 0, 0);
        // this.cameraMode = VIEW2D.CAMERA_TYPES.PERSPECTIVE;

        // // Sky
        // this.skySphere = new ONE.SkyObject();
        // this.skySphere.name = 'SkySphere';
        // this.sceneSky = new THREE.Scene();
        // this.sceneSky.add(this.skySphere);

        // this.cameraSky = new ONE.Camera3D({ type: 'perspective', width: dw, height: dh });
        // this.cameraSky.position.set(0, 0, 5);
        // this.cameraSky.lookAt(0, 0, 0);

        /******************** FINAL SETUP */

        // ViewportRender.addRender(this);
        // ViewportEvents.addEvents(this);
        // ViewportSignals.addSignals(this);

        // First Render
        requestAnimationFrame(() => { this.animate(); });
    }

    /******************** FRAME ********************/

    animate() {
        if (this.world && this.isDisplayed()) {
            // Start render timer
            const startTime = performance.now();

            // Update
            this.update();

            // Render (ViewportRender.js)
            this.render();

            // Must manually reset counter (used with multiple render() calls to count all draw calls)
            editor.totalDrawCalls = this.renderer.info.render.calls;
            this.renderer.info.reset();

            // End render timer, dispatch signal
            signals.sceneRendered.dispatch(performance.now() - startTime);
        }

        // Ask for another animation frame immediately
        requestAnimationFrame(() => { this.animate(); });
    }

    /******************** UPDATE ********************/

    update() {
        // Update all stored updatable objects
        const deltaTime = this.updateClock.getDelta();
        for (const object of this.updatables) {
            object.update(deltaTime);
        }

        // Update facing plane
        if (this.selected.length > 0 && this.mouseState === VIEW2D.MOUSE_STATES.DRAGGING) {
            this.facingPlane = this.dragPlane.cameraFacingPlane;
            this.camAngleX = this.dragPlane.camAngleX;
            this.camAngleY = this.dragPlane.camAngleY;
            this.camAngleZ = this.dragPlane.camAngleZ;
        } else {
            this.facingPlane = this.transformControls.cameraFacingWorld;
            this.camAngleX = this.transformControls.camAngleX;
            this.camAngleY = this.transformControls.camAngleY;
            this.camAngleZ = this.transformControls.camAngleZ;
        }
    }

    /******************** RESIZE ********************/

    resize() {
        // Store dimensions
        this.width = Math.max(2, this.getWidth() * window.devicePixelRatio);
        this.height = Math.max(2, this.getHeight() * window.devicePixelRatio);
    }

    /******************** CLIPBOARD / EDIT ********************/

    cut() {
        if (!this.validWorld()) return;
        // SceneUtils.deleteSelection('Cut' /* commandName */);
    }

    paste() {
        if (!this.validWorld()) return;
        // SceneUtils.duplicateSelection(null, editor.clipboard.items, true /* force copy */, 'Paste');
    }

    duplicate(key) {
        if (!this.validWorld()) return;
        // SceneUtils.duplicateSelection(key);
    }

    delete() {
        if (!this.validWorld()) return;
        // SceneUtils.deleteSelection();
    }

    selectAll() {
        if (!this.validWorld()) return;
        // const activeEntities = this.world.activeStage().getEntities(false /* includeStages */);
        // editor.execute(new SelectCommand(activeEntities, editor.selected));
    }

    selectNone() {
        if (!this.validWorld()) return;
        editor.execute(new SelectCommand([], editor.selected));
    }

    /******************** INTERACTION ********************/

    hasFocus(eventType = 'pointer') {
        if (!document.activeElement.contains(this.dom)) return false;

        let lostFocus = false;

        // Gather classLists from possible active element
        const elements = [];
        if (document.activeElement) elements.push(document.activeElement);      // Built into Html5 Document Model
        if (document.focusedElement) elements.push(document.focusedElement);    // From index.html - focusin / focusout
        if (document.downOnElement) elements.push(document.downOnElement);      // From index.html - pointerdown

        // console.log(document.activeElement);
        // console.log(document.focusedElement);
        // console.log(document.downOnElement);

        // Check for focused classes
        for (const element of elements) {
            // Focus was on an element inside a menu
            lostFocus = lostFocus || SUEY.Utils.isChildOfElementWithClass(element, 'osui-menu');

            // Focus is on a Selected MenuButton
            lostFocus = lostFocus || (element.classList.contains('osui-menu-button') && element.classList.contains('osui-selected'));

            // Focus is on code editor
            lostFocus = lostFocus || SUEY.Utils.isChildOfElementWithClass(element, 'CodeMirror');

            // Focus is on a color input
            lostFocus = lostFocus || element.type === 'color';

            // // Focus is on a Number Text Box
            // lostFocus = lostFocus || element.classList.contains('osui-text-box') || element.classList.contains('osui-number');

            //
            // .. insert more cases here ..
            //

            /***** Extra Key Event Checks *****/
            if (eventType === 'key') {

                // Focus is on an AssetBox
                lostFocus = lostFocus || (element.classList.contains('osui-asset-box'));

            }
        }

        const viewportHasFocus = !lostFocus;
        return viewportHasFocus;
    }

    validWorld() {
        return (this.world && this.world.isWorld && !this.world.locked);
    }

}

export { View2D };

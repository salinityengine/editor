import * as SALT from 'engine';
import * as SUEY from 'gui';
import * as VIEW2D from 'view2d';

// import { SceneUtils } from './SceneUtils.js';
// import { ViewportEvents } from './ViewportEvents.js';
// import { ViewportRender } from './ViewportRender.js';
// import { ViewportSignals } from './ViewportSignals.js';
import { View2DToolbar } from './View2DToolbar.js';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';
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

        this.camera = null;
        this.cameraMode = undefined;

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
                Signals.dispatch('sceneGraphChanged');

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
                Signals.dispatch('stageChanged');
                self.updateSky();

                // Active World / Stage Toggles
                SceneUtils.toggleActiveStage(world);
                SceneUtils.toggleBoundaryObjects(Config.getKey('scene/render/bounds'), stage);
                SceneUtils.toggleColliders(Config.getKey('scene/render/colliders'));
            }
        });

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
            Signals.dispatch('sceneRendered', performance.now() - startTime);
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

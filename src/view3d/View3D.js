import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

// import { SceneUtils } from './SceneUtils.js';
// import { ViewportEvents } from './ViewportEvents.js';
// import { ViewportRender } from './ViewportRender.js';
// import { ViewportSignals } from './ViewportSignals.js';
import { View3DToolbar } from './View3DToolbar.js';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';
import { SelectCommand } from '../commands/Commands.js';

class View3D extends SUEY.Panel {

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

        // Gui
        this.width = Math.max(2, this.getWidth());              // Width of dom element
        this.height = Math.max(2, this.getHeight());            // Height of dom element

        // Containers
        this.selected = [];                                     // Objects selected (can differ slightly from editor)

        // Objects
        this.camera = null;
        this.cameraMode = undefined;

        // Controls
        this.rubberBandBox = null;

        // Input
        this.mouseMode = EDITOR.MOUSE_MODES.SELECT;             // Left mouse button mode
        this.mouseState = EDITOR.MOUSE_STATES.NONE;             // Current mouse state
        this.mouseIsDown = false;                               // True when mouse down
        this.mouseDownButton = -1;                              // Tracks button on last mouse down
        this.startSelection = [];                               // Stores starting selection when mouse down with shift/ctrl
        this.dragStarted = false;                               // True when mouse has moved enough to start 'dragging'

        /******************** FINAL SETUP */

        // ViewportRender.addRender(this);
        // ViewportEvents.addEvents(this);
        // ViewportSignals.addSignals(this);


        // const app = new SALT.Application({
        //     element: this.dom,
        //     backgroundColor: '#1099bb',
        // })

        // // Sprite
        // const bunny = PIXI.Sprite.from('./files/assets/textures/dragon.png');
        // bunny.anchor.set(0.5);
        // bunny.x = app.screen.width / 2;
        // bunny.y = app.screen.height / 2;
        // app.stage.addChild(bunny);

        // // Text
        // const text = new PIXI.Text('This is a PixiJS text', {
        //     fontFamily: 'Arial',
        //     fontSize: 24,
        //     fill: 0xff1010,
        //     align: 'center',
        // });
        // app.stage.addChild(text);

        // // Update
        // app.ticker.add((delta) => {
        //     // frame-independent transformation, delta is 1 if running at 100% performance

        //     bunny.rotation += 0.01 * delta;

        //     text.x += 0.1 * delta;
        //     text.y += 0.1 * delta;
        // });


        // // First Render
        // requestAnimationFrame(() => { this.animate(); });
    }

    /******************** FRAME ********************/

    animate() {
        const self = this;

        if (this.isDisplayed()) {
            // Start render timer
            const startTime = performance.now();

            // Render (ViewportRender.js)
            this.render();

            // End render timer, dispatch signal
            Signals.dispatch('sceneRendered', performance.now() - startTime);
        }

        // Ask for another animation frame immediately
        requestAnimationFrame(() => self.animate());
    }

    /******************** RESIZE ********************/

    resize() {
        // Store dimensions
        this.width = Math.max(2, this.getWidth() * window.devicePixelRatio);
        this.height = Math.max(2, this.getHeight() * window.devicePixelRatio);
    }

    /******************** CLIPBOARD / EDIT ********************/

    cut() {
        // SceneUtils.deleteSelection('Cut' /* commandName */);
    }

    paste() {
        // SceneUtils.duplicateSelection(null, editor.clipboard.items, true /* force copy */, 'Paste');
    }

    duplicate(key) {
        // SceneUtils.duplicateSelection(key);
    }

    delete() {
        // SceneUtils.deleteSelection();
    }

    selectAll() {
        // const activeEntities = this.world.activeStage().getEntities(false /* includeStages */);
        // editor.execute(new SelectCommand(activeEntities, editor.selected));
    }

    selectNone() {
        // editor.execute(new SelectCommand([], editor.selected));
    }

}

export { View3D };

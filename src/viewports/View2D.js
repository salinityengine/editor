import {
    EDITOR_MODES,
    MOUSE_MODES,
    MOUSE_STATES,
} from 'constants';
import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';

import { AbstractView } from './AbstractView.js';
import { View2DToolbar } from '../toolbars/View2DToolbar.js';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { SelectCommand } from '../commands/CommandList.js';

class View2D extends AbstractView {

    mode() { return EDITOR_MODES.WORLD_2D; }

    floaterFamily() {
        const floaters = [
            'assets',
            'codex',
            'inspector',
            'library',
            'outliner',
            'scripter',
            'shaper',
        ];
        return [ ...super.floaterFamily(), ...floaters ];
    }

    constructor() {
        super();
        const self = this;

        // Toolbar
        this.toolbar = new View2DToolbar(this);

        // Input
        this.mouseMode = MOUSE_MODES.SELECT;                    // left mouse button mode
        this.mouseState = MOUSE_STATES.NONE;                    // current mouse state
        this.mouseIsDown = false;                               // true when mouse down
        this.mouseDownButton = -1;                              // tracks button on last mouse down
        this.startSelection = [];                               // stores starting selection when mouse down with shift/ctrl
        this.dragStarted = false;                               // true when mouse has moved enough to start 'dragging'

        /***** EVENTS *****/

        this.on('pointerdown', (event) => viewportPointerDown(self, event));
        this.on('pointermove', (event) => viewportPointerMove(self, event));
        this.on('pointerup', (event) => viewportPointerUp(self, event));
        this.on('keydown', (event) => viewportKeyDown(self, event));
        this.on('keyup', (event) => viewportKeyUp(self, event));

        /***** SCENE *****/

        const scene = new SALT.Object2D();

        const rainbowBox = new SALT.Box();
        rainbowBox.setPosition(-100, 200);
        rainbowBox.radius = 25;
        rainbowBox.fillStyle = new SALT.LinearGradientStyle();
        rainbowBox.fillStyle.start.set(-50, -50);
        rainbowBox.fillStyle.end.set(50, 50);
        rainbowBox.fillStyle.addColorStop(0, '#ff0000');
        rainbowBox.fillStyle.addColorStop(0.5, '#00ff00');
        rainbowBox.fillStyle.addColorStop(1, '#0000ff');
        scene.add(rainbowBox);

        // Renderer
        const renderer = new SALT.Renderer({ width: window.innerWidth, height: window.innerHeight });
        this.add(renderer.dom);

        // Camera
        const camera = new SALT.Camera2D();

        // Camera Controls
        const cameraControls = new SALT.CameraControls(camera);
        renderer.addUpdate(cameraControls);

        // Select Controls
        const selectControls = new SALT.SelectControls();
        renderer.addUpdate(selectControls);

        // Grid Helper
        const grid = new SALT.GridHelper();
        scene.add(grid);

        // Tooltip Helper
        const tooltip = new SALT.TooltipHelper(true /* sceneTips? */);
        scene.add(tooltip);

        // Origin Helper
        const originHelper = new SALT.OriginHelper();
        scene.add(originHelper);

        function updateGridSettings() {
            grid.visible = Config.getKey('view2d/grid/show');
            grid.onTop = Config.getKey('viewport/grid/ontop');
            grid.snap = Config.getKey('viewport/grid/snap');
            grid.gridX = Math.max(Config.getKey('view2d/grid/sizeX'), 1);
            grid.gridY = Math.max(Config.getKey('view2d/grid/sizeY'), 1);
            grid.scale.x = Math.max(Config.getKey('view2d/grid/scaleX'), 0.1);
            grid.scale.y = Math.max(Config.getKey('view2d/grid/scaleY'), 0.1);
            grid.rotation = Config.getKey('view2d/grid/rotate') * (Math.PI / 180);
        }
        updateGridSettings();
        Signals.connect(this, 'gridChanged', updateGridSettings);

        /***** SIGNALS *****/

        Signals.connect(this, 'schemeChanged', () => {
            renderer.refreshColors();
        });

        /***** REFERENCE *****/

        this.renderer = renderer;
        this.camera = camera;
        this.cameraControls = cameraControls;
        this.selectControls = selectControls;
        this.grid = grid;
        this.tooltip = tooltip;
        this.originHelper = originHelper;

        /***** START *****/

        const debug = new SALT.Debug();
        const onBeforeRender = () => { debug.startFrame(renderer); };
        const onAfterRender = () => { debug.endFrame(renderer); };
        renderer.start(scene, this.camera, onBeforeRender, onAfterRender);

        const debugElement = document.getElementById('EyeDebug');
        if (debugElement) {
            debugElement.style.right = 0;
            debugElement.style.width = '12.5em';
            debugElement.style.margin = '0.25em auto';
        }
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
        editor.execute(new SelectCommand([], editor.selected));
    }

    /******************** VIEW ********************/

    cameraFocus() {
        if (this.cameraControls) {
            if (this.selectControls && this.selectControls.resizeHelper) {
                this.cameraControls.focusCamera(this.renderer, this.selectControls.resizeHelper);
            } else {
                this.cameraControls.focusCamera(this.renderer, this.renderer.scene);
            }
        }
    }

    cameraReset(animate = true) {
        if (this.cameraControls) {
            this.cameraControls.focusCamera(this.renderer, null, (animate) ? 200 : 0);
        }
    }

    gridSize() {
        const gridX = Math.max(Config.getKey('view2d/grid/sizeX'), 1);
        const gridY = Math.max(Config.getKey('view2d/grid/sizeY'), 1);
        return Math.min(gridX, gridY);
    }

}

export { View2D };

/******************** INTERNAL: POINTER ********************/

function viewportPointerDown(viewport, event) {

    // Clear Preview
    if (editor.selected.length === 0) Signals.dispatch('assetSelect');

}

function viewportPointerMove(viewport, event) {

}

function viewportPointerUp(viewport, event) {

}

/******************** INTERNAL: KEYBOARD ********************/

function viewportKeyDown(viewport, event) {

}

function viewportKeyUp(viewport, event) {

}

import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Advice } from './config/Advice.js';
import { Config } from './config/Config.js';
import { Signals } from './config/Signals.js';

import { EditorModeCommand } from './commands/Commands.js';

import { EyeMenu } from './EyeMenu.js';

class EditorToolbar extends SUEY.Panel {

    constructor() {
        super({ style: SUEY.PANEL_STYLES.NONE });
        this.setClass('salt-toolbar');
        this.addClass('editor-toolbar');

        // Clear Advisor on Leave
        Advice.clear(this);

        /******************** BUTTONS */

        const eye = new SUEY.ToolbarButton().addClass('suey-complement-button');
        const scene = new SUEY.ToolbarButton(null, 'left').addClass('suey-gray-button');
        const cube = new SUEY.ToolbarButton(null, 'middle').addClass('suey-gray-button');
        const world = new SUEY.ToolbarButton(null, 'middle').addClass('suey-gray-button');
        const ui = new SUEY.ToolbarButton(null, 'right').addClass('suey-gray-button');

        eye.dom.setAttribute('tooltip', 'Menu');
        scene.dom.setAttribute('tooltip', Config.tooltip('Scene Editor 2D'));
        cube.dom.setAttribute('tooltip', Config.tooltip('Scene Editor 3D'));
        world.dom.setAttribute('tooltip', Config.tooltip('World Graph'));
        ui.dom.setAttribute('tooltip', Config.tooltip('UI Editor'));

        Advice.attach(eye, 'toolbar/eye');
        Advice.attach(scene, 'toolbar/scene2d');
        Advice.attach(cube, 'toolbar/scene3d');
        Advice.attach(world, 'toolbar/world');
        Advice.attach(ui, 'toolbar/ui');

        /******************** EYE MENU */

        const eyeClosed = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}eye-closed.svg`).setId('tb-eye-closed');
        const eyeOpen = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}eye-open.svg`).setId('tb-eye-open');
        const eyeLidTop = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}eye-lid-top.svg`).setId('tb-eye-lid-top');
        const eyeLidBot = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}eye-lid-bottom.svg`).setId('tb-eye-lid-bottom');
        eye.add(eyeClosed, eyeOpen, eyeLidTop, eyeLidBot);
        eye.attachMenu(new EyeMenu());

        /******************** EDITOR MODES */

        const editPencil = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}edit-pencil.svg`).setId('tb-edit-pencil');
        const editTip = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}edit-pencil-tip.svg`).setId('tb-edit-pencil-tip');
        const sceneFrame = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}scene-frame.svg`).setId('tb-scene-frame');
        scene.add(/* editPencil, editTip */ sceneFrame);

        const sceneCube = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}scene-cube.svg`).setId('tb-scene-cube');
        cube.add(sceneCube);

        const worldBackground = new SUEY.VectorBox().setId('tb-world-background');
        worldBackground.setStyle('backgroundImage', `url(${EDITOR.FOLDER_TOOLBAR}world.svg)`);
        world.add(worldBackground);

        const uiButton = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}ui-button.svg`).setId('tb-ui-button');
        const uiJoystick = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}ui-joystick.svg`).setId('tb-ui-joystick');
        const uiBase = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}ui-base.svg`).setId('tb-ui-base');
        ui.add(uiButton, uiJoystick, uiBase);

        scene.onClick(() => editor.execute(new EditorModeCommand(EDITOR.MODES.SCENE_EDITOR_2D)));
        cube.onClick(() => editor.execute(new EditorModeCommand(EDITOR.MODES.SCENE_EDITOR_3D)));
        world.onClick(() => editor.execute(new EditorModeCommand(EDITOR.MODES.WORLD_GRAPH)));
        ui.onClick(() => editor.execute(new EditorModeCommand(EDITOR.MODES.UI_EDITOR)));

        Signals.connect(this, 'editorModeChanged', function(mode) {
            scene.removeClass('suey-selected');
            cube.removeClass('suey-selected');
            world.removeClass('suey-selected');
            ui.removeClass('suey-selected');
            switch (mode) {
                case EDITOR.MODES.SCENE_EDITOR_2D: scene.addClass('suey-selected'); break;
                case EDITOR.MODES.SCENE_EDITOR_3D: cube.addClass('suey-selected'); break;
                case EDITOR.MODES.WORLD_GRAPH: world.addClass('suey-selected'); break;
                case EDITOR.MODES.UI_EDITOR: ui.addClass('suey-selected'); break;
            }
        });

        /******************** ADD TO TOOLBAR */

        this.add(eye, new SUEY.ToolbarSpacer(0.5), scene, cube, world, ui);
        editor.toolbarLength = this.children.length;

    }

}

export { EditorToolbar };

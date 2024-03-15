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
        const scene2d = new SUEY.ToolbarButton(null, 'left').addClass('suey-brown-button');
        const scene3d = new SUEY.ToolbarButton(null, 'middle').addClass('suey-brown-button');
        const world = new SUEY.ToolbarButton(null, 'middle').addClass('suey-brown-button');
        const ui = new SUEY.ToolbarButton(null, 'right').addClass('suey-brown-button');

        eye.dom.setAttribute('tooltip', 'Menu');
        scene2d.dom.setAttribute('tooltip', Config.tooltip('Scene Editor 2D'));
        scene3d.dom.setAttribute('tooltip', Config.tooltip('Scene Editor 3D'));
        world.dom.setAttribute('tooltip', Config.tooltip('World Graph'));
        ui.dom.setAttribute('tooltip', Config.tooltip('UI Editor'));

        Advice.attach(eye, 'toolbar/eye');
        Advice.attach(scene2d, 'toolbar/scene2d');
        Advice.attach(scene3d, 'toolbar/scene3d');
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
        const scene2DFrame = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}scene2d-frame.svg`).setId('tb-scene2d-frame');
        scene2d.add(/* editPencil, editTip */ scene2DFrame);

        const scene3DCube = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}scene3d-cube.svg`).setId('tb-scene3d-cube');
        const scene3DMtn1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}scene3d-mtn1.svg`).setId('tb-scene3d-mtn1');
        const scene3DMtn2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}scene3d-mtn2.svg`).setId('tb-scene3d-mtn2');
        const scene3DSun = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}scene3d-sun.svg`).setId('tb-scene3d-sun');
        const scene3DFrame = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}scene3d-frame.svg`).setId('tb-scene3d-frame');
        scene3d.add(scene3DCube, scene3DMtn1, scene3DSun, scene3DMtn2, scene3DFrame);

        const worldBackground = new SUEY.VectorBox().setId('tb-world-background');
        worldBackground.setStyle('backgroundImage', `url(${EDITOR.FOLDER_TOOLBAR}world.svg)`);
        world.add(worldBackground);

        const uiButton = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}ui-button.svg`).setId('tb-ui-button');
        const uiJoystick = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}ui-joystick.svg`).setId('tb-ui-joystick');
        const uiBase = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}ui-base.svg`).setId('tb-ui-base');
        ui.add(uiButton, uiJoystick, uiBase);

        scene2d.onClick(() => editor.execute(new EditorModeCommand(EDITOR.MODES.SCENE_EDITOR_2D)));
        scene3d.onClick(() => editor.execute(new EditorModeCommand(EDITOR.MODES.SCENE_EDITOR_3D)));
        world.onClick(() => editor.execute(new EditorModeCommand(EDITOR.MODES.WORLD_GRAPH)));
        ui.onClick(() => editor.execute(new EditorModeCommand(EDITOR.MODES.UI_EDITOR)));

        Signals.connect(this, 'editorModeChanged', function(mode) {
            scene2d.removeClass('suey-selected');
            scene3d.removeClass('suey-selected');
            world.removeClass('suey-selected');
            ui.removeClass('suey-selected');
            switch (mode) {
                case EDITOR.MODES.SCENE_EDITOR_2D: scene2d.addClass('suey-selected'); break;
                case EDITOR.MODES.SCENE_EDITOR_3D: scene3d.addClass('suey-selected'); break;
                case EDITOR.MODES.WORLD_GRAPH: world.addClass('suey-selected'); break;
                case EDITOR.MODES.UI_EDITOR: ui.addClass('suey-selected'); break;
            }
        });

        /******************** ADD TO TOOLBAR */

        this.add(eye, new SUEY.ToolbarSpacer(0.5), scene2d, scene3d, world, ui);
        editor.toolbarLength = this.children.length;

    }

}

export { EditorToolbar };

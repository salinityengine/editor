import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Advice } from './config/Advice.js';
import { Config } from './config/Config.js';
import { EyeMenu } from './EyeMenu.js';

import { EditorModeCommand } from './commands/Commands.js';

class EditorToolbar extends SUEY.Panel {

    constructor() {
        super({ style: SUEY.PANEL_STYLES.NONE });
        this.setClass('one-toolbar');
        this.addClass('editor-toolbar');

        // Clear Advisor on Leave
        Advice.clear(this);

        /******************** BUTTONS */

        const eye = new SUEY.ToolbarButton().addClass('osui-complement-button');
        const scene = new SUEY.ToolbarButton(null, 'left').addClass('osui-gray-button');
        const world = new SUEY.ToolbarButton(null, 'middle').addClass('osui-gray-button');
        const ui = new SUEY.ToolbarButton(null, 'right').addClass('osui-gray-button');

        eye.dom.setAttribute('tooltip', 'Menu');
        scene.dom.setAttribute('tooltip', Config.tooltip('Scene Editor'));
        world.dom.setAttribute('tooltip', Config.tooltip('World Graph'));
        ui.dom.setAttribute('tooltip', Config.tooltip('UI Editor'));

        Advice.attach(eye, 'toolbar/eye');
        Advice.attach(scene, 'toolbar/scene');
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

        const worldBackground = new SUEY.VectorBox().setId('tb-world-background');
        worldBackground.setStyle('backgroundImage', `url(${EDITOR.FOLDER_TOOLBAR}world.svg)`);
        world.add(worldBackground);

        const uiButton = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}ui-button.svg`).setId('tb-ui-button');
        const uiJoystick = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}ui-joystick.svg`).setId('tb-ui-joystick');
        const uiBase = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}ui-base.svg`).setId('tb-ui-base');
        ui.add(uiButton, uiJoystick, uiBase);

        scene.onClick(() => editor.execute(new EditorModeCommand(EDITOR.MODES.SCENE_EDITOR_3D)));
        world.onClick(() => editor.execute(new EditorModeCommand(EDITOR.MODES.WORLD_GRAPH)));
        ui.onClick(() => editor.execute(new EditorModeCommand(EDITOR.MODES.UI_EDITOR)));

        signals.editorModeChanged.add((mode) => {
            scene.removeClass('osui-selected');
            world.removeClass('osui-selected');
            ui.removeClass('osui-selected');
            switch (mode) {
                case EDITOR.MODES.SCENE_EDITOR_3D: scene.addClass('osui-selected'); break;
                case EDITOR.MODES.WORLD_GRAPH: world.addClass('osui-selected'); break;
                case EDITOR.MODES.UI_EDITOR: ui.addClass('osui-selected'); break;
            }
        });

        /******************** ADD TO TOOLBAR */

        this.add(eye, new SUEY.ToolbarSpacer(0.5), scene, world, ui);
        editor.toolbarLength = this.children.length;

    }

}

export { EditorToolbar };

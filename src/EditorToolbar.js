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
        const play = new SUEY.ToolbarButton().addClass('suey-red-button');
        const proj = new SUEY.ToolbarButton().addClass('suey-gray-button');
        const history = new SUEY.ToolbarButton().addClass('suey-gray-button');
        const settings = new SUEY.ToolbarButton().addClass('suey-gray-button');

        eye.dom.setAttribute('tooltip', 'Menu');
        scene2d.dom.setAttribute('tooltip', Config.tooltip('Scene Editor 2D'));
        scene3d.dom.setAttribute('tooltip', Config.tooltip('Scene Editor 3D'));
        world.dom.setAttribute('tooltip', Config.tooltip('World Graph'));
        ui.dom.setAttribute('tooltip', Config.tooltip('UI Editor'));
        play.dom.setAttribute('tooltip', Config.tooltip('Play Game', Config.getKey('shortcuts/play')));
        proj.dom.setAttribute('tooltip', 'Project');
        history.dom.setAttribute('tooltip', 'History');
        settings.dom.setAttribute('tooltip', 'Settings');

        Advice.attach(eye, 'toolbar/eye');
        Advice.attach(scene2d, 'toolbar/mode/scene2d');
        Advice.attach(scene3d, 'toolbar/mode/scene3d');
        Advice.attach(world, 'toolbar/mode/world');
        Advice.attach(ui, 'toolbar/mode/ui');
        Advice.attach(play, 'toolbar/play');
        Advice.attach(proj, 'toolbar/project');
        Advice.attach(history, 'toolbar/history');
        Advice.attach(settings, 'toolbar/settings');

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

        /******************** PLAY */

        const playArrow = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}play-active.svg`).setId('tb-play-arrow');
        play.add(playArrow);

        play.onClick(() => editor.player.start());

        /** When Player starts / stops, handle graying Editor, hiding 'Play' */
        Signals.connect(this, 'playerStateChanged', function(state) {
            if (state === 'start') {
                editor.addClass('salt-gray-out');
                play.setStyle('opacity', '0', 'pointer-events', 'none');
            } else if (state === 'stop') {
                editor.removeClass('salt-gray-out');
                play.setStyle('opacity', '1','pointer-events', 'all');
            }
        });

        /******************** SETTINGS */

        const projectStars = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}project-stars.svg`).setId('tb-project-stars');
        const projectShip = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}project-ship.svg`).setId('tb-project-ship');
        proj.add(projectStars, projectShip);
        const historyClock = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}history-clock.svg`).setId('tb-history-clock');
        const historySecond = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}history-second.svg`).setId('tb-history-second');
        const historyMinute = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}history-minute.svg`).setId('tb-history-minute');
        const historyHour = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}history-hour.svg`).setId('tb-history-hour');
        const historyCenter = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}history-center.svg`).setId('tb-history-center');
        history.add(historyClock, historySecond, historyMinute, historyHour, historyCenter);
        const settingsCenter = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}settings-center.svg`).setId('tb-settings-center');
        const settingsGear = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}settings-gear.svg`).setId('tb-settings-gear');
        const settingsShadow = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}settings-shadow.svg`).setId('tb-settings-shadow');
        settings.add(settingsGear, settingsShadow, settingsCenter);

        proj.onClick(() => Signals.dispatch('inspectorBuild', 'project'));
        history.onClick(() => Signals.dispatch('inspectorBuild', 'history'));
        settings.onClick(() => Signals.dispatch('inspectorBuild', 'settings'));

        /******************** ADD TO TOOLBAR */

        const left = new SUEY.FlexBox().setStyle('flex', '1 1 auto', 'pointerEvents', 'none').setWidth('50%');
        const right = new SUEY.FlexBox().setStyle('flex', '1 1 auto', 'pointerEvents', 'none').setWidth('50%');
        left.add(eye, new SUEY.ToolbarSpacer(0.5), scene2d, scene3d, world, ui, new SUEY.FlexSpacer());
        right.add(new SUEY.FlexSpacer(), play, new SUEY.ToolbarSpacer(0.5), proj, history, settings);
        this.add(left, right);

        editor.toolbarLeftLength = left.children.length - 1;
        editor.toolbarRightLength = right.children.length - 1;

    }

}

export { EditorToolbar };

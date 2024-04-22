import {
    EDITOR_MODES,
    FOLDER_TOOLBAR,
} from 'constants';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { EditorModeCommand } from '../commands/CommandList.js';

import { EyeMenu } from './EyeMenu.js';

class EditorToolbar extends SUEY.Panel {

    constructor(editor) {
        super({ style: SUEY.PANEL_STYLES.NONE });
        this.setClass('salt-toolbar');

        /******************** BUTTONS */

        const eye = new SUEY.ToolbarButton().setColor('complement');
        const scene2d = new SUEY.ToolbarButton(null, 'left').setColor('sienna');
        const scene3d = new SUEY.ToolbarButton(null, 'middle').setColor('sienna');
        const world = new SUEY.ToolbarButton(null, 'middle').setColor('sienna');
        const ui = new SUEY.ToolbarButton(null, 'right').setColor('sienna');
        const play = new SUEY.ToolbarButton().setColor('red');
        const game = new SUEY.ToolbarButton(null, 'left').setColor('gray');
        const notes = new SUEY.ToolbarButton(null, 'middle').setColor('gray');
        const history = new SUEY.ToolbarButton(null, 'middle').setColor('gray');
        const settings = new SUEY.ToolbarButton(null, 'right').setColor('gray');

        eye.setAttribute('tooltip', 'Menu');
        scene2d.setAttribute('tooltip', Config.tooltip('Scene Editor 2D'));
        scene3d.setAttribute('tooltip', Config.tooltip('Scene Editor 3D'));
        world.setAttribute('tooltip', Config.tooltip('World Graph'));
        ui.setAttribute('tooltip', Config.tooltip('UI Editor'));
        play.setAttribute('tooltip', Config.tooltip('Play Game', Config.getKey('shortcuts/play')));
        game.setAttribute('tooltip', 'Game');
        notes.setAttribute('tooltip', 'Notepad');
        history.setAttribute('tooltip', 'History');
        settings.setAttribute('tooltip', 'Settings');

        Advice.attach(eye, 'toolbar/eye');
        Advice.attach(scene2d, 'toolbar/mode/scene2d');
        Advice.attach(scene3d, 'toolbar/mode/scene3d');
        Advice.attach(world, 'toolbar/mode/world');
        Advice.attach(ui, 'toolbar/mode/ui');
        Advice.attach(play, 'toolbar/play');
        Advice.attach(game, 'toolbar/game');
        Advice.attach(notes, 'toolbar/notepad');
        Advice.attach(history, 'toolbar/history');
        Advice.attach(settings, 'toolbar/settings');

        /******************** EYE MENU */

        const eyeClosed = new SUEY.VectorBox(`${FOLDER_TOOLBAR}eye-closed.svg`).setID('tb-eye-closed');
        const eyeOpen = new SUEY.VectorBox(`${FOLDER_TOOLBAR}eye-open.svg`).setID('tb-eye-open');
        const eyeLidTop = new SUEY.VectorBox(`${FOLDER_TOOLBAR}eye-lid-top.svg`).setID('tb-eye-lid-top');
        const eyeLidBot = new SUEY.VectorBox(`${FOLDER_TOOLBAR}eye-lid-bottom.svg`).setID('tb-eye-lid-bottom');
        eye.add(eyeClosed, eyeOpen, eyeLidTop, eyeLidBot);
        eye.attachMenu(new EyeMenu(editor));

        /******************** EDITOR MODES */

        const scene2DFrame = new SUEY.VectorBox(`${FOLDER_TOOLBAR}scene2d-frame.svg`).setID('tb-scene2d-frame');
        scene2d.add(scene2DFrame);

        const scene3DCube = new SUEY.VectorBox(`${FOLDER_TOOLBAR}scene3d-cube.svg`).setID('tb-scene3d-cube');
        const scene3DMtn1 = new SUEY.VectorBox(`${FOLDER_TOOLBAR}scene3d-mtn1.svg`).setID('tb-scene3d-mtn1');
        const scene3DMtn2 = new SUEY.VectorBox(`${FOLDER_TOOLBAR}scene3d-mtn2.svg`).setID('tb-scene3d-mtn2');
        const scene3DSun = new SUEY.VectorBox(`${FOLDER_TOOLBAR}scene3d-sun.svg`).setID('tb-scene3d-sun');
        const scene3DFrame = new SUEY.VectorBox(`${FOLDER_TOOLBAR}scene3d-frame.svg`).setID('tb-scene3d-frame');
        scene3d.add(scene3DCube, scene3DMtn1, scene3DSun, scene3DMtn2, scene3DFrame);

        const worldBackground = new SUEY.VectorBox().setID('tb-world-background');
        worldBackground.setStyle('backgroundImage', `url(${FOLDER_TOOLBAR}world.svg)`);
        world.add(worldBackground);

        const uiButton = new SUEY.VectorBox(`${FOLDER_TOOLBAR}ui-button.svg`).setID('tb-ui-button');
        const uiJoystick = new SUEY.VectorBox(`${FOLDER_TOOLBAR}ui-joystick.svg`).setID('tb-ui-joystick');
        const uiBase = new SUEY.VectorBox(`${FOLDER_TOOLBAR}ui-base.svg`).setID('tb-ui-base');
        ui.add(uiButton, uiJoystick, uiBase);

        scene2d.onPress(() => editor.execute(new EditorModeCommand(EDITOR_MODES.SCENE_EDITOR_2D)));
        scene3d.onPress(() => editor.execute(new EditorModeCommand(EDITOR_MODES.SCENE_EDITOR_3D)));
        world.onPress(() => editor.execute(new EditorModeCommand(EDITOR_MODES.WORLD_GRAPH)));
        ui.onPress(() => editor.execute(new EditorModeCommand(EDITOR_MODES.UI_EDITOR)));

        Signals.connect(this, 'editorModeChanged', function(mode) {
            scene2d.wantsClass('suey-selected', mode === EDITOR_MODES.SCENE_EDITOR_2D);
            scene3d.wantsClass('suey-selected', mode === EDITOR_MODES.SCENE_EDITOR_3D);
            world.wantsClass('suey-selected', mode === EDITOR_MODES.WORLD_GRAPH);
            ui.wantsClass('suey-selected', mode === EDITOR_MODES.UI_EDITOR);
        });

        /******************** PLAY */

        const playArrow = new SUEY.VectorBox(`${FOLDER_TOOLBAR}play-active.svg`).setID('tb-play-arrow');
        play.add(playArrow);

        play.onPress(() => {
            const player = editor.getFloaterByID('player', true /* build? */);
            player.start();
        });

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

        const gameStars = new SUEY.VectorBox(`${FOLDER_TOOLBAR}game-stars.svg`).setID('tb-game-stars');
        const gameShip = new SUEY.VectorBox(`${FOLDER_TOOLBAR}game-ship.svg`).setID('tb-game-ship');
        game.add(gameStars, gameShip);

        const editPencil = new SUEY.VectorBox(`${FOLDER_TOOLBAR}notes-pencil.svg`).setID('tb-notes-pencil');
        notes.add(editPencil);

        const historyClock = new SUEY.VectorBox(`${FOLDER_TOOLBAR}history-clock.svg`).setID('tb-history-clock');
        const historySecond = new SUEY.VectorBox(`${FOLDER_TOOLBAR}history-second.svg`).setID('tb-history-second');
        const historyMinute = new SUEY.VectorBox(`${FOLDER_TOOLBAR}history-minute.svg`).setID('tb-history-minute');
        const historyHour = new SUEY.VectorBox(`${FOLDER_TOOLBAR}history-hour.svg`).setID('tb-history-hour');
        const historyCenter = new SUEY.VectorBox(`${FOLDER_TOOLBAR}history-center.svg`).setID('tb-history-center');
        history.add(historyClock, historySecond, historyMinute, historyHour, historyCenter);

        const settingsCenter = new SUEY.VectorBox(`${FOLDER_TOOLBAR}settings-center.svg`).setID('tb-settings-center');
        const settingsGear = new SUEY.VectorBox(`${FOLDER_TOOLBAR}settings-gear.svg`).setID('tb-settings-gear');
        const settingsShadow = new SUEY.VectorBox(`${FOLDER_TOOLBAR}settings-shadow.svg`).setID('tb-settings-shadow');
        settings.add(settingsGear, settingsShadow, settingsCenter);

        game.onPress(() => editor.getFloaterByID('game'));
        notes.onPress(() => editor.getFloaterByID('notepad'));
        history.onPress(() => editor.getFloaterByID('history'));
        settings.onPress(() => editor.getFloaterByID('settings'));

        /******************** ADD TO TOOLBAR */

        // Spacers:
        // - SUEY.ToolbarSpacer(0.5)
        // - SUEY.ToolbarSeparator()
        const left = new SUEY.FlexBox().setStyle('flex', '0 0 auto', 'pointerEvents', 'none');
        const middle = new SUEY.FlexBox().setStyle('flex', '1 1 auto', 'pointerEvents', 'none');
        const right = new SUEY.FlexBox().setStyle('flex', '0 0 auto', 'pointerEvents', 'none');
        left.add(eye, new SUEY.ToolbarSeparator(), scene2d, scene3d, world, ui, new SUEY.FlexSpacer());
        right.add(new SUEY.FlexSpacer(), play, new SUEY.ToolbarSeparator(), game, notes, history, settings);
        this.add(left, middle, right);

        // Reference to Middle
        this.middle = middle;
    }

}

export { EditorToolbar };

import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { ColorizeFilter } from '../gui/ColorizeFilter.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';
// import { SceneUtils } from './SceneUtils.js';

class View2DToolbar extends SUEY.Panel {

    constructor() {
        super({ style: SUEY.PANEL_STYLES.NONE });
        this.setClass('one-toolbar');

        // Clear Advisor on Leave
        Advice.clear(this);

        /******************** BUTTONS */

        const select = new SUEY.ToolbarButton(null, 'left');
        const look = new SUEY.ToolbarButton(null, 'middle');
        const move = new SUEY.ToolbarButton(null, 'middle');
        const zoom = new SUEY.ToolbarButton(null, 'right');

        const none = new SUEY.ToolbarButton(null, 'left');
        const translate = new SUEY.ToolbarButton(null, 'middle');
        const rotate = new SUEY.ToolbarButton(null, 'middle');
        const scale = new SUEY.ToolbarButton(null, 'middle');
        const rect = new SUEY.ToolbarButton(null, 'middle');
        const snap = new SUEY.ToolbarButton(null, 'middle');
        const paint = new SUEY.ToolbarButton(null, 'right');

        const focus = new SUEY.ToolbarButton();
        const reset = new SUEY.ToolbarButton();
        const toggle = new SUEY.ToolbarButton().addClass('osui-hover-active');

        const play = new SUEY.ToolbarButton();

        const proj = new SUEY.ToolbarButton();
        const history = new SUEY.ToolbarButton();
        const settings = new SUEY.ToolbarButton();

        /******************** TOOLTIPS */

        select.dom.setAttribute('tooltip', Config.tooltip('Select Mode', Config.getKey('shortcuts/select')));
        look.dom.setAttribute('tooltip', Config.tooltip('Look Mode', Config.getKey('shortcuts/look')));
        move.dom.setAttribute('tooltip', Config.tooltip('Move Mode', Config.getKey('shortcuts/move')));
        zoom.dom.setAttribute('tooltip', Config.tooltip('Zoom Mode', Config.getKey('shortcuts/zoom')));

        none.dom.setAttribute('tooltip', Config.tooltip('No Tool', Config.getKey('shortcuts/none')));
        translate.dom.setAttribute('tooltip', Config.tooltip('Translate Tool', Config.getKey('shortcuts/translate')));
        rotate.dom.setAttribute('tooltip', Config.tooltip('Rotate Tool', Config.getKey('shortcuts/rotate')));
        scale.dom.setAttribute('tooltip', Config.tooltip('Scale Tool', Config.getKey('shortcuts/scale')));
        rect.dom.setAttribute('tooltip', Config.tooltip('Rect Tool', Config.getKey('shortcuts/rect')));
        snap.dom.setAttribute('tooltip', Config.tooltip('Snap Tool', Config.getKey('shortcuts/snap')));
        paint.dom.setAttribute('tooltip', Config.tooltip('Paint Tool', Config.getKey('shortcuts/paint')));

        focus.dom.setAttribute('tooltip', Config.tooltip('Focus On Entity', Config.getKey('shortcuts/focus')));
        reset.dom.setAttribute('tooltip', Config.tooltip('Reset Camera', Config.getKey('shortcuts/camera/reset')));
        // toggle.dom.setAttribute('tooltip', 'Toggle Views');

        play.dom.setAttribute('tooltip', Config.tooltip('Play Game', Config.getKey('shortcuts/play')));

        proj.dom.setAttribute('tooltip', 'Project');
        history.dom.setAttribute('tooltip', 'History');
        settings.dom.setAttribute('tooltip', 'Settings');

        /******************** ADVISOR */

        Advice.attach(select, 'toolbar/view/select');
        Advice.attach(look, 'toolbar/view/look');
        Advice.attach(move, 'toolbar/view/move');
        Advice.attach(zoom, 'toolbar/view/zoom');

        Advice.attach(none, 'toolbar/view/none');
        Advice.attach(translate, 'toolbar/view/translate');
        Advice.attach(rotate, 'toolbar/view/rotate');
        Advice.attach(scale, 'toolbar/view/scale');
        Advice.attach(rect, 'toolbar/view/rect');
        Advice.attach(snap, 'toolbar/view/snap');
        Advice.attach(paint, 'toolbar/view/paint');

        Advice.attach(focus, 'toolbar/view/focus');
        Advice.attach(reset, 'toolbar/view/reset');
        Advice.attach(toggle, 'toolbar/view/toggle');

        Advice.attach(play, 'toolbar/view/play');

        Advice.attach(proj, 'toolbar/project');
        Advice.attach(history, 'toolbar/history');
        Advice.attach(settings, 'toolbar/settings');

        /******************** MOUSE MODES */

        const selectIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-select.svg`).setId('tb-mode-select');
        const selectCursor = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-select-cursor.svg`).setId('tb-mode-select-cursor');
        const lookIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-look-eye.svg`).setId('tb-mode-look');
        const lookPupil = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-look-pupil.svg`).setId('tb-mode-look-pupil');
        const moveIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-move.svg`).setId('tb-mode-move');
        const moveGrab = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-move-grab.svg`).setId('tb-mode-move-grab');
        const zoomIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-zoom.svg`).setId('tb-mode-zoom');

        select.add(selectIcon, selectCursor);
        look.add(lookIcon, lookPupil);
        move.add(moveIcon, moveGrab);
        zoom.add(zoomIcon);

        select.onClick(() => Signals.dispatch('mouseModeChanged', EDITOR.MOUSE_MODES.SELECT));
        look.onClick(() => Signals.dispatch('mouseModeChanged', EDITOR.MOUSE_MODES.LOOK));
        move.onClick(() => Signals.dispatch('mouseModeChanged', EDITOR.MOUSE_MODES.MOVE));
        zoom.onClick(() => Signals.dispatch('mouseModeChanged', EDITOR.MOUSE_MODES.ZOOM));

        Signals.connect(this, 'mouseModeChanged', function(mouseMode) {
            select.removeClass('osui-selected');
            look.removeClass('osui-selected');
            move.removeClass('osui-selected');
            zoom.removeClass('osui-selected');
            switch (mouseMode) {
                case EDITOR.MOUSE_MODES.SELECT: select.addClass('osui-selected'); break;
                case EDITOR.MOUSE_MODES.LOOK: look.addClass('osui-selected'); break;
                case EDITOR.MOUSE_MODES.MOVE: move.addClass('osui-selected'); break;
                case EDITOR.MOUSE_MODES.ZOOM: zoom.addClass('osui-selected'); break;
            }
        });

        /******************** TRANSFORM TOOLS */

        const noneIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-none.svg`).setId('tb-tool-none');
        const translateIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-translate.svg`).setId('tb-tool-translate');
        const rotateIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-rotate.svg`).setId('tb-tool-rotate');
        const scaleIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-scale.svg`).setId('tb-tool-scale');
        const rectLeftTop = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-rect-left-top.svg`).setId('tb-tool-rect-left-top');
        const rectLeftBot = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-rect-left-bot.svg`).setId('tb-tool-rect-left-bot');
        const rectRightTop = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-rect-right-top.svg`).setId('tb-tool-rect-right-top');
        const rectRightBot = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-rect-right-bot.svg`).setId('tb-tool-rect-right-bot');
        const snapMagnet = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-magnet.svg`).setId('SnapMagnet');
        const snapAttract = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-attract.svg`).setId('tb-snap-attract');
        const paintBrush = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}paint-brush.svg`).setId('tb-paint-brush');

        none.add(noneIcon);
        translate.add(translateIcon);
        rotate.add(rotateIcon);
        scale.add(scaleIcon);
        rect.add(rectLeftBot, rectRightBot, rectLeftTop, rectRightTop);
        snap.add(snapMagnet, snapAttract);
        paint.add(paintBrush);

        none.onClick(() => Signals.dispatch('transformModeChanged', 'none'));
        translate.onClick(() => Signals.dispatch('transformModeChanged', 'translate'));
        rotate.onClick(() => Signals.dispatch('transformModeChanged', 'rotate'));
        scale.onClick(() => Signals.dispatch('transformModeChanged', 'scale'));
        rect.onClick(() => Signals.dispatch('transformModeChanged', 'rect'));
        snap.onClick(() => Signals.dispatch('transformModeChanged', 'snap'));
        paint.onClick(() => Signals.dispatch('transformModeChanged', 'paint'));

        Signals.connect(this, 'transformModeChanged', function(mode) {
            none.removeClass('osui-selected');
            translate.removeClass('osui-selected');
            rotate.removeClass('osui-selected');
            scale.removeClass('osui-selected');
            rect.removeClass('osui-selected');
            snap.removeClass('osui-selected');
            paint.removeClass('osui-selected');
            switch (mode) {
                case 'none': none.addClass('osui-selected'); break;
                case 'translate': translate.addClass('osui-selected'); break;
                case 'rotate': rotate.addClass('osui-selected'); break;
                case 'scale': scale.addClass('osui-selected'); break;
                case 'rect': rect.addClass('osui-selected'); break;
                case 'snap': snap.addClass('osui-selected'); break;
                case 'paint': paint.addClass('osui-selected'); break;
            }
        });

        /******************** VIEW */

        const focusEye = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-eye.svg`).setId('tb-focus-eye');
        const focusPupil = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-pupil.svg`).setId('tb-focus-pupil');
        // const focusScene = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-scene.svg`).setId('tb-focus-scene');
        const focusTarget = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-target.svg`).setId('tb-focus-target');
        focus.add(focusEye, /* focusScene, */ focusPupil, focusTarget);

        const resetAxisX = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-reset-x.svg`).setId('tb-reset-axis-x');
        const resetAxisY = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-reset-y.svg`).setId('tb-reset-axis-y');
        const resetTarget = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-target.svg`).setId('tb-reset-target');
        reset.add(resetAxisX, resetAxisY, resetTarget);

        const toggleBack1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-background-1.svg`).setId('tb-toggle-back-1');
        const toggleBack2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-background-2.svg`).setId('tb-toggle-back-2');
        const toggleButton1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-button-1.svg`).setId('tb-toggle-button-1');
        const toggleButton2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-button-2.svg`).setId('tb-toggle-button-2');
        toggle.add(toggleBack1, toggleBack2, toggleButton1, toggleButton2);

        Signals.connect(this, 'schemeChanged', function() {
            const filterX = ColorizeFilter.fromColor(SUEY.ColorScheme.color(EDITOR.COLORS.X_COLOR));
            const filterY = ColorizeFilter.fromColor(SUEY.ColorScheme.color(EDITOR.COLORS.Y_COLOR));
            resetAxisX.setStyle('filter', `${filterX} ${SUEY.Css.getVariable('--drop-shadow')}`);
            resetAxisY.setStyle('filter', `${filterY} ${SUEY.Css.getVariable('--drop-shadow')}`);
        });

        reset.onClick(() => Signals.dispatch('cameraReset'));
        focus.onClick(() => Signals.dispatch('cameraFocus'));

        let _lastTooltip = '';

        Signals.connect(this, 'selectionChanged', function() {
            // Focus on Scene or Selection?
            let sceneFocus = false;
            sceneFocus ||= (editor.selected.length === 0);
            sceneFocus ||= (editor.selected.length === 1);

            // // OPTION: Disable Button
            // focus.setDisabled(editor.selected.length === 0);

            // // OPTION: Scene Icon
            // focusScene.setDisplay((sceneFocus) ? '' : 'none');
            // focusEye.setDisplay((sceneFocus) ? 'none' : '');
            // focusPupil.setDisplay((sceneFocus) ? 'none' : '');

            // OPTION: Tooltip
            const focusOn = (editor.selected.length > 1)? 'Entities' : ((sceneFocus) ? 'Scene' : 'Entity');
            if (_lastTooltip !== focusOn) {
                focus.dom.setAttribute('tooltip', Config.tooltip(`Focus On ${focusOn}`, Config.getKey('shortcuts/focus')));
            }
            _lastTooltip = focusOn;
        });

        // Toggle Menu
        const toggleMenu = new SUEY.Menu();
        toggleMenu.addClass('one-toggle-menu');
        toggleMenu.addClass('osui-menu-under');
        toggleMenu.addClass('one-button-menu');
        function createToggleButton(icon = '', tip, configKey, callback = () => {}) {
            const toggle = new SUEY.ToolbarButton(null, null, false /* background */, false /* closesMenus */);
            toggle.addClass('one-toggle-button');
            toggle.add(new SUEY.VectorBox(icon));
            toggle.onClick(() => { toggleButton(); });
            if (tip) toggle.dom.setAttribute('tooltip', tip);
            function toggleButton() {
                if (configKey) Config.setKey(configKey, (!Config.getKey(configKey)));
                setButtonValue();
                if (typeof callback === 'function') callback();
            }
            function setButtonValue() {
                toggle.removeClass('osui-toggled');
                if (configKey && Config.getKey(configKey)) toggle.addClass('osui-toggled');
            }
            Signals.connect(toggle, 'settingsRefreshed', setButtonValue)
            setButtonValue();
            return toggle;
        }
        // Boundary Toggle
        const boundaryIcon = `${EDITOR.FOLDER_MENU}toggle/boundary.svg`;
        const boundaryItem = createToggleButton(boundaryIcon, 'Scene Bounds', 'scene/render/bounds', () => {
            const bounds = Config.getKey('scene/render/bounds');

            // SceneUtils.toggleBoundaryObjects(bounds, editor.view2d.world.activeStage());

        });
        toggleMenu.add(boundaryItem);
        // Colliders Toggle
        const collidersIcon = `${EDITOR.FOLDER_MENU}toggle/colliders.svg`;
        const collidersItem = createToggleButton(collidersIcon, 'Physics Colliders', 'scene/render/colliders', () => {
            SceneUtils.toggleColliders();
        });
        toggleMenu.add(collidersItem);
        // Joints Toggle
        const jointsIcon = `${EDITOR.FOLDER_MENU}toggle/joints.svg`;
        const jointsItem = createToggleButton(jointsIcon, 'Physics Joints', 'scene/render/joints');
        toggleMenu.add(jointsItem);

        // Attach Menu
        const hoverMenu = new SUEY.Menu().addClass('osui-menu-show', 'osui-invisible-menu');
        const hoverItem = new SUEY.MenuItem().addClass('osui-invisible-menu-item');
        hoverItem.attachSubMenu(toggleMenu);
        hoverMenu.add(hoverItem);

        // Prepare Button
        toggle.setStyle('overflow', 'visible');
        toggle.setStyle('z-index', '1');
        toggle.onPointerEnter(() => { document.dispatchEvent(new Event('closemenu')); });
        toggle.addToSelf(hoverMenu);

        /******************** PLAY */

        const playArrow = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}play-arrow.svg`).setId('tb-play-arrow');
        play.add(playArrow);

        play.onClick(() => Signals.dispatch('startPlayer'));

        /** When Player starts / stops, handle graying Editor, hiding 'Play' */
        Signals.connect(this, 'playerStateChanged', function(state) {
            if (state === 'start') {
                editor.addClass('one-gray-out');
                play.setStyle('display', 'none', 'pointer-events', 'none');
            } else if (state === 'stop') {
                editor.removeClass('one-gray-out');
                play.setStyle('display', '','pointer-events', 'all');
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

        Signals.connect(this, 'inspectorChanged', function() {
            proj.removeClass('osui-selected');
            history.removeClass('osui-selected');
            settings.removeClass('osui-selected');
            if (!editor.inspector) return;
            const item = editor.inspector.currentItem();
            if (item === 'project') proj.addClass('osui-selected');
            if (item === 'history') history.addClass('osui-selected');
            if (item === 'settings') settings.addClass('osui-selected');
        });

        /******************** ADD TO TOOLBAR */

        const left = new SUEY.FlexBox().setStyle('flex', '1 1 auto').setWidth('50%');
        left.add(new SUEY.ToolbarSpacer(editor.toolbarLength));
        left.add(new SUEY.FlexSpacer());
        left.add(select, look, move, zoom);
        left.add(new SUEY.FlexSpacer());

        const middle = new SUEY.FlexBox().setStyle('flex', '0 1 auto');
        middle.add(none, translate, rotate, scale, rect, snap, paint);

        const right = new SUEY.FlexBox().setStyle('flex', '1 1 auto').setWidth('50%');
        right.add(new SUEY.ToolbarSeparator(), focus, /* INCLUDE?: reset, */ toggle);
        right.add(new SUEY.FlexSpacer(), play, new SUEY.FlexSpacer());
        right.add(proj, history, settings);

        left.setStyle('pointerEvents', 'none');
        middle.setStyle('pointerEvents', 'none');
        right.setStyle('pointerEvents', 'none');

        this.add(left, middle, right);

    } // end ctor

}

export { View2DToolbar };

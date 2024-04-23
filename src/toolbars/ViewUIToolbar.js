import {
    COLORS,
    FOLDER_TOOLBAR,
    MOUSE_MODES,
} from 'constants';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

class ViewUIToolbar {

    constructor(viewui) {

        /******************** BUTTONS */

        // Mouse Modes
        const select = new SUEY.ToolbarButton(null, 'left');
        const move = new SUEY.ToolbarButton(null, 'middle');
        const zoom = new SUEY.ToolbarButton(null, 'right');

        // Focus
        const focus = new SUEY.ToolbarButton(null, 'left');
        const reset = new SUEY.ToolbarButton(null, 'right');

        /******************** TOOLTIPS */

        // Mouse Modes
        select.setAttribute('tooltip', Config.tooltip('Select Mode', Config.getKey('shortcuts/select')));
        move.setAttribute('tooltip', Config.tooltip('Move Mode', Config.getKey('shortcuts/move')));
        zoom.setAttribute('tooltip', Config.tooltip('Zoom Mode', Config.getKey('shortcuts/zoom')));

        // Focus
        focus.setAttribute('tooltip', Config.tooltip('Focus On Entity', Config.getKey('shortcuts/focus')));
        reset.setAttribute('tooltip', Config.tooltip('Reset Camera', Config.getKey('shortcuts/camera/reset')));

        /******************** ADVISOR */

        // Mouse Modes
        Advice.attach(select, 'toolbar/mouse/select');
        Advice.attach(move, 'toolbar/mouse/move');
        Advice.attach(zoom, 'toolbar/mouse/zoom');

        // Focus
        Advice.attach(focus, 'toolbar/focus/onto');
        Advice.attach(reset, 'toolbar/focus/reset');

        /******************** MOUSE MODES */

        const selectIcon = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-select.svg`).setID('tb-mode-select');
        const selectCursor = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-select-cursor.svg`).setID('tb-mode-select-cursor');
        const moveIcon = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-move.svg`).setID('tb-mode-move');
        const moveGrab = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-move-grab.svg`).setID('tb-mode-move-grab');
        const zoomIcon = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-zoom.svg`).setID('tb-mode-zoom');

        select.add(selectIcon, selectCursor);
        move.add(moveIcon, moveGrab);
        zoom.add(zoomIcon);

        select.onPress(() => Signals.dispatch('mouseModeChanged', MOUSE_MODES.SELECT));
        move.onPress(() => Signals.dispatch('mouseModeChanged', MOUSE_MODES.MOVE));
        zoom.onPress(() => Signals.dispatch('mouseModeChanged', MOUSE_MODES.ZOOM));

        Signals.connect(viewui, 'mouseModeChanged', (mouseMode) => {
            select.wantsClass('suey-selected', mouseMode === MOUSE_MODES.SELECT);
            move.wantsClass('suey-selected', mouseMode === MOUSE_MODES.MOVE);
            zoom.wantsClass('suey-selected', mouseMode === MOUSE_MODES.ZOOM);
        });

        /******************** FOCUS */

        const focusEye = new SUEY.VectorBox(`${FOLDER_TOOLBAR}focus-eye.svg`).setID('tb-focus-eye');
        const focusPupil = new SUEY.VectorBox(`${FOLDER_TOOLBAR}focus-pupil.svg`).setID('tb-focus-pupil');
        // const focusScene = new SUEY.VectorBox(`${FOLDER_TOOLBAR}focus-scene.svg`).setID('tb-focus-scene');
        const focusTarget = new SUEY.VectorBox(`${FOLDER_TOOLBAR}focus-target.svg`).setID('tb-focus-target');
        focus.add(focusEye, /* focusScene, */ focusPupil, focusTarget);

        const resetAxisX = new SUEY.VectorBox(`${FOLDER_TOOLBAR}focus-reset-x.svg`).setID('tb-reset-axis-x');
        const resetAxisY = new SUEY.VectorBox(`${FOLDER_TOOLBAR}focus-reset-y.svg`).setID('tb-reset-axis-y');
        resetAxisX.setColor(COLORS.X_COLOR);
        resetAxisY.setColor(COLORS.Y_COLOR);
        const resetTarget = new SUEY.VectorBox(`${FOLDER_TOOLBAR}focus-target.svg`).setID('tb-reset-target');
        reset.add(resetAxisX, resetAxisY, resetTarget);

        reset.onPress(() => viewui.cameraReset());
        focus.onPress(() => viewui.cameraFocus());

        let _lastTooltip = '';

        Signals.connect(viewui, 'selectionChanged', () => {
            if (viewui.isHidden()) return;

            // Focus on Scene or Selection?
            let sceneFocus = false;
            sceneFocus ||= (viewui.selected.length === 0);
            sceneFocus ||= (viewui.selected.length === 1);

            // // OPTION: Disable Button
            // focus.setDisabled(viewui.selected.length === 0);

            // // OPTION: Scene Icon
            // focusScene.setStyle('display', (sceneFocus) ? '' : 'none');
            // focusEye.setStyle('display', (sceneFocus) ? 'none' : '');
            // focusPupil.setStyle('display', (sceneFocus) ? 'none' : '');

            // OPTION: Tooltip
            const focusOn = (viewui.selected.length > 1)? 'Entities' : ((sceneFocus) ? 'Scene' : 'Entity');
            if (_lastTooltip !== focusOn) {
                focus.setAttribute('tooltip', Config.tooltip(`Focus On ${focusOn}`, Config.getKey('shortcuts/focus')));
            }
            _lastTooltip = focusOn;
        });

        /******************** ADD TO TOOLBAR */

        const buttons = [];
        buttons.push(new SUEY.ToolbarSpacer(1.0));
        buttons.push(select, move, zoom, new SUEY.ToolbarSeparator(), focus, reset);
        buttons.push(new SUEY.FlexSpacer());
        this.buttons = buttons;

    } // end ctor

}

export { ViewUIToolbar };

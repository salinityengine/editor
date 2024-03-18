import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { ColorizeFilter } from '../gui/ColorizeFilter.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

class ViewUIToolbar extends SUEY.Panel {

    constructor(viewui) {
        super({ style: SUEY.PANEL_STYLES.NONE });
        this.setClass('salt-toolbar');

        // Clear Advisor on Leave
        Advice.clear(this);

        /******************** BUTTONS */

        // Mouse Modes
        const select = new SUEY.ToolbarButton(null, 'left');
        const move = new SUEY.ToolbarButton(null, 'middle');
        const zoom = new SUEY.ToolbarButton(null, 'right');

        // Focus
        const focus = new SUEY.ToolbarButton(null, 'left');
        const reset = new SUEY.ToolbarButton(null, 'right');

        // Layer
        const arrange = new SUEY.ToolbarButton(null, 'left');
        const transform = new SUEY.ToolbarButton(null, 'right');

        // Grid
        const gridTop = new SUEY.ToolbarButton(null, 'left');
        const gridResize = new SUEY.ToolbarButton(null, 'middle');
        const gridSnap = new SUEY.ToolbarButton(null, 'right');

        /******************** TOOLTIPS */

        // Mouse Modes
        select.dom.setAttribute('tooltip', Config.tooltip('Select Mode', Config.getKey('shortcuts/select')));
        move.dom.setAttribute('tooltip', Config.tooltip('Move Mode', Config.getKey('shortcuts/move')));
        zoom.dom.setAttribute('tooltip', Config.tooltip('Zoom Mode', Config.getKey('shortcuts/zoom')));

        // Focus
        focus.dom.setAttribute('tooltip', Config.tooltip('Focus On Entity', Config.getKey('shortcuts/focus')));
        reset.dom.setAttribute('tooltip', Config.tooltip('Reset Camera', Config.getKey('shortcuts/camera/reset')));

        // Layer
        arrange.dom.setAttribute('tooltip', Config.tooltip('Arrange', null));
        transform.dom.setAttribute('tooltip', Config.tooltip('Transform', null));

        // Grid
        gridTop.dom.setAttribute('tooltip', Config.tooltip('Grid on Top?'));
        gridResize.dom.setAttribute('tooltip', Config.tooltip('Resize to Grid?'));
        gridSnap.dom.setAttribute('tooltip', Config.tooltip('Snap to Grid?', 'g'));

        /******************** ADVISOR */

        // Mouse Modes
        Advice.attach(select, 'toolbar/mouse/select');
        Advice.attach(move, 'toolbar/mouse/move');
        Advice.attach(zoom, 'toolbar/mouse/zoom');

        // Focus
        Advice.attach(focus, 'toolbar/focus/onto');
        Advice.attach(reset, 'toolbar/focus/reset');

        // Layer
        Advice.attach(arrange, 'Arrange', 'For moving objects up and down in z-order.');
        Advice.attach(transform, 'Transform', 'For altering the transform of an object.');

        // Grid
        Advice.attach(gridSnap, 'toolbar/grid/snap');

        /******************** MOUSE MODES */

        const selectIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-select.svg`).setId('tb-mode-select');
        const selectCursor = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-select-cursor.svg`).setId('tb-mode-select-cursor');
        const moveIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-move.svg`).setId('tb-mode-move');
        const moveGrab = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-move-grab.svg`).setId('tb-mode-move-grab');
        const zoomIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-zoom.svg`).setId('tb-mode-zoom');

        select.add(selectIcon, selectCursor);
        move.add(moveIcon, moveGrab);
        zoom.add(zoomIcon);

        select.onClick(() => Signals.dispatch('mouseModeChanged', EDITOR.MOUSE_MODES.SELECT));
        move.onClick(() => Signals.dispatch('mouseModeChanged', EDITOR.MOUSE_MODES.MOVE));
        zoom.onClick(() => Signals.dispatch('mouseModeChanged', EDITOR.MOUSE_MODES.ZOOM));

        Signals.connect(this, 'mouseModeChanged', function(mouseMode) {
            select.removeClass('suey-selected');
            move.removeClass('suey-selected');
            zoom.removeClass('suey-selected');
            switch (mouseMode) {
                case EDITOR.MOUSE_MODES.SELECT: select.addClass('suey-selected'); break;
                case EDITOR.MOUSE_MODES.MOVE: move.addClass('suey-selected'); break;
                case EDITOR.MOUSE_MODES.ZOOM: zoom.addClass('suey-selected'); break;
            }
        });

        /******************** FOCUS */

        const focusEye = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-eye.svg`).setId('tb-focus-eye');
        const focusPupil = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-pupil.svg`).setId('tb-focus-pupil');
        // const focusScene = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-scene.svg`).setId('tb-focus-scene');
        const focusTarget = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-target.svg`).setId('tb-focus-target');
        focus.add(focusEye, /* focusScene, */ focusPupil, focusTarget);

        const resetAxisX = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-reset-x.svg`).setId('tb-reset-axis-x');
        const resetAxisY = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-reset-y.svg`).setId('tb-reset-axis-y');
        const resetTarget = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-target.svg`).setId('tb-reset-target');
        reset.add(resetAxisX, resetAxisY, resetTarget);

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

        /******************** LAYER */

        //
        // TODO
        //

        /******************** GRID */

        //
        // TODO
        //

        /******************** ADD TO TOOLBAR */

        // const left = new SUEY.FlexBox().setStyle('flex', '1 1 auto', 'pointerEvents', 'none').setWidth('50%');
        // const middle = new SUEY.FlexBox().setStyle('flex', '0 1 auto', 'pointerEvents', 'none');
        // const right = new SUEY.FlexBox().setStyle('flex', '1 1 auto', 'pointerEvents', 'none').setWidth('50%');
        // this.add(left, middle, right);

        this.add(new SUEY.ToolbarSpacer(editor.toolbarLeftLength));
        this.add(new SUEY.FlexSpacer());
        this.add(select, move, zoom, new SUEY.ToolbarSeparator(), focus, reset);
        this.add(new SUEY.FlexSpacer());
        this.add(arrange, transform);
        this.add(new SUEY.FlexSpacer());
        this.add(gridTop, gridResize, gridSnap);
        this.add(new SUEY.FlexSpacer());
        this.add(new SUEY.ToolbarSpacer(editor.toolbarRightLength));

    } // end ctor

}

export { ViewUIToolbar };

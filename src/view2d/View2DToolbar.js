import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { ColorizeFilter } from '../gui/ColorizeFilter.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';
import { ToggleButton } from '../gui/ToggleButton.js';

class View2DToolbar extends SUEY.Panel {

    constructor(view2d) {
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

        // Views
        const views = new SUEY.ToolbarButton().addClass('suey-hover-active');

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

        // Views
        // views.dom.setAttribute('tooltip', 'Toggle Views');

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
        Advice.attach(arrange, 'toolbar/layer/arrange');
        Advice.attach(transform, 'Transform', 'For altering the transform of an object.');

        // Views
        Advice.attach(views, 'toolbar/scene/views');

        // Grid
        Advice.attach(gridTop, 'toolbar/grid/top');
        Advice.attach(gridResize, 'toolbar/grid/resize');
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

        const arrangeTop = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-top.svg`).setId('tb-arrange-top');
        const arrangeMiddle = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-middle.svg`).setId('tb-arrange-middle');
        const arrangeBottom = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-bottom.svg`).setId('tb-arrange-bottom');
        arrange.add(arrangeBottom, arrangeMiddle, arrangeTop);




        /******************** VIEWS */

        const toggleBack1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-background-1.svg`).setId('tb-toggle-back-1');
        const toggleBack2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-background-2.svg`).setId('tb-toggle-back-2');
        const toggleButton1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-button-1.svg`).setId('tb-toggle-button-1');
        const toggleButton2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-button-2.svg`).setId('tb-toggle-button-2');
        views.add(toggleBack1, toggleBack2, toggleButton1, toggleButton2);

        // Views Menu
        const viewsMenu = new SUEY.Menu();
        viewsMenu.addClass('salt-toggle-menu');
        viewsMenu.addClass('suey-menu-under');
        viewsMenu.addClass('salt-button-menu');
        // Boundary Toggle
        const boundaryIcon = `${EDITOR.FOLDER_MENU}toggle/boundary.svg`;
        const boundaryItem = new ToggleButton(boundaryIcon, 'Scene Bounds', 'scene/render/bounds', () => {
            const bounds = Config.getKey('scene/render/bounds');
            // SceneUtils.toggleBoundaryObjects(bounds, editor.view2d.world.activeStage());
        });
        viewsMenu.add(boundaryItem);
        // Colliders Toggle
        const collidersIcon = `${EDITOR.FOLDER_MENU}toggle/colliders.svg`;
        const collidersItem = new ToggleButton(collidersIcon, 'Physics Colliders', 'scene/render/colliders', () => {
            SceneUtils.toggleColliders();
        });
        viewsMenu.add(collidersItem);
        // Joints Toggle
        const jointsIcon = `${EDITOR.FOLDER_MENU}toggle/joints.svg`;
        const jointsItem = new ToggleButton(jointsIcon, 'Physics Joints', 'scene/render/joints');
        viewsMenu.add(jointsItem);
        // Attach Menu
        const hoverMenu = new SUEY.Menu().addClass('suey-menu-show', 'suey-invisible-menu');
        const hoverItem = new SUEY.MenuItem().addClass('suey-invisible-menu-item');
        hoverItem.attachSubMenu(viewsMenu);
        hoverMenu.add(hoverItem);

        // Prepare Button
        views.setStyle('overflow', 'visible');
        views.setStyle('z-index', '1');
        views.onPointerEnter(() => { document.dispatchEvent(new Event('closemenu')); });
        views.addToSelf(hoverMenu);

        /******************** GRID */

        const snapMagnet = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-magnet.svg`).setId('SnapMagnet');
        const snapAttract = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-attract.svg`).setId('tb-snap-attract');
        gridSnap.add(snapMagnet, snapAttract);

        gridSnap.onClick(() => {
            const snapping = !Config.getKey('scene/grid/snap');
            Config.setKey('scene/grid/snap', snapping);
            view2d.snapToGrid = snapping;
            Signals.dispatch('gridChanged');
        });

        Signals.connect(this, 'gridChanged', function() {
            const snapping = Config.getKey('scene/grid/snap');
            if (snapping) gridSnap.addClass('suey-selected');
            else gridSnap.removeClass('suey-selected');
        })

        /******************** ADD TO TOOLBAR */

        // const left = new SUEY.FlexBox().setStyle('flex', '1 1 auto', 'pointerEvents', 'none').setWidth('50%');
        // const middle = new SUEY.FlexBox().setStyle('flex', '0 1 auto', 'pointerEvents', 'none');
        // const right = new SUEY.FlexBox().setStyle('flex', '1 1 auto', 'pointerEvents', 'none').setWidth('50%');
        // this.add(left, middle, right);

        this.add(new SUEY.ToolbarSpacer(editor.toolbarLeftLength));
        this.add(new SUEY.FlexSpacer());
        this.add(select, move, zoom, new SUEY.ToolbarSeparator(), focus, reset);
        this.add(new SUEY.FlexSpacer());
        this.add(arrange, transform, new SUEY.ToolbarSeparator(), views);
        this.add(new SUEY.FlexSpacer());
        this.add(gridTop, gridResize, gridSnap);
        this.add(new SUEY.FlexSpacer());
        this.add(new SUEY.ToolbarSpacer(editor.toolbarRightLength));

    } // end ctor

}

export { View2DToolbar };

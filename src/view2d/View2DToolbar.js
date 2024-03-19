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
        const arrange = new SUEY.ToolbarButton(null, 'left').addClass('suey-hover-active');
        const transform = new SUEY.ToolbarButton(null, 'right').addClass('suey-hover-active');

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
        // arrange.dom.setAttribute('tooltip', Config.tooltip('Arrange', null));
        // transform.dom.setAttribute('tooltip', Config.tooltip('Transform', null));

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
        Advice.attach(transform, 'toolbar/layer/transform');

        // Views
        Advice.attach(views, 'toolbar/scene/views');

        // Grid
        Advice.attach(gridTop, 'toolbar/grid/top');
        Advice.attach(gridResize, 'toolbar/grid/resize');
        Advice.attach(gridSnap, 'toolbar/grid/snap');

        /******************** MOUSE MODES */

        const selectIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-select.svg`).setID('tb-mode-select');
        const selectCursor = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-select-cursor.svg`).setID('tb-mode-select-cursor');
        const moveIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-move.svg`).setID('tb-mode-move');
        const moveGrab = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-move-grab.svg`).setID('tb-mode-move-grab');
        const zoomIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-zoom.svg`).setID('tb-mode-zoom');

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

        const focusEye = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-eye.svg`).setID('tb-focus-eye');
        const focusPupil = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-pupil.svg`).setID('tb-focus-pupil');
        // const focusScene = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-scene.svg`).setID('tb-focus-scene');
        const focusTarget = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-target.svg`).setID('tb-focus-target');
        focus.add(focusEye, /* focusScene, */ focusPupil, focusTarget);

        const resetAxisX = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-reset-x.svg`).setID('tb-reset-axis-x');
        const resetAxisY = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-reset-y.svg`).setID('tb-reset-axis-y');
        const resetTarget = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}focus-target.svg`).setID('tb-reset-target');
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

        /***** ARRANGE */

        const arrangeTop = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-top.svg`).setID('tb-arrange-top');
        const arrangeMiddle = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-middle.svg`).setID('tb-arrange-middle');
        const arrangeBottom = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-bottom.svg`).setID('tb-arrange-bottom');
        arrange.add(arrangeBottom, arrangeMiddle, arrangeTop);

        // To Back
        const backIcon1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-back-1.svg`).setID('tb-arrange-back');
        const backIcon2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-back-2.svg`);
        const backItem = new SUEY.ToolbarButton().add(backIcon1, backIcon2);

        // Backward
        const backwardIcon1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-backward-1.svg`).setID('tb-arrange-backward');
        const backwardIcon2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-backward-2.svg`);
        const backwardItem = new SUEY.ToolbarButton().add(backwardIcon1, backwardIcon2);

        // Forward
        const forwardIcon1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-forward-1.svg`).setID('tb-arrange-forward');
        const forwardIcon2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-forward-2.svg`);
        const forwardItem = new SUEY.ToolbarButton().add(forwardIcon1, forwardIcon2);

        // To Front
        const frontIcon1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-front-1.svg`).setID('tb-arrange-front');
        const frontIcon2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}arrange-front-2.svg`);
        const frontItem = new SUEY.ToolbarButton().add(frontIcon1, frontIcon2);

        backItem.dom.setAttribute('tooltip', Config.tooltip('Send to Back', null));
        backwardItem.dom.setAttribute('tooltip', Config.tooltip('Send Backward', null));
        forwardItem.dom.setAttribute('tooltip', Config.tooltip('Send Forward', null));
        frontItem.dom.setAttribute('tooltip', Config.tooltip('Send to Front', null));

        Advice.attach(backItem, 'Send to Back', 'Send selected object(s) to back.');
        Advice.attach(backwardItem, 'Send Backward', 'Send selected object(s) back one.');
        Advice.attach(forwardItem, 'Send Forward', 'Send selected object(s) forward one.');
        Advice.attach(frontItem, 'Send to Front', 'Send selected object(s) to the front.');

        // Arrange Menu
        const arrangeMenu = new SUEY.Menu();
        arrangeMenu.addClass('salt-toggle-menu');
        arrangeMenu.addClass('suey-menu-under');
        arrangeMenu.addClass('salt-button-menu');
        arrangeMenu.add(backItem, backwardItem, forwardItem, frontItem);

        // Attach Menu
        const hoverArrangeMenu = new SUEY.Menu().addClass('suey-menu-show', 'suey-invisible-menu');
        const hoverArrangeItem = new SUEY.MenuItem().addClass('suey-invisible-menu-item');
        hoverArrangeItem.attachSubMenu(arrangeMenu);
        hoverArrangeMenu.add(hoverArrangeItem);

        // Prepare Button
        arrange.setStyle('overflow', 'visible');
        arrange.setStyle('z-index', '1');
        arrange.onPointerEnter(() => { document.dispatchEvent(new Event('closemenu')); });
        arrange.addToSelf(hoverArrangeMenu);

        /***** TRANSFORM */

        const transformFront = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-front.svg`).setID('tb-transform-front');
        const transformBack = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-back.svg`).setID('tb-transform-back');
        transform.add(transformBack, transformFront);

        // Reset
        const resetIcon1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-reset-1.svg`).setID('tb-transform-reset');
        const resetIcon2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-reset-2.svg`);
        const resetItem = new SUEY.ToolbarButton().add(resetIcon1, resetIcon2);

        // Flip Horizontal
        const horizontalIcon1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-horizontal-1.svg`).setID('tb-transform-horizontal');
        const horizontalIcon2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-horizontal-2.svg`);
        const horizontalItem = new SUEY.ToolbarButton().add(horizontalIcon2, horizontalIcon1);

        // Flip Vertical
        const verticalIcon1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-vertical-1.svg`).setID('tb-transform-vertical');
        const verticalIcon2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-vertical-2.svg`);
        const verticalItem = new SUEY.ToolbarButton().add(verticalIcon2, verticalIcon1);

        // Rotate Left
        const leftIcon1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-left-1.svg`).setID('tb-transform-left');
        const leftIcon2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-left-2.svg`);
        const leftItem = new SUEY.ToolbarButton().add(leftIcon2, leftIcon1);

        // Rotate Right
        const rightIcon1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-right-1.svg`).setID('tb-transform-right');
        const rightIcon2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}transform-right-2.svg`);
        const rightItem = new SUEY.ToolbarButton().add(rightIcon2, rightIcon1);

        resetItem.dom.setAttribute('tooltip', Config.tooltip('Reset Transform', null));
        horizontalItem.dom.setAttribute('tooltip', Config.tooltip('Flip Horizontal', null));
        verticalItem.dom.setAttribute('tooltip', Config.tooltip('Flip Vertical', null));
        leftItem.dom.setAttribute('tooltip', Config.tooltip('Rotate Left', null));
        rightItem.dom.setAttribute('tooltip', Config.tooltip('Rotate Right', null));

        Advice.attach(resetItem, 'Reset Transform', 'Resets selected object(s) transform to a Scale of X:1, Y:1 and a Rotation of 0 degrees.');
        Advice.attach(horizontalItem, 'Flip Horizontal', 'Flips the selected object(s) horizontally.');
        Advice.attach(verticalItem, 'Flip Vertical', 'Flips the selected object(s) vertically.');
        Advice.attach(leftItem, 'Rotate Left', 'Rotates the selected object(s) counter-clockwise by 90 degrees.');
        Advice.attach(rightItem, 'Rotate Right', 'Rotates the selected object(s) clockwise by 90 degrees.');

        // Arrange Menu
        const transformMenu = new SUEY.Menu();
        transformMenu.addClass('salt-toggle-menu');
        transformMenu.addClass('suey-menu-under');
        transformMenu.addClass('salt-button-menu');
        transformMenu.add(resetItem, horizontalItem, verticalItem, leftItem, rightItem);

        // Attach Menu
        const hoverTransformMenu = new SUEY.Menu().addClass('suey-menu-show', 'suey-invisible-menu');
        const hoverTransformItem = new SUEY.MenuItem().addClass('suey-invisible-menu-item');
        hoverTransformItem.attachSubMenu(transformMenu);
        hoverTransformMenu.add(hoverTransformItem);

        // Prepare Button
        transform.setStyle('overflow', 'visible');
        transform.setStyle('z-index', '1');
        transform.onPointerEnter(() => { document.dispatchEvent(new Event('closemenu')); });
        transform.addToSelf(hoverTransformMenu);

        /******************** VIEWS */

        const toggleBack1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-background-1.svg`).setID('tb-toggle-back-1');
        const toggleBack2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-background-2.svg`).setID('tb-toggle-back-2');
        const toggleButton1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-button-1.svg`).setID('tb-toggle-button-1');
        const toggleButton2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-button-2.svg`).setID('tb-toggle-button-2');
        views.add(toggleBack1, toggleBack2, toggleButton1, toggleButton2);

        // Boundary Toggle
        const boundaryIcon = `${EDITOR.FOLDER_MENU}toggle/boundary.svg`;
        const boundaryItem = new ToggleButton(boundaryIcon, 'Scene Bounds', 'scene/render/bounds', () => {
            const bounds = Config.getKey('scene/render/bounds');
            // SceneUtils.toggleBoundaryObjects(bounds, editor.view2d.world.activeStage());
        });

        // Colliders Toggle
        const collidersIcon = `${EDITOR.FOLDER_MENU}toggle/colliders.svg`;
        const collidersItem = new ToggleButton(collidersIcon, 'Physics Colliders', 'scene/render/colliders', () => {
            // SceneUtils.toggleColliders();
        });

        // Joints Toggle
        const jointsIcon = `${EDITOR.FOLDER_MENU}toggle/joints.svg`;
        const jointsItem = new ToggleButton(jointsIcon, 'Physics Joints', 'scene/render/joints');

        // Views Menu
        const viewsMenu = new SUEY.Menu();
        viewsMenu.addClass('salt-toggle-menu');
        viewsMenu.addClass('suey-menu-under');
        viewsMenu.addClass('salt-button-menu');
        viewsMenu.add(boundaryItem, collidersItem, jointsItem);

        // Attach Menu
        const hoverToggleMenu = new SUEY.Menu().addClass('suey-menu-show', 'suey-invisible-menu');
        const hoverToggleItem = new SUEY.MenuItem().addClass('suey-invisible-menu-item');
        hoverToggleItem.attachSubMenu(viewsMenu);
        hoverToggleMenu.add(hoverToggleItem);

        // Prepare Button
        views.setStyle('overflow', 'visible');
        views.setStyle('z-index', '1');
        views.onPointerEnter(() => { document.dispatchEvent(new Event('closemenu')); });
        views.addToSelf(hoverToggleMenu);

        /******************** GRID */

        const snapMagnet = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-magnet.svg`).setID('SnapMagnet');
        const snapAttract = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-attract.svg`).setID('tb-snap-attract');
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

        this.add(new SUEY.ToolbarSpacer(editor.toolbarLeftLength));
        this.add(new SUEY.ToolbarSpacer(1.0));
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

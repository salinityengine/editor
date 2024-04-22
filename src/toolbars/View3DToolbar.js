import {
    COLORS,
    FOLDER_MENU,
    FOLDER_TOOLBAR,
    MOUSE_MODES,
} from 'constants';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';
// import { SceneUtils } from './SceneUtils.js';
import { ToggleButton } from '../gui/ToggleButton.js';

class View3DToolbar {

    constructor(view3d) {

        /******************** BUTTONS */

        // Mouse Modes
        const select = new SUEY.ToolbarButton(null, 'left');
        const look = new SUEY.ToolbarButton(null, 'middle');
        const move = new SUEY.ToolbarButton(null, 'middle');
        const zoom = new SUEY.ToolbarButton(null, 'right');

        // Focus
        const focus = new SUEY.ToolbarButton();
        const reset = new SUEY.ToolbarButton();

        // Transform Tools
        const none = new SUEY.ToolbarButton(null, 'left');
        const translate = new SUEY.ToolbarButton(null, 'middle');
        const rotate = new SUEY.ToolbarButton(null, 'middle');
        const scale = new SUEY.ToolbarButton(null, 'middle');
        const rect = new SUEY.ToolbarButton(null, 'middle');
        const snap = new SUEY.ToolbarButton(null, 'middle');
        const paint = new SUEY.ToolbarButton(null, 'right');

        // Views
        const views = new SUEY.ToolbarButton().addClass('suey-hover-active');

        /******************** TOOLTIPS */

        // Mouse Modes
        select.setAttribute('tooltip', Config.tooltip('Select Mode', Config.getKey('shortcuts/select')));
        look.setAttribute('tooltip', Config.tooltip('Look Mode', Config.getKey('shortcuts/look')));
        move.setAttribute('tooltip', Config.tooltip('Move Mode', Config.getKey('shortcuts/move')));
        zoom.setAttribute('tooltip', Config.tooltip('Zoom Mode', Config.getKey('shortcuts/zoom')));

        // Focus
        focus.setAttribute('tooltip', Config.tooltip('Focus On Entity', Config.getKey('shortcuts/focus')));
        reset.setAttribute('tooltip', Config.tooltip('Reset Camera', Config.getKey('shortcuts/camera/reset')));

        // Transform Tools
        none.setAttribute('tooltip', Config.tooltip('No Tool', Config.getKey('shortcuts/none')));
        translate.setAttribute('tooltip', Config.tooltip('Translate Tool', Config.getKey('shortcuts/translate')));
        rotate.setAttribute('tooltip', Config.tooltip('Rotate Tool', Config.getKey('shortcuts/rotate')));
        scale.setAttribute('tooltip', Config.tooltip('Scale Tool', Config.getKey('shortcuts/scale')));
        rect.setAttribute('tooltip', Config.tooltip('Rect Tool', Config.getKey('shortcuts/rect')));
        snap.setAttribute('tooltip', Config.tooltip('Snap Tool', Config.getKey('shortcuts/snap')));
        paint.setAttribute('tooltip', Config.tooltip('Paint Tool', Config.getKey('shortcuts/paint')));

        // Views
        // views.setAttribute('tooltip', 'Toggle Views');

        /******************** ADVISOR */

        // Mouse Modes
        Advice.attach(select, 'toolbar/mouse/select');
        Advice.attach(look, 'toolbar/mouse/look');
        Advice.attach(move, 'toolbar/mouse/move');
        Advice.attach(zoom, 'toolbar/mouse/zoom');

        // Focus
        Advice.attach(focus, 'toolbar/focus/onto');
        Advice.attach(reset, 'toolbar/focus/reset');

        // Transform Tools
        Advice.attach(none, 'toolbar/transform/none');
        Advice.attach(translate, 'toolbar/transform/translate');
        Advice.attach(rotate, 'toolbar/transform/rotate');
        Advice.attach(scale, 'toolbar/transform/scale');
        Advice.attach(rect, 'toolbar/transform/rect');
        Advice.attach(snap, 'toolbar/transform/snap');
        Advice.attach(paint, 'toolbar/transform/paint');

        // Views
        Advice.attach(views, 'toolbar/scene/views');

        /******************** MOUSE MODES */

        const selectIcon = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-select.svg`).setID('tb-mode-select');
        const selectCursor = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-select-cursor.svg`).setID('tb-mode-select-cursor');
        const lookIcon = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-look-eye.svg`).setID('tb-mode-look');
        const lookPupil = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-look-pupil.svg`).setID('tb-mode-look-pupil');
        const moveIcon = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-move.svg`).setID('tb-mode-move');
        const moveGrab = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-move-grab.svg`).setID('tb-mode-move-grab');
        const zoomIcon = new SUEY.VectorBox(`${FOLDER_TOOLBAR}mode-zoom.svg`).setID('tb-mode-zoom');

        select.add(selectIcon, selectCursor);
        look.add(lookIcon, lookPupil);
        move.add(moveIcon, moveGrab);
        zoom.add(zoomIcon);

        select.onPress(() => Signals.dispatch('mouseModeChanged', MOUSE_MODES.SELECT));
        look.onPress(() => Signals.dispatch('mouseModeChanged', MOUSE_MODES.LOOK));
        move.onPress(() => Signals.dispatch('mouseModeChanged', MOUSE_MODES.MOVE));
        zoom.onPress(() => Signals.dispatch('mouseModeChanged', MOUSE_MODES.ZOOM));

        Signals.connect(view3d, 'mouseModeChanged', function(mouseMode) {
            select.removeClass('suey-selected');
            look.removeClass('suey-selected');
            move.removeClass('suey-selected');
            zoom.removeClass('suey-selected');
            switch (mouseMode) {
                case MOUSE_MODES.SELECT: select.addClass('suey-selected'); break;
                case MOUSE_MODES.LOOK: look.addClass('suey-selected'); break;
                case MOUSE_MODES.MOVE: move.addClass('suey-selected'); break;
                case MOUSE_MODES.ZOOM: zoom.addClass('suey-selected'); break;
            }
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

        reset.onPress(() => view3d.cameraReset());
        focus.onPress(() => view3d.cameraFocus());

        let _lastTooltip = '';

        Signals.connect(view3d, 'selectionChanged', function() {
            if (view3d.isHidden()) return;

            // Focus on Scene or Selection?
            let sceneFocus = false;
            sceneFocus ||= (view3d.selected.length === 0);
            sceneFocus ||= (view3d.selected.length === 1);

            // OPTION: Disable Button
            focus.setDisabled(view3d.selected.length === 0);

            // // OPTION: Scene Icon
            // focusScene.setStyle('display', (sceneFocus) ? '' : 'none');
            // focusEye.setStyle('display', (sceneFocus) ? 'none' : '');
            // focusPupil.setStyle('display', (sceneFocus) ? 'none' : '');

            // OPTION: Tooltip
            const focusOn = (view3d.selected.length > 1)? 'Entities' : ((sceneFocus) ? 'Scene' : 'Entity');
            if (_lastTooltip !== focusOn) {
                focus.setAttribute('tooltip', Config.tooltip(`Focus On ${focusOn}`, Config.getKey('shortcuts/focus')));
            }
            _lastTooltip = focusOn;
        });

        /******************** TRANSFORM TOOLS */

        const noneIcon = new SUEY.VectorBox(`${FOLDER_TOOLBAR}tool-none.svg`).setID('tb-tool-none');
        const translateIcon = new SUEY.VectorBox(`${FOLDER_TOOLBAR}tool-translate.svg`).setID('tb-tool-translate');
        const rotateIcon = new SUEY.VectorBox(`${FOLDER_TOOLBAR}tool-rotate.svg`).setID('tb-tool-rotate');
        const scaleIcon = new SUEY.VectorBox(`${FOLDER_TOOLBAR}tool-scale.svg`).setID('tb-tool-scale');
        const rectLeftTop = new SUEY.VectorBox(`${FOLDER_TOOLBAR}tool-rect-left-top.svg`).setID('tb-tool-rect-left-top');
        const rectLeftBot = new SUEY.VectorBox(`${FOLDER_TOOLBAR}tool-rect-left-bot.svg`).setID('tb-tool-rect-left-bot');
        const rectRightTop = new SUEY.VectorBox(`${FOLDER_TOOLBAR}tool-rect-right-top.svg`).setID('tb-tool-rect-right-top');
        const rectRightBot = new SUEY.VectorBox(`${FOLDER_TOOLBAR}tool-rect-right-bot.svg`).setID('tb-tool-rect-right-bot');
        const snapMagnet = new SUEY.VectorBox(`${FOLDER_TOOLBAR}snap-magnet.svg`).setID('tb-snap-magnet');
        const snapAttract = new SUEY.VectorBox(`${FOLDER_TOOLBAR}snap-attract.svg`).setID('tb-snap-attract');
        const paintBrush = new SUEY.VectorBox(`${FOLDER_TOOLBAR}paint-brush.svg`).setID('tb-paint-brush');

        none.add(noneIcon);
        translate.add(translateIcon);
        rotate.add(rotateIcon);
        scale.add(scaleIcon);
        rect.add(rectLeftBot, rectRightBot, rectLeftTop, rectRightTop);
        snap.add(snapMagnet, snapAttract);
        paint.add(paintBrush);

        none.onPress(() => Signals.dispatch('transformModeChanged', 'none'));
        translate.onPress(() => Signals.dispatch('transformModeChanged', 'translate'));
        rotate.onPress(() => Signals.dispatch('transformModeChanged', 'rotate'));
        scale.onPress(() => Signals.dispatch('transformModeChanged', 'scale'));
        rect.onPress(() => Signals.dispatch('transformModeChanged', 'rect'));
        snap.onPress(() => Signals.dispatch('transformModeChanged', 'snap'));
        paint.onPress(() => Signals.dispatch('transformModeChanged', 'paint'));

        Signals.connect(view3d, 'transformModeChanged', function(mode) {
            none.removeClass('suey-selected');
            translate.removeClass('suey-selected');
            rotate.removeClass('suey-selected');
            scale.removeClass('suey-selected');
            rect.removeClass('suey-selected');
            snap.removeClass('suey-selected');
            paint.removeClass('suey-selected');
            switch (mode) {
                case 'none': none.addClass('suey-selected'); break;
                case 'translate': translate.addClass('suey-selected'); break;
                case 'rotate': rotate.addClass('suey-selected'); break;
                case 'scale': scale.addClass('suey-selected'); break;
                case 'rect': rect.addClass('suey-selected'); break;
                case 'snap': snap.addClass('suey-selected'); break;
                case 'paint': paint.addClass('suey-selected'); break;
            }
        });

        /******************** VIEWS */

        const toggleBack1 = new SUEY.VectorBox(`${FOLDER_TOOLBAR}toggle-background-1.svg`).setID('tb-toggle-back-1');
        const toggleBack2 = new SUEY.VectorBox(`${FOLDER_TOOLBAR}toggle-background-2.svg`).setID('tb-toggle-back-2');
        const toggleButton1 = new SUEY.VectorBox(`${FOLDER_TOOLBAR}toggle-button-1.svg`).setID('tb-toggle-button-1');
        const toggleButton2 = new SUEY.VectorBox(`${FOLDER_TOOLBAR}toggle-button-2.svg`).setID('tb-toggle-button-2');
        views.add(toggleBack1, toggleBack2, toggleButton1, toggleButton2);

        // Toggle Menu
        const toggleMenu = new SUEY.Menu();
        toggleMenu.addClass('salt-toggle-menu');
        toggleMenu.addClass('suey-menu-under');
        toggleMenu.addClass('salt-button-menu');
        // Boundary Toggle
        const boundaryIcon = `${FOLDER_MENU}toggle/boundary.svg`;
        const boundaryItem = new ToggleButton(boundaryIcon, 'Scene Bounds', 'viewport/render/bounds', () => {
            const bounds = Config.getKey('viewport/render/bounds');
            // SceneUtils.toggleBoundaryObjects(bounds, view3d.world.activeStage());
        });
        toggleMenu.add(boundaryItem);
        // Colliders Toggle
        const collidersIcon = `${FOLDER_MENU}toggle/colliders.svg`;
        const collidersItem = new ToggleButton(collidersIcon, 'Physics Colliders', 'viewport/render/colliders', () => {
            SceneUtils.toggleColliders();
        });
        toggleMenu.add(collidersItem);
        // Joints Toggle
        const jointsIcon = `${FOLDER_MENU}toggle/joints.svg`;
        const jointsItem = new ToggleButton(jointsIcon, 'Physics Joints', 'viewport/render/joints');
        toggleMenu.add(jointsItem);

        // Attach Menu
        const hoverMenu = new SUEY.Menu().addClass('suey-menu-show', 'suey-invisible-menu');
        const hoverItem = new SUEY.MenuItem().addClass('suey-invisible-menu-item');
        hoverItem.attachSubMenu(toggleMenu);
        hoverMenu.add(hoverItem);

        // Prepare Button
        views.on('pointerenter', () => document.dispatchEvent(new Event('closemenu')));
        views.addToSelf(hoverMenu);

        /******************** ADD TO TOOLBAR */

        const buttons = [];
        buttons.push(new SUEY.ToolbarSpacer(1.0));
        buttons.push(select, look, move, zoom, new SUEY.ToolbarSeparator(), focus, /* INCLUDE?: reset, */);
        buttons.push(new SUEY.FlexSpacer());
        buttons.push(none, translate, rotate, scale, rect, snap, paint);
        buttons.push(new SUEY.FlexSpacer());
        buttons.push(views);
        buttons.push(new SUEY.FlexSpacer());
        this.buttons = buttons;

    } // end ctor

}

export { View3DToolbar };

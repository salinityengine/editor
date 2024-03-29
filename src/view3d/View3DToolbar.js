import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { ColorizeFilter } from '../gui/ColorizeFilter.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';
// import { SceneUtils } from './SceneUtils.js';
import { ToggleButton } from '../gui/ToggleButton.js';

class View3DToolbar extends SUEY.Panel {

    constructor(view3d) {
        super({ style: SUEY.PANEL_STYLES.NONE });
        this.setClass('salt-toolbar');

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
        select.dom.setAttribute('tooltip', Config.tooltip('Select Mode', Config.getKey('shortcuts/select')));
        look.dom.setAttribute('tooltip', Config.tooltip('Look Mode', Config.getKey('shortcuts/look')));
        move.dom.setAttribute('tooltip', Config.tooltip('Move Mode', Config.getKey('shortcuts/move')));
        zoom.dom.setAttribute('tooltip', Config.tooltip('Zoom Mode', Config.getKey('shortcuts/zoom')));

        // Focus
        focus.dom.setAttribute('tooltip', Config.tooltip('Focus On Entity', Config.getKey('shortcuts/focus')));
        reset.dom.setAttribute('tooltip', Config.tooltip('Reset Camera', Config.getKey('shortcuts/camera/reset')));

        // Transform Tools
        none.dom.setAttribute('tooltip', Config.tooltip('No Tool', Config.getKey('shortcuts/none')));
        translate.dom.setAttribute('tooltip', Config.tooltip('Translate Tool', Config.getKey('shortcuts/translate')));
        rotate.dom.setAttribute('tooltip', Config.tooltip('Rotate Tool', Config.getKey('shortcuts/rotate')));
        scale.dom.setAttribute('tooltip', Config.tooltip('Scale Tool', Config.getKey('shortcuts/scale')));
        rect.dom.setAttribute('tooltip', Config.tooltip('Rect Tool', Config.getKey('shortcuts/rect')));
        snap.dom.setAttribute('tooltip', Config.tooltip('Snap Tool', Config.getKey('shortcuts/snap')));
        paint.dom.setAttribute('tooltip', Config.tooltip('Paint Tool', Config.getKey('shortcuts/paint')));

        // Views
        // views.dom.setAttribute('tooltip', 'Toggle Views');

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

        const selectIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-select.svg`).setID('tb-mode-select');
        const selectCursor = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-select-cursor.svg`).setID('tb-mode-select-cursor');
        const lookIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-look-eye.svg`).setID('tb-mode-look');
        const lookPupil = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-look-pupil.svg`).setID('tb-mode-look-pupil');
        const moveIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-move.svg`).setID('tb-mode-move');
        const moveGrab = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-move-grab.svg`).setID('tb-mode-move-grab');
        const zoomIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}mode-zoom.svg`).setID('tb-mode-zoom');

        select.add(selectIcon, selectCursor);
        look.add(lookIcon, lookPupil);
        move.add(moveIcon, moveGrab);
        zoom.add(zoomIcon);

        select.onClick(() => Signals.dispatch('mouseModeChanged', EDITOR.MOUSE_MODES.SELECT));
        look.onClick(() => Signals.dispatch('mouseModeChanged', EDITOR.MOUSE_MODES.LOOK));
        move.onClick(() => Signals.dispatch('mouseModeChanged', EDITOR.MOUSE_MODES.MOVE));
        zoom.onClick(() => Signals.dispatch('mouseModeChanged', EDITOR.MOUSE_MODES.ZOOM));

        Signals.connect(this, 'mouseModeChanged', function(mouseMode) {
            select.removeClass('suey-selected');
            look.removeClass('suey-selected');
            move.removeClass('suey-selected');
            zoom.removeClass('suey-selected');
            switch (mouseMode) {
                case EDITOR.MOUSE_MODES.SELECT: select.addClass('suey-selected'); break;
                case EDITOR.MOUSE_MODES.LOOK: look.addClass('suey-selected'); break;
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

            // OPTION: Disable Button
            focus.setDisabled(editor.selected.length === 0);

            // // OPTION: Scene Icon
            // focusScene.setStyle('display', (sceneFocus) ? '' : 'none');
            // focusEye.setStyle('display', (sceneFocus) ? 'none' : '');
            // focusPupil.setStyle('display', (sceneFocus) ? 'none' : '');

            // OPTION: Tooltip
            const focusOn = (editor.selected.length > 1)? 'Entities' : ((sceneFocus) ? 'Scene' : 'Entity');
            if (_lastTooltip !== focusOn) {
                focus.dom.setAttribute('tooltip', Config.tooltip(`Focus On ${focusOn}`, Config.getKey('shortcuts/focus')));
            }
            _lastTooltip = focusOn;
        });

        /******************** TRANSFORM TOOLS */

        const noneIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-none.svg`).setID('tb-tool-none');
        const translateIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-translate.svg`).setID('tb-tool-translate');
        const rotateIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-rotate.svg`).setID('tb-tool-rotate');
        const scaleIcon = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-scale.svg`).setID('tb-tool-scale');
        const rectLeftTop = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-rect-left-top.svg`).setID('tb-tool-rect-left-top');
        const rectLeftBot = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-rect-left-bot.svg`).setID('tb-tool-rect-left-bot');
        const rectRightTop = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-rect-right-top.svg`).setID('tb-tool-rect-right-top');
        const rectRightBot = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}tool-rect-right-bot.svg`).setID('tb-tool-rect-right-bot');
        const snapMagnet = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-magnet.svg`).setID('SnapMagnet');
        const snapAttract = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-attract.svg`).setID('tb-snap-attract');
        const paintBrush = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}paint-brush.svg`).setID('tb-paint-brush');

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

        const toggleBack1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-background-1.svg`).setID('tb-toggle-back-1');
        const toggleBack2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-background-2.svg`).setID('tb-toggle-back-2');
        const toggleButton1 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-button-1.svg`).setID('tb-toggle-button-1');
        const toggleButton2 = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}toggle-button-2.svg`).setID('tb-toggle-button-2');
        views.add(toggleBack1, toggleBack2, toggleButton1, toggleButton2);

        // Toggle Menu
        const toggleMenu = new SUEY.Menu();
        toggleMenu.addClass('salt-toggle-menu');
        toggleMenu.addClass('suey-menu-under');
        toggleMenu.addClass('salt-button-menu');
        // Boundary Toggle
        const boundaryIcon = `${EDITOR.FOLDER_MENU}toggle/boundary.svg`;
        const boundaryItem = new ToggleButton(boundaryIcon, 'Scene Bounds', 'scene/render/bounds', () => {
            const bounds = Config.getKey('scene/render/bounds');
            // SceneUtils.toggleBoundaryObjects(bounds, view3d.world.activeStage());
        });
        toggleMenu.add(boundaryItem);
        // Colliders Toggle
        const collidersIcon = `${EDITOR.FOLDER_MENU}toggle/colliders.svg`;
        const collidersItem = new ToggleButton(collidersIcon, 'Physics Colliders', 'scene/render/colliders', () => {
            SceneUtils.toggleColliders();
        });
        toggleMenu.add(collidersItem);
        // Joints Toggle
        const jointsIcon = `${EDITOR.FOLDER_MENU}toggle/joints.svg`;
        const jointsItem = new ToggleButton(jointsIcon, 'Physics Joints', 'scene/render/joints');
        toggleMenu.add(jointsItem);

        // Attach Menu
        const hoverMenu = new SUEY.Menu().addClass('suey-menu-show', 'suey-invisible-menu');
        const hoverItem = new SUEY.MenuItem().addClass('suey-invisible-menu-item');
        hoverItem.attachSubMenu(toggleMenu);
        hoverMenu.add(hoverItem);

        // Prepare Button
        views.setStyle('overflow', 'visible');
        views.setStyle('z-index', '1');
        views.on('pointerenter', () => { document.dispatchEvent(new Event('closemenu')); });
        views.addToSelf(hoverMenu);

        /******************** ADD TO TOOLBAR */

        this.add(new SUEY.ToolbarSpacer(editor.toolbarLeftLength));
        this.add(new SUEY.ToolbarSpacer(1.0));
        this.add(select, look, move, zoom, new SUEY.ToolbarSeparator(), focus, /* INCLUDE?: reset, */);
        this.add(new SUEY.FlexSpacer());
        this.add(none, translate, rotate, scale, rect, snap, paint);
        this.add(new SUEY.FlexSpacer());
        this.add(views);
        this.add(new SUEY.FlexSpacer());
        this.add(new SUEY.ToolbarSpacer(editor.toolbarRightLength));

    } // end ctor

}

export { View3DToolbar };

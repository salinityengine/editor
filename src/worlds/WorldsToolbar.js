import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { ColorizeFilter } from '../gui/ColorizeFilter.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

// import { AddWorldCommand } from '../commands/Commands.js';
// import { MultiCmdsCommand } from '../commands/Commands.js';
// import { SetStageCommand } from '../commands/Commands.js';

class WorldsToolbar extends SUEY.Panel {

    constructor(worldsGraph) {
        super({ style: SUEY.PANEL_STYLES.NSALT });
        this.setClass('salt-toolbar');

        // Clear Advisor on Leave
        Advice.clear(this);

        /******************** BUTTONS */

        // Nodes
        const add = new SUEY.ToolbarButton();

        // Focus
        const reset = new SUEY.ToolbarButton();

        // Grid
        const gridSnap = new SUEY.ToolbarButton();

        // Play
        const play = new SUEY.ToolbarButton().addClass('suey-red-button');

        // Settings
        const proj = new SUEY.ToolbarButton().addClass('suey-gray-button');
        const history = new SUEY.ToolbarButton().addClass('suey-gray-button');
        const settings = new SUEY.ToolbarButton().addClass('suey-gray-button');

        /******************** TOOLTIPS */

        // Nodes
        add.dom.setAttribute('tooltip', 'Add Node');

        // Focus
        reset.dom.setAttribute('tooltip', Config.tooltip('Reset View', Config.getKey('shortcuts/camera/reset')));

        // Grid
        gridSnap.dom.setAttribute('tooltip', Config.tooltip('Snap to Grid?', 'g'));

        // Play
        play.dom.setAttribute('tooltip', Config.tooltip('Play Game', Config.getKey('shortcuts/play')));

        // Settings
        proj.dom.setAttribute('tooltip', 'Project');
        history.dom.setAttribute('tooltip', 'History');
        settings.dom.setAttribute('tooltip', 'Settings');

        /******************** ADVISOR */

        // Nodes
        Advice.attach(add, 'toolbar/worlds/add');

        // Focus
        Advice.attach(reset, 'toolbar/worlds/reset');

        // Grid
        Advice.attach(gridSnap, 'toolbar/grid/snap');

        // Play
        Advice.attach(play, 'toolbar/play');

        // Settings
        Advice.attach(proj, 'toolbar/project');
        Advice.attach(history, 'toolbar/history');
        Advice.attach(settings, 'toolbar/settings');

        /******************** NODES */

        const nodePlusSign = new SUEY.VectorBox(`${EDITOR.FOLDER_MENU}add.svg`).setId('tb-node-plus-sign');
        nodePlusSign.img.addClass('suey-complement-colorize')
        add.add(nodePlusSign);

        const nodeMenu = new SUEY.Menu();
        add.attachMenu(nodeMenu);

        const addWorld2D = new SUEY.MenuItem('World 2D', `${EDITOR.FOLDER_MENU}node/world2d.svg`);
        const addWorld3D = new SUEY.MenuItem('World 3D', `${EDITOR.FOLDER_MENU}node/world3d.svg`);
        const addUI = new SUEY.MenuItem('UI Screen', `${EDITOR.FOLDER_MENU}node/ui.svg`);
        nodeMenu.add(addWorld2D);
        // nodeMenu.add(addWorld3D);
        nodeMenu.add(addUI);

        addWorld2D.divIcon.addClass('suey-black-or-white').addClass('suey-drop-shadow');
        addWorld3D.divIcon.addClass('suey-black-or-white').addClass('suey-drop-shadow');
        addUI.divIcon.addClass('suey-black-or-white').addClass('suey-drop-shadow');

        function centerWorldPosition(world) {
            const bounds = worldsGraph.nodeBounds(0, worldsGraph.nodes.children);
            world.xPos = bounds.center().x - (200 / 2) + SUEY.GRID_SIZE;
            world.yPos = bounds.center().y - (150 / 2) + SUEY.GRID_SIZE;
        }

        addWorld2D.onSelect(() => {
            const world = new SALT.World2D(`World ${editor.project.worldCount() + 1}`);
            const stage = new SALT.Stage2D('Start');
            world.addEntity(stage);
            centerWorldPosition(world);

            const cmds = [];
            cmds.push(new AddWorldCommand(world));
            cmds.push(new SetStageCommand(stage, world));
            editor.execute(new MultiCmdsCommand(cmds, 'Add World'));
        });

        addWorld3D.onSelect(() => {

        });

        addUI.onSelect(() => {

        });

        /******************** FOCUS */

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

        reset.onClick(() => {
            worldsGraph.centerView(true /* resetZoom */, true /* animate */);
        });

        /******************** GRID */

        const snapMagnet = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-magnet.svg`).setId('SnapMagnet');
        const snapAttract = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-attract.svg`).setId('tb-snap-attract');
        gridSnap.add(snapMagnet, snapAttract);

        gridSnap.onClick(() => {
            const snapping = !Config.getKey('scene/grid/snap');
            Config.setKey('scene/grid/snap', snapping);
            worldsGraph.snapToGrid = snapping;
            Signals.dispatch('gridChanged');
        });

        Signals.connect(this, 'gridChanged', function() {
            const snapping = Config.getKey('scene/grid/snap');
            if (snapping) gridSnap.addClass('suey-selected');
            else gridSnap.removeClass('suey-selected');
        })

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

        Signals.connect(this, 'inspectorChanged', function() {
            proj.removeClass('suey-selected');
            history.removeClass('suey-selected');
            settings.removeClass('suey-selected');
            if (editor.inspector) {
                const item = editor.inspector.currentItem();
                if (item === 'project') proj.addClass('suey-selected');
                if (item === 'history') history.addClass('suey-selected');
                if (item === 'settings') settings.addClass('suey-selected');
            }
        });

        /******************** ADD TO TOOLBAR */

        // const left = new SUEY.FlexBox().setStyle('flex', '1 1 auto', 'pointerEvents', 'none').setWidth('50%');
        // const middle = new SUEY.FlexBox().setStyle('flex', '0 1 auto', 'pointerEvents', 'none');
        // const right = new SUEY.FlexBox().setStyle('flex', '1 1 auto', 'pointerEvents', 'none').setWidth('50%');
        // this.add(left, middle, right);

        this.add(new SUEY.ToolbarSpacer(editor.toolbarLength));
        this.add(new SUEY.FlexSpacer());
        this.add(add);
        this.add(new SUEY.FlexSpacer());
        this.add(reset);
        this.add(new SUEY.FlexSpacer());
        this.add(gridSnap);
        this.add(new SUEY.FlexSpacer());
        this.add(play, new SUEY.ToolbarSpacer(0.5), proj, history, settings);

    } // end ctor

}

export { WorldsToolbar };

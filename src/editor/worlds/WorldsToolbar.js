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
        this.setClass('one-toolbar');

        // Clear Advisor on Leave
        Advice.clear(this);

        /******************** BUTTONS */

        const add = new SUEY.ToolbarButton();

        const snap = new SUEY.ToolbarButton();
        const reset = new SUEY.ToolbarButton();

        const proj = new SUEY.ToolbarButton();
        const history = new SUEY.ToolbarButton();
        const settings = new SUEY.ToolbarButton();

        /******************** TOOLTIPS */

        add.dom.setAttribute('tooltip', 'Add Node');

        snap.dom.setAttribute('tooltip', Config.tooltip('Snap to Grid', 'g'));
        reset.dom.setAttribute('tooltip', Config.tooltip('Reset View', Config.getKey('shortcuts/camera/reset')));

        proj.dom.setAttribute('tooltip', 'Project');
        history.dom.setAttribute('tooltip', 'History');
        settings.dom.setAttribute('tooltip', 'Settings');

        /******************** ADVISOR */

        Advice.attach(add, 'toolbar/worlds/add');
        Advice.attach(snap, 'toolbar/worlds/snap');
        Advice.attach(reset, 'toolbar/worlds/reset');

        Advice.attach(proj, 'toolbar/project');
        Advice.attach(history, 'toolbar/history');
        Advice.attach(settings, 'toolbar/settings');

        /******************** ADD NODE */

        const nodePlusSign = new SUEY.VectorBox(`${EDITOR.FOLDER_MENU}add.svg`).setId('tb-node-plus-sign');
        add.add(nodePlusSign);

        const nodeMenu = new SUEY.Menu();
        add.attachMenu(nodeMenu);

        const addWorld2D = new SUEY.MenuItem('World 2D', `${EDITOR.FOLDER_MENU}node/world2d.svg`);
        const addWorld3D = new SUEY.MenuItem('World 3D', `${EDITOR.FOLDER_MENU}node/world3d.svg`);
        const addUI = new SUEY.MenuItem('UI Screen', `${EDITOR.FOLDER_MENU}node/ui.svg`);
        // nodeMenu.add(addWorld2D);
        nodeMenu.add(addWorld3D);
        nodeMenu.add(addUI);

        addWorld2D.divIcon.addClass('osui-black-or-white').addClass('osui-drop-shadow');
        addWorld3D.divIcon.addClass('osui-black-or-white').addClass('osui-drop-shadow');
        addUI.divIcon.addClass('osui-black-or-white').addClass('osui-drop-shadow');

        function centerWorldPosition(world) {
            const bounds = worldsGraph.nodeBounds(0, worldsGraph.nodes.children);
            world.xPos = bounds.center().x - (200 / 2) + SUEY.GRID_SIZE;
            world.yPos = bounds.center().y - (150 / 2) + SUEY.GRID_SIZE;
        }

        addWorld2D.onSelect(() => {

        });

        addWorld3D.onSelect(() => {
            const world = new SALT.World3D(`World ${editor.project.worldCount() + 1}`);
            const stage = new SALT.Stage3D('Start');
            world.addEntity(stage);
            centerWorldPosition(world);

            const cmds = [];
            cmds.push(new AddWorldCommand(world));
            cmds.push(new SetStageCommand(stage, world));
            editor.execute(new MultiCmdsCommand(cmds, 'Add World'));
        });

        addUI.onSelect(() => {

        });

        /******************** GRID */

        const snapMagnet = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-magnet.svg`).setId('SnapMagnet');
        const snapAttract = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-attract.svg`).setId('tb-snap-attract');
        snap.add(snapMagnet, snapAttract);

        snap.onClick(() => {
            const snapping = !Config.getKey('graph/grid/snap');
            Config.setKey('graph/grid/snap', snapping);
            worldsGraph.snapToGrid = snapping;
            Signals.dispatch('gridChanged');
        });

        Signals.connect(this, 'gridChanged', function() {
            const snapping = Config.getKey('graph/grid/snap');
            if (snapping) snap.addClass('osui-selected');
            else snap.removeClass('osui-selected');
        })

        /******************** CAMERA */

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

        /******************** SETTINGS */

        // const graphNodes = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}graph-nodes.svg`).setId('tb-graph-nodes');
        // const graphLines = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}graph-lines.svg`).setId('tb-graph-lines');
        // graph.add(graphLines, graphNodes);
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
            if (editor.inspector) {
                const item = editor.inspector.currentItem();
                if (item === 'project') proj.addClass('osui-selected');
                if (item === 'history') history.addClass('osui-selected');
                if (item === 'settings') settings.addClass('osui-selected');
            }
        });

        /******************** ADD TO TOOLBAR */

        const left = new SUEY.FlexBox().setStyle('flex', '1 1 auto').setWidth('50%');
        left.add(new SUEY.ToolbarSpacer(editor.toolbarLength));
        left.add(new SUEY.FlexSpacer());
        left.add(add);
        left.add(new SUEY.FlexSpacer());

        const middle = new SUEY.FlexBox().setStyle('flex', '0 1 auto');
        middle.add(snap, reset);

        const right = new SUEY.FlexBox().setStyle('flex', '1 1 auto').setWidth('50%');
        right.add(new SUEY.FlexSpacer());
        right.add(proj, history, settings);

        left.setStyle('pointerEvents', 'none');
        middle.setStyle('pointerEvents', 'none');
        right.setStyle('pointerEvents', 'none');

        this.add(left, middle, right);

    } // end ctor

}

export { WorldsToolbar };

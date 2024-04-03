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
        super({ style: SUEY.PANEL_STYLES.NONE });
        this.setClass('salt-toolbar');

        /******************** BUTTONS */

        // Nodes
        const add = new SUEY.ToolbarButton();

        // Focus
        const reset = new SUEY.ToolbarButton();

        // Grid
        const gridSnap = new SUEY.ToolbarButton();

        /******************** TOOLTIPS */

        // Nodes
        add.setAttribute('tooltip', 'Add Node');

        // Focus
        reset.setAttribute('tooltip', Config.tooltip('Reset View', Config.getKey('shortcuts/camera/reset')));

        // Grid
        gridSnap.setAttribute('tooltip', Config.tooltip('Snap to Grid?', 'g'));

        /******************** ADVISOR */

        // Nodes
        Advice.attach(add, 'toolbar/worlds/add');

        // Focus
        Advice.attach(reset, 'toolbar/worlds/reset');

        // Grid
        Advice.attach(gridSnap, 'toolbar/grid/snap');

        /******************** NODES */

        const nodePlusSign = new SUEY.VectorBox(`${EDITOR.FOLDER_MENU}add.svg`).setID('tb-node-plus-sign');
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

        reset.onClick(() => {
            worldsGraph.centerView(true /* resetZoom */, true /* animate */);
        });

        /******************** GRID */

        const snapMagnet = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-magnet.svg`).setID('SnapMagnet');
        const snapAttract = new SUEY.VectorBox(`${EDITOR.FOLDER_TOOLBAR}snap-attract.svg`).setID('tb-snap-attract');
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

        /******************** ADD TO TOOLBAR */

        this.add(new SUEY.ToolbarSpacer(editor.toolbarLeftLength));
        this.add(new SUEY.FlexSpacer());
        this.add(add);
        this.add(new SUEY.FlexSpacer());
        this.add(reset);
        this.add(new SUEY.FlexSpacer());
        this.add(gridSnap);
        this.add(new SUEY.FlexSpacer());
        this.add(new SUEY.ToolbarSpacer(editor.toolbarRightLength));

    } // end ctor

}

export { WorldsToolbar };

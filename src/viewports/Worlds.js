import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { editor } from 'editor';

import { AbstractView } from './AbstractView.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';
import { WorldsToolbar } from '../toolbars/WorldsToolbar.js';

// import { AddWorldCommand } from '../commands/Commands.js';
// import { MultiCmdsCommand } from '../commands/Commands.js';
// import { PositionWorldCommand } from '../commands/Commands.js';
// import { RemoveWorldCommand } from '../commands/Commands.js';
import { SelectCommand } from '../commands/Commands.js';
// import { SetStageCommand } from '../commands/Commands.js';
// import { EntityUtils } from '../../../engine/src/utils/three/EntityUtils.js';

class Worlds extends AbstractView {

    floaterFamily() {
        const floaters = [
            // 'inspector',
        ];
        return [ ...super.floaterFamily(), ...floaters ];
    }

    viewportType() {
        return EDITOR.MODES.WORLD_GRAPH;
    }

    constructor() {
        super();
        const self = this;

        // Toolbar
        this.toolbar = new WorldsToolbar(this);

        /********** GRAPH */

        const graph = new SUEY.Graph({
            snapToGrid: Config.getKey('scene/grid/snap'),
            curveType: Config.getKey('world/curve')
        }).addClass('salt-world-graph');
        this.graph = graph;
        this.add(graph);

        /********** NODES */

        function createWorldNode(world) {
            let color = '#ffffff';
            if (world.isWorld2D) color = '#ff2080'; // red
            if (world.isWorld3D) color = '#50cc50'; // green
            if (world.isWorldUI) color = '#2080ff'; // blue
            if (world.isFuture) color = '#ee20ff';  // purple

            const node = new SUEY.Node({
                x: world.xPos,
                y: world.yPos,
                color,
                resizers: [],
            });
            node.world = world;

            if (world.isWorld2D) {
                node.createHeader('World 2D', `${EDITOR.FOLDER_MENU}node/world2d.svg`);
                node.addItem(new SUEY.NodeItem({ type: SUEY.NODE_TYPES.INPUT, title: 'On Load' }));
                node.addItem(new SUEY.NodeItem({ type: SUEY.NODE_TYPES.OUTPUT, title: 'Load UI' }));
            } else if (world.isWorld3D) {
                node.createHeader(world.name, `${EDITOR.FOLDER_MENU}node/world3d.svg`);
                node.addItem(new SUEY.NodeItem({ type: SUEY.NODE_TYPES.INPUT, title: 'On Load' }));
                node.addItem(new SUEY.NodeItem({ type: SUEY.NODE_TYPES.OUTPUT, title: 'Load UI' }));
            } else if (world.isWorldUI) {
                node.createHeader('UI Screen', `${EDITOR.FOLDER_MENU}node/ui.svg`);
                node.addItem(new SUEY.NodeItem({ type: SUEY.NODE_TYPES.INPUT, title: 'On Load' }));
            }

            // NOTE: To have more than one line, use 'quantity' option:
            // node.addItem(new SUEY.NodeItem({ type: SUEY.NODE_TYPES.OUTPUT, title: 'Three', quantity: 3 }));

            // Drag Event
            function nodeDrag() {
                const cmds = [];
                node.graph.getNodes().forEach((node) => {
                    if (!node.hasClass('suey-node-selected')) return;
                    if (!node.world || !node.world.isWorld) return;
                    const x = node.left;
                    const y = node.top;
                    if (node.world.xPos !== x || node.world.yPos !== y) {
                        cmds.push(new PositionWorldCommand(node.world, x, y));
                    }
                });
                if (cmds.length > 0) {
                    editor.execute(new MultiCmdsCommand(cmds, 'Change World Position' + (cmds.length > 1 ? 's' : '')));
                }
            }
            node.on('dragged', nodeDrag);

            return node;
        }

        function refreshNodes() {
            const worldUUIDs = Object.keys(editor.project.worlds);

            // Update / Remove Nodes
            const graphNodes = graph.getNodes();
            for (let i = graphNodes.length - 1; i >= 0; i--) {
                const node = graphNodes[i];
                if (!node.world || !node.world.isWorld) continue;
                const index = worldUUIDs.indexOf(node.world.uuid);
                // Update Node
                if (index !== -1) {
                    // Remove world from list of worlds to be added
                    worldUUIDs.splice(index, 1);
                    // Update Location
                    updateNode(node);
                // Remove Node
                } else {
                    graph.removeNode(node);
                }
            }

            // Add Nodes
            for (const uuid of worldUUIDs) {
                const world = editor.project.getWorldByUUID(uuid);
                if (!world || !world.isWorld) continue;
                const node = createWorldNode(world);
                graph.addNode(node);
            }
        }

        function updateNode(node) {
            // Update Location
            node.setStyle(
                'left', `${parseFloat(node.world.xPos)}px`,
                'top', `${parseFloat(node.world.yPos)}px`,
            );
        }

        /********** EVENTS */

        // Displayed
        this.on('displayed', () => {
            graph.centerView(true /* resetZoom */, false /* animate */);
        }, true /* once? */);

        // Selected
        graph.on('selected', () => {
            // World(s) were selected
            const selected = graph.selectedWorlds();
            for (let i = selected.length - 1; i >= 0; i--) {
                const world = selected[i];
                if (world && world.isWorld) {
                    const cmds = [];
                    cmds.push(new SelectCommand([], editor.selected));
                    cmds.push(new SetStageCommand(world.activeStage(), world));
                    cmds.push(new SelectCommand(selected, []));
                    editor.execute(new MultiCmdsCommand(cmds, `Select World: ${world.name}`));
                    return;
                }
            }

            // Did not select World(s)
            editor.execute(new SelectCommand(selected, [ ...editor.selected ]));
        });

        // Zoom
        graph.on('wheel', (event) => {
            event.preventDefault();
            editor.showInfo(`${parseInt(graph.getScale() * 100)}%`);
        });

        /********** SIGNALS */

        // Camera Reset
        Signals.connect(this, 'cameraReset', function() {
            if (self.isHidden()) return;
            graph.centerView(true /* resetZoom */, true /* animate */);
        });

        // Grid Changed
        Signals.connect(this, 'gridChanged', function() {
            graph.snapToGrid = Config.getKey('scene/grid/snap');
            if (self.isHidden()) return;
            // Update while dragging
            const active = document.activeElement;
            if (active && active.classList.contains('suey-node-selected')) {
                const event = new PointerEvent('pointermove', { bubbles: true });
                active.dispatchEvent(event);
            }
            // Grid / Curves
            graph.curveType = Config.getKey('world/curve');
            graph.drawLines();
            graph.changeGridType(Config.getKey('world/grid/style'));
        });

        // Project Loaded
        Signals.connect(this, 'projectLoaded', function() {
            refreshNodes();
            graph.centerView(true /* resetZoom */, false /* animate */);
        });

        // Refresh Settings
        Signals.connect(this, 'settingsRefreshed', function() {
            graph.curveType = Config.getKey('world/curve');
            graph.changeGridType(Config.getKey('world/grid/style'));
        });

        Signals.connect(this, 'fontSizeChanged', function() {
            setTimeout(() => graph.drawLines(), 0);
        });

        // Scene Graph Changed
        Signals.connect(this, 'sceneGraphChanged', refreshNodes);

        // Selection Changed
        Signals.connect(this, 'selectionChanged', function() {
            refreshNodes();

            const viewWorld = editor.world;
            for (const node of graph.getNodes()) {
                if (!node.world || !node.world.isWorld) continue;
                const selected = EntityUtils.containsEntity(editor.selected, node.world);
                if (selected) {
                    if (!node.hasClass('suey-node-selected')) {
                        const nodes = graph.getNodes();
                        if (node.zIndex !== nodes.length) {
                            nodes.forEach(node => node.setStyle('zIndex', `${node.zIndex - 1}`));
                            node.setStyle('zIndex', nodes.length);
                        }
                        node.addClass('suey-node-selected');
                    }
                } else {
                    node.removeClass('suey-node-selected');
                }
                if (viewWorld && viewWorld.isWorld && viewWorld.uuid === node.world.uuid) {
                    node.addClass('suey-node-displayed');
                } else {
                    node.removeClass('suey-node-displayed');
                }
            }
        });

        // Entity Changed
        Signals.connect(this, 'entityChanged', function(entity) {
            if (!entity || !entity.isWorld) return;

            // Update Node reponsible for World
            for (const node of graph.getNodes()) {
                if (node.world && node.world.isWorld && node.world.uuid === entity.uuid) {
                    updateNode(node);
                }
            }
        });

    } // end ctor

    /******************** NODES ********************/

    allWorlds() {
        const worlds = [];
        for (const node of this.graph.getNodes()) {
            if (node.world && node.world.isWorld) worlds.push(node.world);
        }
        return worlds;
    }

    selectedNodes() {
        const selected = [];
        for (const node of this.graph.getNodes()) {
            if (node.hasClass('suey-node-selected')) selected.push(node);
        }
        return selected;
    }

    selectedWorlds() {
        const worlds = [];
        for (const node of this.graph.selectedNodes()) {
            if (node.world && node.world.isWorld) worlds.push(node.world);
        }
        return worlds;
    }

    /******************** CLIPBOARD / EDIT ********************/

    cut() {
        this.delete('Cut' /* commandName */);
    }

    paste() {
        this.duplicate(null, editor.clipboard.items, 'Paste' /* commandName */);
    }

    duplicate(key, worlds, commandName = 'Duplicate') {
        worlds = worlds ?? this.selectedWorlds();
        if (worlds.length === 0) return;

        // Calculate Selected Nodes Size
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        const graphNodes = this.selectedNodes();
        graphNodes.forEach((node) => {
            const world = node.world;
            if (!world || !world.isWorld) return;
            minX = Math.min(minX, world.xPos); maxX = Math.max(maxX, world.xPos + node.width);
            minY = Math.min(minY, world.yPos); maxY = Math.max(maxY, world.yPos + node.height);
        });
        const nodesWidth = Math.max(0, maxX - minX);
        const nodesHeight = Math.max(0, maxY - minY);

        // Clone Worlds
        const clones = [];
        for (const entity of worlds) {
            if (!entity.isEntity) continue;
            if (!entity.visible) continue;
            if (entity.locked) continue;
            if (entity.isWorld) {
                const world = entity.cloneEntity();
                if (!world.name.startsWith('Copy of')) world.name = 'Copy of ' + world.name;
                switch (key) {
                    case 'w': world.yPos -= nodesHeight; break;
                    case 'a': world.xPos -= nodesWidth; break;
                    case 's': world.yPos += nodesHeight; break;
                    case 'd': world.xPos += nodesWidth; break;
                }
                clones.push(world);
            }
        }
        if (clones.length === 0) return;

        // Add Clones
        const cmds = [];
        cmds.push(new SelectCommand([], editor.selected));
        clones.forEach((world) => { cmds.push(new AddWorldCommand(world)); });
        cmds.push(new SetStageCommand(clones[0].activeStage(), clones[0]));
        cmds.push(new SelectCommand(clones, []));
        editor.execute(new MultiCmdsCommand(cmds, `${commandName} World`));
    }

    delete(commandName = 'Delete') {
        const worlds = this.selectedWorlds();
        if (worlds.length === 0) return;

        // Remove Worlds
        const cmds = [];
        cmds.push(new SelectCommand([], editor.selected));
        cmds.push(new SetStageCommand(null, null));
        worlds.forEach((world) => { cmds.push(new RemoveWorldCommand(world)); });
        editor.execute(new MultiCmdsCommand(cmds, `${commandName} World${worlds.length > 1 ? 's' : ''}`));
    }

    selectAll() {
        editor.execute(new SelectCommand(this.allWorlds(), editor.selected));
    }

    selectNone() {
        editor.execute(new SelectCommand([], this.selectedWorlds()));
    }

}

export { Worlds };

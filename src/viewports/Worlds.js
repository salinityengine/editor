import {
    EDITOR_MODES,
    FOLDER_MENU,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { AbstractView } from './AbstractView.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';
import { WorldsToolbar } from '../toolbars/WorldsToolbar.js';

import { AddEntityCommand } from '../commands/CommandList.js';
import { EditorModeCommand } from '../commands/CommandList.js';
import { MultiCmdsCommand } from '../commands/CommandList.js';
import { RemoveEntityCommand } from '../commands/CommandList.js';
import { SelectCommand } from '../commands/CommandList.js';
import { SetEntityValueCommand } from '../commands/CommandList.js';
import { SetStageCommand } from '../commands/CommandList.js';

class Worlds extends AbstractView {

    mode() { return EDITOR_MODES.WORLD_GRAPH; }

    floaterFamily() {
        const floaters = [
            // 'inspector',
        ];
        return [ ...super.floaterFamily(), ...floaters ];
    }

    constructor() {
        super();
        const self = this;

        /********** GRAPH */

        const graph = new SUEY.Graph({
            snapToGrid: Config.getKey('viewport/grid/snap'),
            curveType: Config.getKey('world/curve')
        }).addClass('salt-world-graph');
        this.graph = graph;
        this.add(graph);

        /********** TOOLBAR */

        this.toolbar = new WorldsToolbar(graph);

        /********** NODES */

        function createWorldNode(world) {
            let color = '#ffffff';
            if (world.isWorld2D) color = '#ff2080'; // red
            if (world.isWorld3D) color = '#50cc50'; // green
            if (world.isWorldUI) color = '#2080ff'; // blue
            if (world.isFuture) color = '#ee20ff';  // purple

            const node = new SUEY.Node({
                x: world.position.x,
                y: world.position.y,
                color,
                resizers: [],
            });
            node.world = world;

            if (world.isWorld2D) {
                node.createHeader(world.name, `${FOLDER_MENU}node/world2d.svg`);
                node.addItem(new SUEY.NodeItem({ type: SUEY.NODE_TYPES.INPUT, title: 'On Load' }));
                node.addItem(new SUEY.NodeItem({ type: SUEY.NODE_TYPES.OUTPUT, title: 'Load UI' }));
            } else if (world.isWorld3D) {
                node.createHeader(world.name, `${FOLDER_MENU}node/world3d.svg`);
                node.addItem(new SUEY.NodeItem({ type: SUEY.NODE_TYPES.INPUT, title: 'On Load' }));
                node.addItem(new SUEY.NodeItem({ type: SUEY.NODE_TYPES.OUTPUT, title: 'Load UI' }));
            } else if (world.isWorldUI) {
                node.createHeader(world.name, `${FOLDER_MENU}node/worldui.svg`);
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
                    if (node.world.position.x !== x || node.world.position.y !== y) {
                        cmds.push(new SetEntityValueCommand(node.world, 'position', [ x, y ]));
                    }
                });
                if (cmds.length > 0) {
                    editor.execute(new MultiCmdsCommand(cmds, 'Change World Position' + (cmds.length > 1 ? 's' : '')));
                }
            }
            node.on('dragged', nodeDrag);

            // Double Click (Focus)
            function nodeDoubleClick() {
                editor.execute(new EditorModeCommand(node.world.type));
            }
            node.on('dblclick', nodeDoubleClick);

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

        // Update Node Location
        function updateNode(node) {
            node.setStyle(
                'left', `${parseFloat(node.world.position.x)}px`,
                'top', `${parseFloat(node.world.position.y)}px`,
            );
        }

        /********** EVENTS */

        // Displayed
        let firstTime = true;
        this.on('displayed', () => {
            refreshNodes();
            if (firstTime) {
                graph.centerView(true /* resetZoom */, false /* animate */);
                firstTime = false;
            } else {
                graph.zoomTo();
            }
        });

        // Selected
        graph.on('selected', () => {
            // World(s) were selected
            const selected = self.selectedWorlds().toReversed();
            for (const world of selected) {
                if (!world || !world.isWorld) continue;
                const cmds = [];
                cmds.push(new SetStageCommand(world.type, world.activeStage(), world));
                cmds.push(new SelectCommand(selected, editor.selected));
                editor.execute(new MultiCmdsCommand(cmds, `Select World: ${world.name}`));
                return;
            }

            // Did not select World(s)
            editor.execute(new SelectCommand(selected, editor.selected));
        });

        // Zoom
        graph.on('wheel', (event) => {
            event.preventDefault();
            editor.showInfo(`${parseInt(graph.getScale() * 100)}%`);
        });

        /********** SIGNALS */

        // Grid Changed
        Signals.connect(this, 'gridChanged', () => {
            graph.snapToGrid = Config.getKey('viewport/grid/snap');
            if (!self.isActive) return;
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

        // Refresh Settings
        Signals.connect(this, 'settingsRefreshed', () => {
            graph.curveType = Config.getKey('world/curve');
            if (!self.isActive) return;
            graph.changeGridType(Config.getKey('world/grid/style'));
        });

        Signals.connect(this, 'fontSizeChanged', () => {
            if (!self.isActive) return;
            setTimeout(() => graph.drawLines(), 0);
        });

        // Scene Graph Changed
        Signals.connect(this, 'sceneGraphChanged', () => {
            if (!self.isActive) return;
            refreshNodes();
        });

        // Selection Changed
        Signals.connect(this, 'selectionChanged', () => {
            if (!self.isActive) return;

            // Refresh
            refreshNodes();

            // Find Viewport Worlds
            const viewWorlds = [];
            for (const viewport of editor.viewports) {
                const world = viewport.getWorld();
                if (world && world.isWorld) viewWorlds.push(world.uuid);
            }

            // Run through World Graph Nodes
            for (const node of graph.getNodes()) {
                if (!node.world || !node.world.isWorld) continue;

                // World is Selected
                const selected = SALT.Arrays.includesEntity(node.world, editor.selected);
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

                // World is Selected in a Viewport
                node.wantsClass('suey-node-displayed', viewWorlds.includes(node.world.uuid));
            }
        });

        // Entity Changed
        Signals.connect(this, 'entityChanged', (entity) => {
            if (!self.isActive) return;
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
        for (const node of this.selectedNodes()) {
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
            minX = Math.min(minX, world.position.x); maxX = Math.max(maxX, world.position.x + node.width);
            minY = Math.min(minY, world.position.y); maxY = Math.max(maxY, world.position.y + node.height);
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
                const world = entity.clone();
                if (!world.name.startsWith('Copy of')) world.name = 'Copy of ' + world.name;
                switch (key) {
                    case 'w': world.position.y -= nodesHeight; break;
                    case 'a': world.position.x -= nodesWidth; break;
                    case 's': world.position.y += nodesHeight; break;
                    case 'd': world.position.x += nodesWidth; break;
                }
                clones.push(world);
            }
        }
        if (clones.length === 0) return;

        // Add Clones
        const cmds = [];
        clones.forEach((world) => cmds.push(new AddEntityCommand(world)));
        cmds.push(new SetStageCommand(clones[0].type, clones[0].activeStage(), clones[0]));
        cmds.push(new SelectCommand(clones, editor.selected));
        editor.execute(new MultiCmdsCommand(cmds, `${commandName} World${clones.length > 1 ? 's' : ''}`));
    }

    delete(commandName = 'Delete') {
        const worlds = this.selectedWorlds();
        if (worlds.length === 0) return;

        // Types Included
        const worldTypes = [];
        worlds.forEach((world) => { if (worldTypes.includes(world.type) === false) worldTypes.push(world.type); });

        // Remove Worlds
        const cmds = [];
        cmds.push(new SelectCommand([], editor.selected));
        worldTypes.forEach((worldType) => cmds.push(new SetStageCommand(worldType, null, null)))
        worlds.forEach((world) => cmds.push(new RemoveEntityCommand(world)));
        editor.execute(new MultiCmdsCommand(cmds, `${commandName} World${worlds.length > 1 ? 's' : ''}`));
    }

    selectAll() {
        editor.execute(new SelectCommand(this.allWorlds(), editor.selected));
    }

    selectNone() {
        editor.execute(new SelectCommand([], this.selectedWorlds()));
    }

    /******************** VIEW ********************/

    cameraFocus() {
        this.graph.zoomTo();
    }

    cameraReset(animate = true) {
        this.graph.centerView(true /* resetZoom */, animate);
    }

}

export { Worlds };

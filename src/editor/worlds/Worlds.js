import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';
import { WorldsToolbar } from './WorldsToolbar.js';

// import { AddWorldCommand } from '../commands/Commands.js';
// import { MultiCmdsCommand } from '../commands/Commands.js';
// import { PositionWorldCommand } from '../commands/Commands.js';
// import { RemoveWorldCommand } from '../commands/Commands.js';
import { SelectCommand } from '../commands/Commands.js';
// import { SetStageCommand } from '../commands/Commands.js';
// import { EntityUtils } from '../../../engine/src/utils/three/EntityUtils.js';

class Worlds extends SUEY.Graph {

    constructor() {
        super({
            snapToGrid: Config.getKey('graph/grid/snap'),
            curveType: Config.getKey('graph/curve')
        });
        const self = this;
        this.setClass('Worlds');
        this.addClass('one-fullscreen');

        // Toolbar
        this.add(new WorldsToolbar(this));

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
                    if (!node.hasClass('osui-node-selected')) return;
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
            node.dom.addEventListener('dragged', nodeDrag);

            return node;
        }

        function refreshNodes() {
            const worldUUIDs = Object.keys(editor.project.worlds);

            // Update / Remove Nodes
            const graphNodes = self.getNodes();
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
                    self.removeNode(node);
                }
            }

            // Add Nodes
            for (let i = 0; i < worldUUIDs.length; i++) {
                const world = editor.project.getWorldByUUID(worldUUIDs[i]);
                if (!world || !world.isWorld) continue;
                const node = createWorldNode(world);
                self.addNode(node);
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
        this.dom.addEventListener('displayed', () => {
            self.centerView(true /* resetZoom */, false /* animate */);
        }, { once: true });

        // Selected
        this.dom.addEventListener('selected', () => {
            // World(s) were selected
            const selected = self.selectedWorlds();
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
            editor.execute(new SelectCommand(selected, [...editor.selected]));
        });

        // Zoom
        function onMouseZoom(event) {
            event.preventDefault();
            editor.showInfo(`${parseInt(self.getScale() * 100)}%`);
        }
        this.onWheel(onMouseZoom);

        /********** SIGNALS */

        // Camera Reset
        Signals.connect(this, 'cameraReset', function() {
            if (self.isHidden()) return;
            self.centerView(true /* resetZoom */, true /* animate */);
        });

        // Grid Changed
        Signals.connect(this, 'gridChanged', function() {
            self.snapToGrid = Config.getKey('graph/grid/snap');
            if (self.isHidden()) return;
            // Update while dragging
            const active = document.activeElement;
            if (active && active.classList.contains('osui-node-selected')) {
                const event = new PointerEvent('pointermove', { bubbles: true });
                active.dispatchEvent(event);
            }
        });

        // Project Loaded
        Signals.connect(this, 'projectLoaded', function() {
            refreshNodes();
            self.centerView(true /* resetZoom */, false /* animate */);
        });

        // Refresh Settings
        Signals.connect(this, 'settingsRefreshed', function() {
            self.curveType = Config.getKey('graph/curve');
            self.changeGridType(Config.getKey('graph/grid/style'));
        });

        Signals.connect(this, 'fontSizeChanged', function() {
            setTimeout(() => self.drawLines(), 0);
        });

        // Scene Graph Changed
        Signals.connect(this, 'sceneGraphChanged', refreshNodes);

        // Selection Changed
        Signals.connect(this, 'selectionChanged', function() {
            refreshNodes();

            const viewWorld = editor.view2d.world;
            for (const node of self.getNodes()) {
                if (!node.world || !node.world.isWorld) continue;
                const selected = EntityUtils.containsEntity(editor.selected, node.world);
                if (selected) {
                    if (!node.hasClass('osui-node-selected')) {
                        const nodes = self.getNodes();
                        if (node.zIndex !== nodes.length) {
                            nodes.forEach(node => node.setStyle('zIndex', `${node.zIndex - 1}`));
                            node.setStyle('zIndex', nodes.length);
                        }
                        node.addClass('osui-node-selected');
                    }
                } else {
                    node.removeClass('osui-node-selected');
                }
                if (viewWorld && viewWorld.isWorld && viewWorld.uuid === node.world.uuid) {
                    node.addClass('osui-node-displayed');
                } else {
                    node.removeClass('osui-node-displayed');
                }
            }
        });

        // Entity Changed
        Signals.connect(this, 'entityChanged', function(entity) {
            if (!entity || !entity.isWorld) return;

            // Update Node reponsible for World
            for (const node of self.getNodes()) {
                if (node.world && node.world.isWorld && node.world.uuid === entity.uuid) {
                    updateNode(node);
                }
            }
        });

    } // end ctor

    /******************** NODES ********************/

    allWorlds() {
        const worlds = [];
        for (const node of this.getNodes()) {
            if (node.world && node.world.isWorld) worlds.push(node.world);
        }
        return worlds;
    }

    selectedNodes() {
        const selected = [];
        for (const node of this.getNodes()) {
            if (node.hasClass('osui-node-selected')) selected.push(node);
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

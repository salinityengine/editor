import * as SUEY from 'gui';

import { Advisor } from '../floaters/Advisor.js';
import { Coder } from '../floaters/Coder.js';
import { Inspector } from '../floaters/Inspector.js';
import { Library } from '../floaters/Library.js';
import { Outliner } from '../floaters/Outliner.js';
import { Player } from '../floaters/Player.js';
import { Resources } from '../floaters/Resources.js';
import { Shaper } from '../floaters/Shaper.js';
import { Things } from '../floaters/Things.js';

class Layout {

    static save(docker) {
        if (!docker.isPrimary()) {
            console.warn('Layout.save: The provided Docker is not the Primary Docker');
            return;
        }

        const layout = {
            type: 'docker',
            children: [],
        };

        function traverse(currentDocker, parentLayout) {
            const reverseChildren = currentDocker.children.reverse();
            reverseChildren.forEach(child => {
                if (child.children.length === 0) return;

                if (child instanceof SUEY.Docker) {
                    const dockerLayout = {
                        type: 'docker',
                        side: child.dockSide,
                        size: (child.dockSide === 'left' || child.dockSide === 'right') ? child.dom.style.width : child.dom.style.height,
                        initialSide: child.initialSide,
                        children: [],
                    };
                    parentLayout.children.push(dockerLayout);
                    traverse(child, dockerLayout);

                } else if (child instanceof SUEY.Tabbed) {
                    const tabbedLayout = {
                        type: 'tabbed',
                        floaters: child.panels.children.map(floater => ({ id: floater.id })),
                    };
                    parentLayout.children.push(tabbedLayout);
                }

                console.log(child);
            });
        }
        traverse(docker, layout);

        // Save the Layout
        localStorage.removeItem('dockerLayout');
        localStorage.setItem('dockerLayout', JSON.stringify(layout));
    }

    static load(docker) {
        if (!docker.isPrimary()) {
            console.warn('Layout.load: The provided Docker is not the Primary Docker');
            return;
        }

        // Clear Docker
        docker.clearDocks();

        // Retrieve the layout from localStorage
        const layoutData = localStorage.getItem('dockerLayout');
        if (!layoutData) {
            console.warn('Layout.load: No layout data found');
            const dockLeft = docker.addDock(SUEY.DOCK_SIDES.LEFT, '20%');
            const dockRight = docker.addDock(SUEY.DOCK_SIDES.RIGHT, '20%');
            dockLeft.enableTabs().addTab(new Advisor());
            dockLeft.addDock(SUEY.DOCK_SIDES.BOTTOM, '20%').enableTabs().addTab(new Advisor());
            dockRight.enableTabs().addTab(new Library());
            return;
        }

        function createFloater(id) {
            // Implement this function based on how you create Floaters in your program
            // You can use the 'id' to determine the type of Floater to create
            // Return the created Floater or null if the Floater type is unknown
            // Example:
            switch (id) {
                case 'advisor': return new Advisor();
                case 'library': return new Library();
                default:
                    console.warn(`Layout.createFloater: Unknown Floater type: ${id}`);
                    return null;
            }
        }

        function createDocker(layoutNode, parentDocker) {

            layoutNode.children.forEach(childNode => {
                if (childNode.type === 'tabbed') {
                    const tabbed = parentDocker.enableTabs();
                    childNode.floaters.forEach(floaterData => {
                        const floater = createFloater(floaterData.id);
                        if (floater) tabbed.addTab(floater);
                    });

                } else if (childNode.type === 'docker') {
                    const dockInfo = layoutNode.children.find(child => child.initialSide !== 'center');

                    console.log(dockInfo);

                    if (dockInfo) {
                        const newDocker = parentDocker.addDock(dockInfo.side, layoutNode.size);

                        createDocker(childNode, newDocker);
                    }

                }
            });
        }

        // Build Docker
        const layout = JSON.parse(layoutData);
        createDocker(layout, docker);
    }

}

export { Layout };

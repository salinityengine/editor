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

    static default(docker, mode) {
        // Clear Docker
        docker.clearDocks();

        // Build Default Layout
        const dockLeft = docker.addDock(SUEY.DOCK_SIDES.LEFT, '20%');
        const dockRight = docker.addDock(SUEY.DOCK_SIDES.RIGHT, '20%');
        dockLeft.enableTabs().addTab(new Library());
        dockLeft.addDock(SUEY.DOCK_SIDES.BOTTOM, '20%').enableTabs().addTab(new Advisor());

        // dockRight.enableTabs().addTab(new Library());
    }

    static save(docker) {
        if (!docker.isPrimary()) {
            console.warn('Layout.save: The provided Docker is not the Primary Docker');
            return;
        }

        const layout = {
            type: 'docker',
            side: 'center',
            children: [],
        };

        function traverse(currentDocker, parentLayout) {
            const reverseChildren = currentDocker.children.reverse();
            reverseChildren.forEach(child => {

                if (child.hasClass('suey-docker')) {
                    const dockerLayout = {
                        type: 'docker',
                        initialSide: child.initialSide,
                        collapsed: child.hasClass('suey-collapsed'),
                        side: child.dockSide,
                        size: (child.dockSide === 'left' || child.dockSide === 'right') ? child.dom.style.width : child.dom.style.height,
                        children: [],
                    };
                    if (dockerLayout.collapsed) dockerLayout.size = child.expandSize;
                    parentLayout.children.push(dockerLayout);
                    traverse(child, dockerLayout);

                } else if (child.hasClass('suey-tabbed')) {
                    const spacers = SUEY.Dom.childrenWithClass(currentDocker, 'suey-flex-spacer', false /* recursive? */);
                    const tabbedLayout = {
                        type: 'tabbed',
                        selectedID: child.selectedID,
                        hasSpacer: (spacers.length > 0),
                        floaters: SUEY.Dom.childrenWithClass(child, 'suey-floater', true /* recursive? */).map(floater => floater.id),
                    };
                    parentLayout.children.push(tabbedLayout);

                } else if (child.hasClass('suey-window')) {
                    const windowLayout = {
                        type: 'window',
                        left: child.dom.style.left,
                        top: child.dom.style.top,
                        width: child.dom.style.width,
                        height: child.dom.style.height,
                        initialWidth: child.initialWidth,
                        initialHeight: child.initialHeight,
                        floaters: SUEY.Dom.childrenWithClass(child, 'suey-floater', true /* recursive? */).map(floater => floater.id),
                    };
                    parentLayout.children.push(windowLayout);
                }
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
            return undefined;
        }

        // Clear Docker
        docker.clearDocks();

        // Retrieve the layout from localStorage
        const layoutData = localStorage.getItem('dockerLayout');
        if (!layoutData) {
            console.warn('Layout.load: No layout data found');
            return undefined;
        }

        function createFloater(id) {
            switch (id) {
                case 'advisor': return new Advisor();
                case 'library': return new Library();
                default:
                    console.warn(`Layout.createFloater: Unknown Floater type: ${id}`);
                    return null;
            }
        }

        function createDocker(layoutNode, parentDocker) {
            let addedDock = false;
            let twinDocker = undefined;
            layoutNode.children.forEach(childNode => {

                if (childNode.type === 'docker') {
                    if (!addedDock) {
                        const newDocker = parentDocker.addDock(childNode.side, childNode.size);
                        if (childNode.collapsed) newDocker.collapseTabs();
                        twinDocker = newDocker.getTwin();
                        createDocker(childNode, newDocker);
                        addedDock = true;
                    } else if (twinDocker) {
                        createDocker(childNode, twinDocker.contents());
                    }

                } else if (childNode.type === 'tabbed') {
                    const tabbed = parentDocker.enableTabs(childNode.hasSpacer /* flexBefore? */);
                    childNode.floaters.forEach(floaterID => tabbed.addTab(createFloater(floaterID)));
                    tabbed.selectTab(childNode.selectedID);

                } else if (childNode.type === 'window') {
                    childNode.floaters.forEach(floaterID => {
                        const floater = createFloater(floaterID);
                        if (floater) {
                            const window = new SUEY.Window({
                                title: floaterID,
                                width: childNode.width,
                                height: childNode.height,
                                initialWidth: childNode.initialWidth,
                                initialHeight: childNode.initialHeight,
                                startCentered: false,
                                left: childNode.left,
                                top: childNode.top,
                            });
                            parentDocker.addToSelf(window);
                            window.display();
                            window.addTab(floater);
                            window.selectTab(floaterID);
                        }
                    });
                }
            });
        }

        // Build Docker
        const layout = JSON.parse(layoutData);
        createDocker(layout, docker);
    }

}

export { Layout };

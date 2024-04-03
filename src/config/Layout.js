import * as SUEY from 'gui';
import { Config } from './Config.js';

import { Advisor } from '../floaters/Advisor.js';
import { Codex } from '../floaters/Codex.js';
import { Historian } from '../floaters/Historian.js';
import { Inspector } from '../floaters/Inspector.js';
import { Library } from '../floaters/Library.js';
import { Outliner } from '../floaters/Outliner.js';
import { Player } from '../floaters/Player.js';
import { Projecter } from '../floaters/Projecter.js';
import { Resources } from '../floaters/Resources.js';
import { Scripter } from '../floaters/Scripter.js';
import { Settings } from '../floaters/Settings.js';
import { Shaper } from '../floaters/Shaper.js';

class Layout {

    static createFloater(id) {
        switch (id) {
            case 'advisor': return new Advisor();
            case 'codex': return new Codex();
            case 'history': return new Historian();
            case 'inspector': return new Inspector();
            case 'outliner': return new Outliner();
            case 'player': return new Player();
            case 'project': return new Projecter();
            case 'settings': return new Settings();
        }
        console.warn(`Layout.createFloater: Unknown Floater type: ${id}`);
        return null;
    }

    static default(docker, mode) {
        // Clear Docker
        docker.clearDocks();

        // Build Default Layout
        Layout.installFloater(docker, Layout.createFloater('outliner'));
        Layout.installFloater(docker, Layout.createFloater('codex'));
        Layout.installFloater(docker, Layout.createFloater('advisor'));
        Layout.installFloater(docker, Layout.createFloater('inspector'));
    }

    static installFloater(docker, floater) {
        const installInfo = Config.getKey(`floater/initial/${floater?.id}`) ?? { init: 'center', side: null, size: '20%' };
        const installInit = installInfo?.init ?? 'center';
        const installSide = installInfo?.side ?? installInit;
        const installSize = installInfo?.size ?? '20%';

        let dock = undefined;
        switch (installInit) {
            case 'left': case 'right': case 'top': case 'bottom':
                // Docker Traversal Function
                function findDocker(parentDocker, property, value, recursive = true) {
                    const queue = [ parentDocker ];
                    while (queue.length > 0) {
                        const currentElement = queue.shift();
                        for (const child of currentElement.children) {
                            if (child[property] === value) return child;
                            if (recursive) queue.push(child);
                        }
                    }
                    return null;
                }
                // Find / Create initial Docker and sub Docker
                let initialDocker = findDocker(docker, 'initialSide', installInit, true);
                initialDocker = initialDocker ?? docker.addDock(installInit, installSize);
                if (installInit === installSide) {
                    dock = initialDocker.enableTabs();
                } else {
                    let subDocker = findDocker(initialDocker, 'dockSide', installSide, true);
                    subDocker = subDocker ?? initialDocker.addDock(installSide, installSize);
                    dock = subDocker.enableTabs();
                }
                break;
            case 'center':
            default:
                // Create New Window
                dock = new SUEY.Window({ title: floater.id, width: '50%', height: '70%' });
                docker.addToSelf(dock);
                dock.display();
        }
        dock.addTab(floater);
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
                        active: child.hasClass('suey-active-window'),
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

        function createDocker(layoutNode, parentDocker) {
            let activeWindow = undefined;
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
                    childNode.floaters.forEach(floaterID => tabbed.addTab(Layout.createFloater(floaterID)));
                    tabbed.selectTab(childNode.selectedID);

                } else if (childNode.type === 'window') {
                    childNode.floaters.forEach(floaterID => {
                        const floater = Layout.createFloater(floaterID);
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
                            if (childNode.active) activeWindow = window;
                        }
                    });
                }
            });
            if (activeWindow) activeWindow.focus();
        }

        // Build Docker
        const layout = JSON.parse(layoutData);
        createDocker(layout, docker);
    }

}

export { Layout };

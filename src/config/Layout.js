import editor from 'editor';
import * as SUEY from 'gui';
import { Config } from './Config.js';
import { Signals } from './Signals.js';

import { Advisor } from '../floaters/Advisor.js';
import { Assets } from '../floaters/Assets.js';
import { Codex } from '../floaters/Codex.js';
import { Game } from '../floaters/Game.js';
import { History } from '../floaters/History.js';
import { Inspector } from '../floaters/Inspector.js';
import { Library } from '../floaters/Library.js';
import { Notepad } from '../floaters/Notepad.js';
import { Outliner } from '../floaters/Outliner.js';
import { Player } from '../floaters/Player.js';
import { Previewer } from '../floaters/Previewer.js';
import { Scripter } from '../floaters/Scripter.js';
import { Settings } from '../floaters/Settings.js';
import { Shaper } from '../floaters/Shaper.js';

const DEFAULT_POSITIONS = {
    'floater/position/advisor':     { init: 'right',    side: 'bottom',     size: '30em', size2: '12em' },
    'floater/position/assets':      { init: 'left',     side: 'left',     size: '30em' },
    'floater/position/codex':       { init: 'left',     side: 'left',       size: '30em' },
    'floater/position/game':        { init: 'right',    side: 'right',      size: '35em' },
    'floater/position/history':     { init: 'right',    side: 'right',      size: '35em' },
    'floater/position/inspector':   { init: 'right',    side: 'right',      size: '35em' },
    'floater/position/library':     { init: 'left',     side: 'left',       size: '30em' },
    'floater/position/notepad':     { init: 'right',    side: 'right',      size: '35em' },
    'floater/position/outliner':    { init: 'left',     side: 'left',       size: '30em' },
    'floater/position/player':      { init: 'center',   size: '60%', size2: '80%' },
    'floater/position/previewer':   { init: 'right',    side: 'right',      size: '35em' },
    'floater/position/scripter':    { init: 'center',   size: '60%', size2: '85%' },
    'floater/position/settings':    { init: 'right',    side: 'right',      size: '35em' },
};

class Layout {

    /******************** POSITIONS */

    static getPosition(key, defaultOnly = false) {
        if (!defaultOnly) {
            const data = localStorage.getItem(key);
            if (data) return JSON.parse(data);
        }
        return DEFAULT_POSITIONS[key] ?? { init: 'center' };
    }

    static setPosition(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    /******************** CONSTRUCT */

    static default() {
        // Clear Floaters
        editor.clearFloaters();

        // Checks
        const viewport = editor.viewport();
        if (!viewport) return console.warn('Layout.default(): Viewport not found!');

        // Floaters Wanted
        const defaultFloaters = [
            'inspector', 'previewer',
            'outliner',
            'assets',
            'library', 'codex',
            'advisor',
        ];

        // Install Floaters
        const allowed = viewport.floaterFamily();
        for (const floaterName of defaultFloaters) {
            if (allowed.includes(floaterName)) {
                const floater = Layout.createFloater(floaterName);
                if (floater) Layout.installFloater(floater, true /* defaultOnly */);
            }
        }

        // Clear Inspector / Previewer
        Signals.dispatch('inspectorClear');
        Signals.dispatch('previewerClear');
    }

    /******************** FLOATERS */

    static allFloaters() {
        const floaters = {
            'advisor':      Advisor,
            'assets':       Assets,
            'codex':        Codex,
            'game':         Game,
            'history':      History,
            'inspector':    Inspector,
            'library':      Library,
            'notepad':      Notepad,
            'outliner':     Outliner,
            'player':       Player,
            'previewer':    Previewer,
            'scripter':     Scripter,
            'settings':     Settings,
        };
        return floaters;
    }

    static createFloater(id) {
        const floaters = Layout.allFloaters();
        if (id in floaters) return new floaters[id];
        console.warn(`Layout.createFloater(): Unknown type '${id}'`);
        return null;
    }

    static installFloater(floater, defaultOnly = false) {
        const installInfo = Layout.getPosition(`floater/position/${floater?.id}`, defaultOnly);
        const installInit = installInfo?.init ?? 'center';
        const installSide = installInfo?.side ?? installInit;
        const installSize = (installInfo && installInfo.size && installInfo.size !== '') ? installInfo.size : '20%';
        const installSize2 = installInfo?.size2 ?? installSize;

        const docker = editor.docker;
        let dock = undefined;
        switch (installInit) {
            // Add Dock
            case 'left': case 'right': case 'top': case 'bottom':
                // Docker Traversal Function
                function findDocker(parentDocker, property, value, recursive = true) {
                    const queue = [ parentDocker ];
                    while (queue.length > 0) {
                        const currentElement = queue.shift();
                        for (const child of currentElement.children) {
                            if (child[property] === value) {
                                if (SUEY.Dom.childWithClass(child, 'suey-tabbed', false /* recursive? */)) {
                                    return child;
                                }
                            }
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
                    subDocker = subDocker ?? initialDocker.addDock(installSide, installSize2);
                    dock = subDocker.enableTabs();
                }
                break;
            // Create Window
            case 'center':
            default:
                const width = installInfo?.size ?? '50%';
                const height = installInfo?.size2 ?? '70%';
                const startLeft = installInfo?.startLeft;
                const startTop = installInfo?.startTop;
                const startCentered = (startLeft == null && startTop == null);
                dock = editor.addWindow({ title: floater.id, width, height, startCentered });
                if (!startCentered) dock.setStyle('left', SUEY.Css.toPx(startLeft, null, 'w'), 'top', SUEY.Css.toPx(startTop, null, 'h'));
        }
        dock.addTab(floater);
    }

    /******************** SAVE / LOAD */

    static save() {
        if (!editor.viewport()) return console.warn('Layout.save(): Viewport not found');

        // Docker Traversal
        function traverse(currentDocker, parentLayout) {
            const reverseChildren = currentDocker.children.toReversed();
            reverseChildren.forEach(child => {
                // Primary Docker or Window Holder
                if (child.hasClass('suey-docker-primary') || child.hasClass('suey-window-holder')) {
                    const containerLayout = {
                        type: 'container',
                        children: [],
                    };
                    parentLayout.children.push(containerLayout);
                    traverse(child, containerLayout);
                // Docker
                } else if (child.hasClass('suey-docker')) {
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
                // Tabbed
                } else if (child.hasClass('suey-tabbed')) {
                    const spacers = SUEY.Dom.childrenWithClass(currentDocker, 'suey-flex-spacer', false /* recursive? */);
                    const tabbedLayout = {
                        type: 'tabbed',
                        selectedID: child.selectedID,
                        hasSpacer: (spacers.length > 0),
                        floaters: SUEY.Dom.childrenWithClass(child, 'suey-tab-button', true /* recursive? */).map(button => button.id),
                    };
                    parentLayout.children.push(tabbedLayout);
                // Window
                } else if (child.hasClass('suey-window')) {
                    const windowLayout = {
                        type: 'window',
                        zIndex: SUEY.Css.getVariable('--window-z-index', child),
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

        // Build Layout Tree
        const layout = {
            type: 'main-window',
            children: [],
        };
        traverse(editor, layout);

        // Save the Layout
        const viewport = editor.viewport();
        localStorage.removeItem(`dockerLayout/${viewport.mode()}`);
        localStorage.setItem(`dockerLayout/${viewport.mode()}`, JSON.stringify(layout));
    }

    static load() {
        if (!editor.viewport()) return console.warn('Layout.load(): Viewport not found');

        // Clear Floaters
        editor.clearFloaters();
        const docker = editor.docker;
        const viewport = editor.viewport();

        // Retrieve the layout from localStorage
        const layoutData = localStorage.getItem(`dockerLayout/${viewport.mode()}`);
        if (!layoutData) return Layout.default();

        // Build Layout
        let windowWantsActive = undefined;
        let activeZ = 0;
        function createDocker(layoutNode, parentDocker) {
            let addedDock = false;
            let twinDocker = undefined;
            layoutNode.children.forEach(childNode => {
                // Primary Docker or Window Holder
                if (childNode.type === 'container') {
                    createDocker(childNode, parentDocker);
                // Docker
                } else if (childNode.type === 'docker') {
                    if (!addedDock) {
                        const newDocker = parentDocker.addDock(childNode.side, childNode.size);
                        if (childNode.collapsed) newDocker.collapseTabs();
                        twinDocker = newDocker.getTwin();
                        createDocker(childNode, newDocker);
                        addedDock = true;
                    } else if (twinDocker) {
                        if (childNode.collapsed) twinDocker.collapseTabs();
                        createDocker(childNode, twinDocker.contents());
                    }
                // Tabbed
                } else if (childNode.type === 'tabbed') {
                    const tabbed = parentDocker.enableTabs(childNode.hasSpacer /* flexBefore? */);
                    childNode.floaters.forEach(floaterID => tabbed.addTab(Layout.createFloater(floaterID)));
                    tabbed.selectTab(childNode.selectedID);
                // Window
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
                            editor.addWindow(window);
                            window.addTab(floater).selectTab(floaterID);
                            // Wants Active?
                            const zIndex = parseFloat(childNode.zIndex);
                            if (zIndex && !Number.isNaN(zIndex) && Number.isFinite(zIndex) && zIndex > activeZ) {
                                windowWantsActive = window;
                                activeZ = zIndex;
                            }
                        }
                    });
                }
            });
        }

        // Build Docker
        const layout = JSON.parse(layoutData);
        createDocker(layout, docker);

        // Set Focus on Window?
        if (windowWantsActive) {
            windowWantsActive.focus();
        }
    }

}

export { Layout };

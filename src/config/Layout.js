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
import { Scripter } from '../floaters/Scripter.js';
import { Settings } from '../floaters/Settings.js';
import { Shaper } from '../floaters/Shaper.js';

const DEFAULT_LEFT = '21em';
const DEFAULT_RIGHT = '25em';

const _types = {
    'advisor':      { type: Advisor,    init: 'left',     side: 'bottom',     size: DEFAULT_LEFT,   size2: '10em' },
    'assets':       { type: Assets,     init: 'left',     side: 'left',       size: DEFAULT_LEFT    },
    'codex':        { type: Codex,      init: 'left',     side: 'left',       size: DEFAULT_LEFT    },
    'game':         { type: Game,       init: 'right',    side: 'right',      size: DEFAULT_RIGHT   },
    'history':      { type: History,    init: 'right',    side: 'right',      size: DEFAULT_RIGHT   },
    'inspector':    { type: Inspector,  init: 'right',    side: 'right',      size: DEFAULT_RIGHT   },
    'library':      { type: Library,    init: 'left',     side: 'left',       size: DEFAULT_LEFT    },
    'notepad':      { type: Notepad,    init: 'right',    side: 'right',      size: DEFAULT_RIGHT   },
    'outliner':     { type: Outliner,   init: 'left',     side: 'left',       size: DEFAULT_LEFT    },
    'player':       { type: Player,     init: 'center',                       size: '60%',          size2: '80%' },
    'scripter':     { type: Scripter,   init: 'center',                       size: '60%',          size2: '85%' },
    'settings':     { type: Settings,   init: 'right',    side: 'right',      size: DEFAULT_RIGHT   },
};

class Layout {

    /******************** POSITIONS */

    static getPosition(key, defaultOnly = false) {
        if (!defaultOnly && key && typeof key === 'string' && key != '') {
            const data = localStorage.getItem(`floater/position/${key}`);
            if (data) return JSON.parse(data);
        }
        return _types[key] ?? { init: 'center' };
    }

    static setPosition(key, value) {
        if (key == null || key == '') return;
        localStorage.setItem(`floater/position/${key}`, JSON.stringify(value));
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
            'inspector',
            'outliner',
            'library',
            'assets',
            'codex',
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
    }

    /******************** FLOATERS */

    static floaterTypes() {
        return Object.keys(_types);
    }

    static createFloater(id) {
        if (id in _types) return new _types[id].type;
        console.warn(`Layout.createFloater(): Unknown type '${id}'`);
        return null;
    }

    static installFloater(floater, defaultOnly = false) {
        const installInfo = Layout.getPosition(floater?.id, defaultOnly);
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
        dock.addFloater(floater);
    }

    /** Returns Floater if present in Editor. Option to build if not present.  */
    static findFloater(floaterID, build = false) {
        let floater = editor.getFloaterByID(floaterID);
        if (!floater && build) {
            floater = Layout.createFloater(floaterID);
            if (floater) Layout.installFloater(floater);
        }
        return floater;
    }

    /** If Floater is present in Editor, ensures parent Dock Tab is active. */
    static selectFloater(floater, build = false) {
        if (typeof floater === 'string') floater = this.findFloater(floater, build);
        if (floater && floater.dock) {
            floater.dock.selectFloater(floater.id);
            floater.dock.focus();
        }
        return floater;
    }

    /** Removes Floater (by floater or ID) is present in Editor. */
    static removeFloater(floater) {
        if (typeof floater === 'string') floater = Layout.findFloater(floater, false /* build */);
        if (floater && floater.isElement) floater.removeSelf();
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
                    const floaters = SUEY.Dom.childrenWithClass(child, 'suey-floater', true /* recursive? */, false /* searchChildenOfTarget? */);
                    const tabbedLayout = {
                        type: 'tabbed',
                        selectedID: child.selectedID,
                        hasSpacer: (spacers.length > 0),
                        floaters: floaters.map(button => button.id),
                    };
                    parentLayout.children.push(tabbedLayout);
                // Window
                } else if (child.hasClass('suey-window')) {
                    const floaters = SUEY.Dom.childrenWithClass(child, 'suey-floater', true /* recursive? */, false /* searchChildenOfTarget? */);
                    const windowLayout = {
                        type: 'window',
                        zIndex: SUEY.Css.getVariable('--window-z-index', child),
                        left: child.dom.style.left,
                        top: child.dom.style.top,
                        width: child.dom.style.width,
                        height: child.dom.style.height,
                        initialWidth: child.initialWidth,
                        initialHeight: child.initialHeight,
                        floaters: floaters.map(floater => floater.id),
                    };
                    parentLayout.children.push(windowLayout);
                }
            });
        }

        // Build Layout Tree
        const layout = {
            type: 'main-window',
            children: [],
            active: undefined,
        };
        traverse(editor, layout);

        // Active Floater?
        const activeFloater = document.activeElement?.closest('.suey-floater');
        if (activeFloater) {
            layout.active = activeFloater.id;
        } else {
            const activeWindow = document.activeElement?.closest('.suey-active-window');
            if (activeWindow && activeWindow.suey) layout.active = activeWindow.suey.selectedID;
        }

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
                    childNode.floaters.forEach((floaterID) => tabbed.addFloater(Layout.createFloater(floaterID)));
                    tabbed.selectFloater(childNode.selectedID);
                // Window
                } else if (childNode.type === 'window') {
                    childNode.floaters.forEach(floaterID => {
                        const floater = Layout.createFloater(floaterID);
                        if (floater) {
                            const window = new SUEY.Window({
                                width: childNode.width,
                                height: childNode.height,
                                initialWidth: childNode.initialWidth,
                                initialHeight: childNode.initialHeight,
                                startCentered: false,
                                left: childNode.left,
                                top: childNode.top,
                            });
                            editor.addWindow(window);
                            window.addFloater(floater);
                            // Z-Index
                            const zIndex = parseFloat(childNode.zIndex);
                            if (zIndex && !Number.isNaN(zIndex) && Number.isFinite(zIndex)) {
                                SUEY.Css.setVariable('--window-z-index', `${zIndex}`, window);
                            }
                        }
                    });
                }
            });
        }

        // Build Docker
        const layout = JSON.parse(layoutData);
        createDocker(layout, docker);

        // Initialize DOM
        setTimeout(() => {
            // Force initial resizing
            window.dispatchEvent(new Event('resize'));

            // Reset Focus on last active Floater
            const focused = layout.active;
            if (focused != undefined && focused != 'undefined' && focused != '') {
                if (typeof focused === 'string') Layout.selectFloater(focused);
            }
        }, 50);
    }

}

export { Layout };

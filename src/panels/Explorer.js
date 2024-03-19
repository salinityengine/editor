import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { DockPanel } from '../gui/DockPanel.js';

import { AssetsTab } from './explorer/AssetsTab.js';
import { OutlinerTab } from './explorer/OutlinerTab.js';
import { PrefabsTab } from './explorer/PrefabsTab.js';
import { ScriptsTab } from './explorer/ScriptsTab.js';

class Explorer extends DockPanel {

    constructor({
        style = SUEY.PANEL_STYLES.FANCY,
        startWidth = null,
        startHeight = null,
        minWidth = 0,
        maxWidth = Infinity,
        minHeight = 0,
        maxHeight = Infinity,
    } = {}) {
        super({ style, startWidth, startHeight, minWidth, maxWidth, minHeight, maxHeight });
        this.setName('Explorer');
        this.setTabSide(SUEY.TAB_SIDES.RIGHT);

        // Tabs
        this.outliner = new OutlinerTab();
        this.assets = new AssetsTab();
        this.prefabs = new PrefabsTab();
        this.scripts = new ScriptsTab();

        // Set Default Tab
        this.defaultTab = 'scene';

        // Add Panels
        this.addNewTab('outliner', this.outliner, { icon: `${EDITOR.FOLDER_TYPES}outliner.svg` });
        this.addNewTab('prefabs', this.prefabs, { icon: `${EDITOR.FOLDER_TYPES}prefab.svg` });
        this.addNewTab('assets', this.assets, { icon: `${EDITOR.FOLDER_TYPES}asset.svg` });
        this.addNewTab('scripts', this.scripts, { icon: `${EDITOR.FOLDER_TYPES}script.svg`, color: '#090B11' });

        // Close Button
        SUEY.Interaction.addCloseButton(this, SUEY.CLOSE_SIDES.LEFT);
    }

}

export { Explorer };

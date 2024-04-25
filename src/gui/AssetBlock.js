import {
    FOLDER_MENU,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { CanvasUtils } from './CanvasUtils.js';
import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';
import { Layout } from '../config/Layout.js';
import { Shaper } from '../floaters/Shaper.js';
import { Signals } from '../config/Signals.js';

import { RemoveAssetCommand } from '../commands/CommandList.js';

const ASSET_WIDTH = 128;
const ASSET_HEIGHT = 128;

class AssetBlock extends SUEY.Shrinkable {

    #expandStart = true;
    #expandString = '';
    #viewStart = 'icon';
    #viewString = '';

    /* Supports current types: asset, prefab */
    constructor({
        type,
        category,           // 'primitive', 'item', etc.
        title = '',
        icon = '',
        view = 'icon',      // 'icon', 'text', 'list'
        arrow = 'left',
        border = true,
    } = {}) {
        if (!type) return console.error(`AssetBlock: Missing 'type' argument`);

        // Super
        super({ title, icon, arrow, border });
        const self = this;

        // Properties
        this.type = type;
        this.category = category;

        // Private
        this.#expandStart = true;
        this.#expandString = `expandAssetBlock/${type}/${(category) ? category : 'all'}/`;
        this.#viewStart = view;
        this.#viewString = `viewAssetBlock/${type}/${(category) ? category : 'all'}/`;

        /***** MENU *****/

        // Button Row
        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');

        // 'View Options' Button
        const viewOptions = new SUEY.Button().addClass('suey-borderless-button');
        viewOptions.overflowMenu = SUEY.OVERFLOW.LEFT;
        viewOptions.setAttribute('tooltip', 'View Options');

        const shadowBox = new SUEY.ShadowBox(`${FOLDER_MENU}dots.svg`);
        shadowBox.firstImage().addClass('suey-black-or-white');
        viewOptions.add(shadowBox);

        // Menu
        const viewMenu = new SUEY.Menu();
        const itemIcon = new SUEY.MenuItem('Icon View').onSelect(() => { self.setViewKey('icon'); refreshBlock(); });
        const itemText = new SUEY.MenuItem('Text View').onSelect(() => { self.setViewKey('text'); refreshBlock(); });
        const itemList = new SUEY.MenuItem('List View').onSelect(() => { self.setViewKey('list'); refreshBlock(); });
        viewMenu.add(itemIcon, /* itemText, */ itemList);

        // Add Menus/Buttons
        viewOptions.attachMenu(viewMenu);
        buttonRow.add(new SUEY.FlexSpacer(), viewOptions);
        this.titleDiv.add(buttonRow);

        /***** EVENTS*****/

        function blockExpand() {
            self.setExpandKey(self.isExpanded);
        }

        // Asset Selection
        function blockKeyDown(event) {
            let selected = undefined;

            // Get children, remove 'EmptyBox'
            const children = [ ...self.bodyDiv.children ];
            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];
                if (child.isTemporary) children.splice(i, 1);
                else if (child.dom === document.activeElement) selected = child;
            }
            if (!selected) return;

            // Move Selection Up/Down or Left/Right
            const index = children.indexOf(selected);
            switch (event.key) {
                case 'ArrowUp':
                case 'ArrowLeft':
                    if (index === 0) return;
                    event.preventDefault();
                    children[index - 1].focus();
                    break;
                case 'ArrowDown':
                case 'ArrowRight':
                    if (index === (children.length - 1)) return;
                    event.preventDefault();
                    children[index + 1].focus();
                    break;
            }
        }

        this.on('expand', blockExpand);
        this.on('keydown', blockKeyDown);

        /***** SIGNALS *****/

        function forceRebuild() {
            self.buildBlock(true /* clear? */);
        }

        function refreshBlock() {
            updateUI();
            forceRebuild();
        }

        function updateUI() {
            const expanded = self.getExpandKey();
            self.setExpanded(expanded, false /* event? */);
            const wantsView = self.getViewKey();
            itemIcon.setChecked(wantsView == 'icon');
            itemText.setChecked(wantsView == 'text');
            itemList.setChecked(wantsView == 'list');
        }

        // Editor / Project Changes
        Signals.connect(this, 'projectLoaded', forceRebuild);
        Signals.connect(this, 'schemeChanged', forceRebuild);
        Signals.connect(this, 'settingsRefreshed', refreshBlock);

        /***** INIT *****/

        updateUI();

    } // end ctor

    /******************** CONFIG */

    getExpandKey() { return Boolean(Config.getKey(this.#expandString) ?? this.#expandStart); }
    setExpandKey(expand) { Config.setKey(this.#expandString, Boolean(expand)); }

    getViewKey() { return String(Config.getKey(this.#viewString) ?? this.#viewStart); }
    setViewKey(view) { Config.setKey(this.#viewString, String(view)); }

    /******************** BUILD */

    #emptyItem = undefined;
    #searchTerm = '';

    applySearch(searchTerm) {
        this.#searchTerm = searchTerm ?? '';
        this.activateSearch();
        return this;
    }

    activateSearch() {
        if (!this.bodyDiv || !this.bodyDiv.isElement) return;
        const children = this.bodyDiv.children;
        let hidden = 0;
        for (const child of children) {
            if (!child.isElement || child.isTemporary) continue;
            const name = child.name ? String(child.name).toLowerCase() : '';
            if (name.indexOf(this.#searchTerm) !== -1) {
                child.setStyle('display', '');
            } else {
                child.setStyle('display', 'none');
                hidden++;
            }
        }
        ///// #OPTION: Only show when block is empty
        this.#emptyItem?.setStyle('display', (children.length <= 1) ? '' : 'none');
        ///// #OPTION: Show if all items hidden
        // this.#emptyItem?.setStyle('display', (hidden === children.length - 1) ? '' : 'none');
        return this;
    }

    buildBlock(clear = false) {
        // Clear?
        if (clear) this.clearContents();

        // Empty Item
        if (clear || !this.#emptyItem) {
            const empty = new SUEY.Row().addClass('suey-property-full');
            empty.setAttribute('tooltip', Language.getKey('assets/empty'));
            empty.isTemporary = true;
            empty.dom.draggable = false;

            const noneBox = new SUEY.VectorBox(`${FOLDER_MENU}line.svg`);
            noneBox.setStyle('height', '150%', 'opacity', '0.2', 'padding', '0em', 'filter', 'brightness(0)');
            this.add(empty.add(noneBox));

            // Save Reference
            this.#emptyItem = empty;
        }

        // Get Assets
        const assets = SALT.AssetManager.library(this.type, this.category);

        // Remove missing Assets
        const uuids = SALT.Uuid.arrayFromObjects(assets);
        for (const assetBox of this.contents().children) {
            if (!assetBox.uuid) continue;
            if (uuids.includes(assetBox.uuid)) continue;
            this.remove(assetBox);
        }

        // Update Items
        if (assets.length !== 0) this.buildItems(assets);
        this.sort(); /* inherited from Shrinkable */
        this.activateSearch();
    }

    /** Add missing items */
    buildItems(assets) {
        assets = assets ?? SALT.AssetManager.library(this.type, this.category);
        const uuids = SALT.Uuid.arrayFromObjects(this.contents().children);
        for (const asset of assets) {
            if (uuids.includes(asset.uuid)) continue;
            const item = this.createItem(asset);
            if (item) this.add(item);
        }
    }

    /** Creates asset box */
    createItem(asset) {
        if (!asset) return;

        // ASSET BOX
        const item = new SUEY.AssetBox(asset.name, this.getViewKey());
        item.dom.draggable = true;
        item.uuid = asset.uuid;
        item.setID(asset.uuid);
        let innerBox = undefined;

        // TYPE: rendered ('shape', 'texture', etc.)
        if (this.type === 'geometry' ||
            this.type === 'palette' ||
            this.type === 'material' ||
            this.type === 'shape' ||
            this.type === 'texture')
        {
            innerBox = new SUEY.AbsoluteBox();
            const canvas = document.createElement('canvas');
            canvas.style.height = '100%';
            canvas.style.width = '100%';
            canvas.width = ASSET_WIDTH;
            canvas.height = ASSET_HEIGHT;
            innerBox.dom.appendChild(canvas);

            if (this.type === 'geometry') {
                // SALT.RenderUtils.renderGeometryToCanvas(canvas, asset /* geometry */, null /* material */, 0xb0b0b0);
            } else if (this.type === 'material') {
                // SALT.RenderUtils.renderGeometryToCanvas(canvas, null /* geometry */, asset /* material */);
            } else if (this.type === 'palette') {
                canvas.style['border-radius'] = 'var(--radius-small)';
                CanvasUtils.drawPalette(canvas, asset /* palette */);

                console.log('Drawing palette');

            } else if (this.type === 'shape') {
                // const renderHexColor = 0xff00ff; // SUEY.ColorScheme.color(SUEY.TRAIT.TRIADIC1);
                // const shapeGeometry = new THREE.ShapeGeometry(asset /* shape */);
                // SALT.RenderUtils.renderGeometryToCanvas(canvas, shapeGeometry, null /* material */, renderHexColor);
                // shapeGeometry.dispose();
            } else if (this.type === 'texture') {
                // const texture = asset;
                // if (texture.image && texture.image.complete) texture.needsUpdate = true;
                // SALT.RenderUtils.renderTextureToCanvas(canvas, texture);
            }

        // OLD: 'texture' (used 'img' element only)
        // } else if (this.type === 'texture') {
        //     const texture = asset;
        //     if (!texture) return;
        //     if (!texture.image) return;
        //     innerBox = new SUEY.VectorBox(texture.image.src).enableDragging();

        // TYPE: 'script'
        } else if (this.type === 'script') {
            const script = asset;
            let sourceIcon = '';
            if (script.format === SALT.SCRIPT_FORMAT.JAVASCRIPT) sourceIcon = `${FOLDER_MENU}outliner/js.svg`;
            innerBox = new SUEY.VectorBox(sourceIcon).enableDragging();

        // TYPE: 'prefab'
        } else if (this.type === 'prefab' && (this.category && this.category === asset.category)) {
            const prefab = asset;
            if (prefab.icon) {
                innerBox = new SUEY.VectorBox(prefab.icon).enableDragging();
            } else {
                innerBox = new SUEY.AbsoluteBox();
                const canvas = document.createElement('canvas');
                canvas.style.height = '100%';
                canvas.style.width = '100%';
                canvas.width = ASSET_WIDTH;
                canvas.height = ASSET_HEIGHT;
                innerBox.dom.appendChild(canvas);
                SALT.RenderUtils.renderMeshToCanvas(canvas, prefab);
            }

        // TYPE: unknown
        } else {
            innerBox = new SUEY.VectorBox().enableDragging();
        }

        // EDIT ASSET
        function editAsset() {
            const type = String(asset.type).toLowerCase();
            switch (type) {
                case 'script':
                    const scripter = Layout.selectFloater('scripter', true /* build? */);
                    scripter.loadScript(asset);
                    break;
            }
        }

        // INNER BOX
        item.add(innerBox);

        // SELECT
        item.on('focus', () => {
            // EMPTY
        });

        // DOUBLE CLICK
        item.on('dblclick', () => {
            editAsset();
        });

        // KEY PRESS
        item.on('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                editAsset();
            } else if (event.key === 'Delete') {
                event.preventDefault();
                event.stopPropagation();
                editor.execute(new RemoveAssetCommand(asset));
            }
        });

        // DRAG & DROP
        item.on('dragstart', (event) => {
            if (innerBox) event.dataTransfer.setDragImage(innerBox.dom, 0, 0);
            event.dataTransfer.clearData();
            event.dataTransfer.setData('text/plain', asset.uuid);
            event.dataTransfer.dropEffect = 'copy';
            editor.dragInfo = asset.uuid; /* for dragenter events */
        });

        item.on('dragend', (event) => {
            Signals.dispatch('dropEnded');
        });

        // RETURN
        return item;
    }

    updateItem(type, asset) {
        if (!asset) return;
        if (type !== this.type) return;
        if (this.category && asset.category && (asset.category !== this.category)) return;

        // Remove existing
        for (const assetBox of this.contents().children) {
            if (assetBox.uuid && assetBox.uuid === asset.uuid) this.remove(assetBox);
        }

        // New updated item
        const item = this.createItem(asset);
        if (item) {
            this.add(item);
            this.sort();
        }
    }

}

export { AssetBlock };

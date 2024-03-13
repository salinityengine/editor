import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as OSUI from 'gui';

import { CanvasUtils } from './CanvasUtils.js';
import { ColorizeFilter } from './ColorizeFilter.js';
import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';
import { RemoveAssetCommand } from '../commands/Commands.js';

const ASSET_WIDTH = 128;
const ASSET_HEIGHT = 128;

class AssetPanel extends OSUI.Shrinkable {

    #expandStart = true;
    #expandString = '';
    #viewStart = 'icon';
    #viewString = '';

    /* Asset panel supports current types: asset, prefab */
    constructor({
        type,
        category,           // 'primitive', 'item', etc.
        title = '',
        icon = '',
        view = 'icon',      // 'icon', 'text', 'list'
        arrow = 'left',
        border = true,
    } = {}) {
        if (!type) return console.error('AssetPanel: No type defined!');

        // Super
        super({ text: title, icon, arrow, border });
        const self = this;

        // Properties
        this.type = type;
        this.category = category;

        // Private
        this.#expandStart = true;
        this.#expandString = `expandAssetPanel/${type}/${(category) ? category : 'all'}/`;
        this.#viewStart = view;
        this.#viewString = `viewAssetPanel/${type}/${(category) ? category : 'all'}/`;

        /***** MENU *****/

        // Button Row
        const buttonRow = new OSUI.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');

        // 'View Options' Button
        const viewOptions = new OSUI.Button().addClass('osui-borderless-button');
        viewOptions.overflowMenu = OSUI.OVERFLOW.LEFT;
        viewOptions.dom.setAttribute('tooltip', 'View Options');

        const shadowBox = new OSUI.ShadowBox(`${EDITOR.FOLDER_MENU}dots.svg`);
        if (shadowBox.firstImage()) {
            if (shadowBox.firstImage().firstImage()) {
                shadowBox.firstImage().firstImage().addClass('osui-black-or-white');
            }
        }
        viewOptions.add(shadowBox);

        // Menu
        const viewMenu = new OSUI.Menu();
        const itemIcon = new OSUI.MenuItem('Icon View').onSelect(() => { self.setViewKey('icon'); refreshPanel(); });
        const itemText = new OSUI.MenuItem('Text View').onSelect(() => { self.setViewKey('text'); refreshPanel(); });
        const itemList = new OSUI.MenuItem('List View').onSelect(() => { self.setViewKey('list'); refreshPanel(); });
        viewMenu.add(itemIcon, /* itemText, */ itemList);

        // Add Menus/Buttons
        viewOptions.attachMenu(viewMenu);
        buttonRow.add(new OSUI.FlexSpacer(), viewOptions);
        this.titleDiv.add(buttonRow);

        /***** EVENTS*****/

        function onExpand() {
            self.setExpandKey(self.isExpanded);
        }

        // Asset Selection
        function onKeyDown(event) {
            let selected = undefined;

            // Get children, remove 'EmptyBox'
            const children = [...self.bodyDiv.children];
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

        this.dom.addEventListener('expand', onExpand);
        this.dom.addEventListener('keydown', onKeyDown);

        this.dom.addEventListener('destroy', function() {
            self.dom.removeEventListener('expand', onExpand);
            self.dom.addEventListener('keydown', onKeyDown);
        }, { once: true });

        /***** SIGNALS *****/

        function forceRebuild() {
            self.buildPanel(true /* clear? */);
        }

        function refreshPanel() {
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
        signals.projectLoaded.add(forceRebuild);
        signals.schemeChanged.add(forceRebuild);
        signals.refreshSettings.add(refreshPanel);

        this.dom.addEventListener('destroy', function() {
            signals.projectLoaded.remove(forceRebuild);
            signals.schemeChanged.remove(forceRebuild);
            signals.refreshSettings.remove(refreshPanel);
        }, { once: true });

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
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (!child.isElement || child.isTemporary) continue;
            const name = (child.name) ? String(child.name).toLowerCase() : '';
            if (name.indexOf(this.#searchTerm) !== -1) {
                child.setDisplay('');
            } else {
                child.setDisplay('none');
                hidden++;
            }
        }
        ///// #OPTION: Only show when panel is empty
        this.#emptyItem?.setDisplay((children.length <= 1) ? '' : 'none');
        ///// #OPTION: Show if all items hidden
        // this.#emptyItem?.setDisplay((hidden === children.length - 1) ? '' : 'none');
        return this;
    }

    buildPanel(clearPanel = false) {
        // Clear?
        if (clearPanel) {
            this.clearContents();
        }

        // Empty Item
        if (clearPanel || !this.#emptyItem) {
            const empty = new OSUI.Row().addClass('osui-property-full');
            empty.dom.setAttribute('tooltip', Language.getKey('assets/empty'));
            empty.isTemporary = true;
            empty.dom.draggable = false;

            const noneBox = new OSUI.VectorBox(`${EDITOR.FOLDER_MENU}line.svg`);
            noneBox.setStyle('height', '150%', 'opacity', '0', 'padding', '0em', 'filter', 'brightness(0)');
            this.add(empty.add(noneBox));

            // Save Reference
            this.#emptyItem = empty;
        }

        // Get Assets
        const assets = SALT.AssetManager.getLibrary(this.type, this.category);

        // Remove missing Assets
        for (const assetBox of this.contents().children) {
            if (!assetBox.uuid) continue;
            let found = false;
            for (const asset of assets) {
                if (assetBox.uuid && assetBox.uuid === asset.uuid) {
                    found = true;
                    break;
                }
            }
            if (!found) this.remove(assetBox);
        }

        // Update Items
        if (assets.length !== 0) this.buildItems(assets);
        this.sort(); /* inherited from Shrinkable */
        this.activateSearch();
    }

    /** Add missing items */
    buildItems(assets) {
        assets = assets ?? SALT.AssetManager.getLibrary(this.type, this.category);
        for (const asset of assets) {
            let found = false;
            for (const assetBox of this.contents().children) {
                if (assetBox.uuid && assetBox.uuid === asset.uuid) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                const item = this.createItem(asset);
                if (item) this.add(item);
            }
        }
    }

    /** Creates asset box */
    createItem(asset) {
        if (!asset) return;

        // ASSET BOX
        const item = new OSUI.AssetBox(asset.name, this.getViewKey());
        item.dom.draggable = true;
        item.uuid = asset.uuid;
        item.setId(asset.uuid);

        let innerBox = undefined;

        // 'geometry' / 'material' / 'shape'
        if (this.type === 'geometry' ||
            this.type === 'palette' ||
            this.type === 'material' ||
            this.type === 'shape' ||
            this.type === 'texture')
        {
            innerBox = new OSUI.AbsoluteBox();
            const canvas = document.createElement('canvas');
            canvas.style.height = '100%';
            canvas.style.width = '100%';
            canvas.width = ASSET_WIDTH;
            canvas.height = ASSET_HEIGHT;
            innerBox.dom.appendChild(canvas);
            if (this.type === 'geometry') {
                SALT.RenderUtils.renderGeometryToCanvas(canvas, asset /* geometry */, null /* material */, 0xb0b0b0);
            } else if (this.type === 'material') {
                SALT.RenderUtils.renderGeometryToCanvas(canvas, null /* geometry */, asset /* material */);
            } else if (this.type === 'palette') {
                item.onDblClick(() => { signals.inspectorBuild.dispatch(asset); });
                canvas.style['border-radius'] = 'var(--radius-small)';
                CanvasUtils.drawPalette(canvas, asset /* palette */);
            } else if (this.type === 'shape') {
                item.onDblClick(() => { editor.shaper.showWindow(asset); });
                const renderHexColor = 0xff00ff; // OSUI.ColorScheme.color(OSUI.TRAIT.TRIADIC1);
                const shapeGeometry = new THREE.ShapeGeometry(asset /* shape */);
                SALT.RenderUtils.renderGeometryToCanvas(canvas, shapeGeometry, null /* material */, renderHexColor);
                shapeGeometry.dispose();
            } else if (this.type === 'texture') {
                item.onDblClick(() => { signals.inspectorBuild.dispatch(asset); });
                const texture = asset;
                if (texture.image && texture.image.complete) texture.needsUpdate = true;
                SALT.RenderUtils.renderTextureToCanvas(canvas, texture);
            }

        // OLD: 'texture' (used 'img' element only)
        // } else if (this.type === 'texture') {
        //     const texture = asset;
        //     if (!texture) return;
        //     if (!texture.image) return;
        //     innerBox = new OSUI.VectorBox(texture.image.src).enableDragging();

        // 'script'
        } else if (this.type === 'script') {
            const script = asset;
            let sourceIcon = '';
            if (script.format === SALT.SCRIPT_FORMAT.JAVASCRIPT) sourceIcon = `${EDITOR.FOLDER_MENU}outliner/js.svg`;
            innerBox = new OSUI.VectorBox(sourceIcon).enableDragging();
            item.onDblClick(() => { signals.editScript.dispatch(script); });
            item.onKeyDown((event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    event.stopPropagation();
                    signals.editScript.dispatch(script);
                }
            });

        // 'prefab'
        } else if (this.type === 'prefab' && (this.category && this.category === asset.category)) {
            const prefab = asset;
            if (prefab.icon) {
                innerBox = new OSUI.VectorBox(prefab.icon).enableDragging();
            } else {
                innerBox = new OSUI.AbsoluteBox();
                const canvas = document.createElement('canvas');
                canvas.style.height = '100%';
                canvas.style.width = '100%';
                canvas.width = ASSET_WIDTH;
                canvas.height = ASSET_HEIGHT;
                innerBox.dom.appendChild(canvas);
                SALT.RenderUtils.renderMeshToCanvas(canvas, prefab);
            }
            item.onDblClick(() => { signals.inspectorBuild.dispatch(prefab); });
            item.onKeyDown((event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    event.stopPropagation();
                    signals.inspectorBuild.dispatch(prefab);
                }
            });

        // Unknown Type
        } else {
            innerBox = new OSUI.VectorBox().enableDragging();
        }

        // INNER BOX
        item.add(innerBox);

        // SELECT
        item.onFocus(() => {
            signals.previewerBuild.dispatch(asset);
        });

        // KEY PRESS
        item.onKeyDown((event) => {
            if (event.key === 'Delete') {
                event.preventDefault();
                event.stopPropagation();
                editor.execute(new RemoveAssetCommand(asset));
            }
        });

        // DRAG & DROP
        item.dom.addEventListener('dragstart', (event) => {
            if (innerBox) event.dataTransfer.setDragImage(innerBox.dom, 0, 0);
            event.dataTransfer.clearData();
            event.dataTransfer.setData('text/plain', asset.uuid);
            event.dataTransfer.dropEffect = 'copy';
            editor.dragInfo = asset.uuid; /* for dragenter events */
        });

        item.dom.addEventListener('dragend', (event) => {
            signals.dropEnded.dispatch();
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

export { AssetPanel };

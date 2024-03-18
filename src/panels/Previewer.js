import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Config } from '../config/Config.js';
import { DockPanel } from '../gui/DockPanel.js';
import { Signals } from '../config/Signals.js';

// // Settings
// import { PaintPreview } from './previewer/PaintPreview.js';
// import { SnapPreview } from './previewer/SnapPreview.js';

// // Assets
// import { GeometryPreview } from './previewer/GeometryPreview.js';
// import { MaterialPreview } from './previewer/MaterialPreview.js';
// import { PalettePreview } from './previewer/PalettePreview.js';
// import { PrefabPreview } from './previewer/PrefabPreview.js';
// import { ScriptPreview } from './previewer/ScriptPreview.js';
// import { ShapePreview } from './previewer/ShapePreview.js';
// import { TexturePreview } from './previewer/TexturePreview.js';

class Previewer extends DockPanel {

    constructor({
        style = SUEY.PANEL_STYLES.FANCY,
        startWidth = null,
        startHeight = null,
        minWidth = 0,
        maxWidth = Infinity,
        minHeight = 0,
        maxHeight = Infinity,
    } = {}) {
        super({ style, displayEmpty: false, startWidth, startHeight, minWidth, maxWidth, minHeight, maxHeight });
        const self = this;
        this.setName('Previewer');
        this.addClass('salt-previewer');
        this.setTabSide(SUEY.TAB_SIDES.LEFT);

        // Flags
        this.isEmpty = true;

        // Internal Properties
        let _item = undefined;

        /** Builds Previewer */
        function build(buildFrom = undefined) {
            if (buildFrom !== 'rebuild') _item = buildFrom;

            // Delete existing tabs
            self.clearTabs();

            if (_item) {
                const color = '#0055CC'; /* background color for magnifying glass icon */

                // TRANSFORM CONTROLS
                if (_item === 'transformControls') {
                    if (editor.viewport.transformMode() === 'paint') {
                        self.addNewTab('paint', new PaintPreview(), { icon: `${EDITOR.FOLDER_TYPES}paint/palette.svg` });
                    } else if (editor.viewport.transformMode() === 'snap') {
                        self.addNewTab('snap', new SnapPreview(), { icon: `${EDITOR.FOLDER_TYPES}snap/magnet.svg` });
                    }

                // GEOMETRY
                } else if (_item.isBufferGeometry) {
                    self.addNewTab('preview', new GeometryPreview(_item), { icon: `${EDITOR.FOLDER_TYPES}inspector.svg`, color });

                // MATERIAL
                } else if (_item.isMaterial) {
                    self.addNewTab('preview', new MaterialPreview(_item), { icon: `${EDITOR.FOLDER_TYPES}inspector.svg`, color });

                // PALETTE
                } else if (_item.isPalette) {
                    self.addNewTab('preview', new PalettePreview(_item), { icon: `${EDITOR.FOLDER_TYPES}inspector.svg`, color });

                // SCRIPT
                } else if (_item.type === 'Script') {
                    self.addNewTab('preview', new ScriptPreview(_item), { icon: `${EDITOR.FOLDER_TYPES}inspector.svg`, color });

                // SHAPE
                } else if (_item.type === 'Shape') {
                    self.addNewTab('preview', new ShapePreview(_item), { icon: `${EDITOR.FOLDER_TYPES}inspector.svg`, color });

                // TEXTURE
                } else if (_item.isTexture) {
                    self.addNewTab('preview', new TexturePreview(_item), { icon: `${EDITOR.FOLDER_TYPES}inspector.svg`, color });

                // PREFAB
                } else if (_item.isPrefab && !_item.isBuiltIn) {
                    self.addNewTab('preview', new PrefabPreview(_item), { icon: `${EDITOR.FOLDER_TYPES}inspector.svg`, color });
                }

            }

            // Hide if empty, select last known tab (stored ranked in Config.js)
            self.isEmpty = (self.panels.length === 0);
            // self.setDisplay((self.isEmpty || !Config.getKey(`panels/show${self.getName()}`)) ? 'none' : '');
            self.setDisplay(self.isEmpty ? 'none' : '');
            self.selectLastKnownTab();

            // // DEBUG: Print out number of functions attached to each signal
            // Signals.dispatch('logSignalCounts');

            // Dispatch Signals
            Signals.dispatch('previewerChanged');
        }

        // Close Button
        SUEY.Interaction.addCloseButton(this, SUEY.CLOSE_SIDES.RIGHT);

        /***** EVENTS *****/

        this.dom.addEventListener('hidden', function(event) {
            Signals.dispatch('previewerBuild');
        });

        /***** SIGNALS *****/

        Signals.connect(this, 'previewerBuild', (buildFrom) => { build(buildFrom); });

    } // end ctor

}

export { Previewer };

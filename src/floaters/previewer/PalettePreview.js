import editor from 'editor';
import * as SUEY from 'gui';

import { CanvasUtils } from '../../gui/CanvasUtils.js';
import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { Signals } from '../../config/Signals.js';

import { SetAssetValueCommand } from '../../commands/CommandList.js';

class PalettePreview extends SUEY.Titled {

    constructor(palette) {
        super({ title: 'Palette' });

        // Property Box
        const props = new SUEY.PropertyList('30%');
        this.add(props);

        // Name
        const nameTextBox = new SUEY.TextBox().onChange(() => {
            editor.execute(new SetAssetValueCommand(palette, 'name', nameTextBox.getValue()));
        });
        props.addRow('Name', nameTextBox);

        // UUID
        const paletteUUID = new SUEY.TextBox().setDisabled(true);

        // 'Copy' UUID Button
        const paletteUUIDCopy = new SUEY.Button('Copy').onClick(() => {
            navigator.clipboard.writeText(palette.uuid).then(
                function() { /* success */ },
                function(err) { console.error('PalettePreview.copy(): Could not copy text to clipboard - ', err); }
            );
        });
        paletteUUIDCopy.setStyle('marginLeft', EDITOR.WIDGET_SPACING)
        paletteUUIDCopy.setStyle('minWidth', '3.5em');
        if (Config.getKey('promode') === true) {
            props.addRow('UUID', paletteUUID, paletteUUIDCopy);
        }

        // Edit
        const paletteEdit = new SUEY.Button(`Edit ${Language.getKey('assets/types/palette')}`);
        paletteEdit.onClick(() => {
            Signals.dispatch('inspectorBuild', palette);
            Signals.dispatch('assetSelect', 'palette', palette);
        });
        props.addRow('Edit', paletteEdit);

        /***** SHAPE *****/

        // Outer Box
        const assetBox = new SUEY.AssetBox(palette.name, 'icon', false /* mini */);
        assetBox.contents().noShadow();
        assetBox.contents().dom.style.width = '96%';
        assetBox.contents().dom.style.height = '96%';
        assetBox.dom.style.width = '98%';
        assetBox.dom.style.aspectRatio = '2 / 1';

        // Inner Box
        const dragBox = new SUEY.AbsoluteBox();
        dragBox.dom.draggable = true;

        // Render to Canvas
        const canvas = document.createElement('canvas');
        canvas.draggable = true;
        canvas.style.width = '100%';
        canvas.style['border-radius'] = 'var(--radius-large)';
        canvas.width = EDITOR.PREVIEW_WIDTH;
        canvas.height = EDITOR.PREVIEW_HEIGHT;

        // Append Children
        dragBox.dom.appendChild(canvas);
        assetBox.add(dragBox);
        props.add(assetBox);

        /***** DRAG & DROP *****/

        dragBox.dom.addEventListener('dragstart', (event) => {
            event.dataTransfer.clearData();
            event.dataTransfer.setData('text/plain', palette.uuid);
            event.dataTransfer.dropEffect = 'copy';
            editor.dragInfo = palette.uuid; /* for dragenter events */
        });

        dragBox.dom.addEventListener('dragend', (event) => {
            Signals.dispatch('dropEnded');
        });

        /***** UPDATE *****/

        function updateUI() {
            nameTextBox.setValue(palette.name);
            paletteUUID.setValue(palette.uuid);

            // Render
            CanvasUtils.drawPalette(canvas, palette);
        }

        /***** SIGNALS *****/

        function assetChangedCallback(type, asset) {
            if (!type || !asset || type !== 'palette') return;
            if (asset.uuid === palette.uuid) updateUI();
        }

        Signals.connect(this, 'assetChanged', assetChangedCallback);

        /***** INIT *****/

        updateUI();
    }

}

export { PalettePreview };

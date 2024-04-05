import * as ONE from 'onsight';
import * as OSUI from 'osui';
import * as EDITOR from 'editor';

import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { SetAssetValueCommand } from '../../commands/Commands.js';

class ShapePreview extends OSUI.Titled {

    constructor(shape) {
        super({ title: 'Shape' });

        // Property Box
        const props = new OSUI.PropertyList('30%');
        this.add(props);

        // Name
        const nameTextBox = new OSUI.TextBox().onChange(() => {
            editor.execute(new SetAssetValueCommand(shape, 'name', nameTextBox.getValue()));
        });
        props.addRow('Name', nameTextBox);

        // UUID
        const shapeUUID = new OSUI.TextBox().setDisabled(true);

        // 'Copy' UUID Button
        const shapeUUIDCopy = new OSUI.Button('Copy').onClick(() => {
            navigator.clipboard.writeText(shape.uuid).then(
                function() { /* success */ },
                function(err) { console.error('Async: Could not copy text: ', err);
            });
        });
        shapeUUIDCopy.setStyle('marginLeft', EDITOR.WIDGET_SPACING)
        shapeUUIDCopy.setStyle('minWidth', '3.5em');
        if (Config.getKey('promode') === true) {
            props.addRow('UUID', shapeUUID, shapeUUIDCopy);
        }

        // Edit
        const shapeEdit = new OSUI.Button(`Edit ${Language.getKey('assets/types/shape')}`);
        shapeEdit.onClick(() => { editor.shaper.showWindow(); });
        props.addRow('Edit', shapeEdit);

        /***** SHAPE *****/

        // Outer Box
        const assetBox = new OSUI.AssetBox(shape.name, 'icon', false /* mini */);
        assetBox.contents().noShadow();
        assetBox.contents().dom.style.width = '96%';
        assetBox.contents().dom.style.height = '96%';
        assetBox.dom.style.width = '98%';
        assetBox.dom.style.aspectRatio = '2 / 1';

        // Inner Box
        const dragBox = new OSUI.AbsoluteBox();
        dragBox.dom.draggable = true;

        // Render to Canvas
        const canvas = document.createElement('canvas');
        canvas.draggable = true;
        canvas.style.width = '100%';
        canvas.width = EDITOR.PREVIEW_WIDTH;
        canvas.height = EDITOR.PREVIEW_HEIGHT;

        // Append Children
        dragBox.dom.appendChild(canvas);
        assetBox.add(dragBox);
        props.add(assetBox);

        /***** DRAG & DROP *****/

        dragBox.dom.addEventListener('dragstart', (event) => {
            event.dataTransfer.clearData();
            event.dataTransfer.setData('text/plain', shape.uuid);
            event.dataTransfer.dropEffect = 'copy';
            editor.dragInfo = shape.uuid; /* for dragenter events */
        });

        dragBox.dom.addEventListener('dragend', (event) => {
            signals.dropEnded.dispatch();
        });

        /***** UPDATE *****/

        function updateUI() {
            nameTextBox.setValue(shape.name);
            shapeUUID.setValue(shape.uuid);

            // Render
            const renderHexColor = 0xff00ff;
            const shapeGeometry = new THREE.ShapeGeometry(shape);
            ONE.RenderUtils.renderGeometryToCanvas(canvas, shapeGeometry, null /* material */, renderHexColor);
            shapeGeometry.dispose();
        }

        /***** SIGNALS *****/

        function assetChangedCallback(type, asset) {
            if (!type || !asset || type !== 'shape') return;
            if (asset.uuid === shape.uuid) updateUI();
        }

        signals.assetChanged.add(assetChangedCallback);

        this.dom.addEventListener('destroy', function() {
            signals.assetChanged.remove(assetChangedCallback);
        }, { once: true });

        /***** INIT *****/

        updateUI();
    }

}

export { ShapePreview };

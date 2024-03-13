import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

class AssetInput {

    static build(propertyList, itemName = '', assetType = 'asset', initialUUID = '', onChange = (value) => {}) {

        // Asset / Prefab Type
        let asset = SALT.AssetManager.getAsset(initialUUID);
        const typeClassName = SALT.Strings.capitalize(assetType);

        // Widget
        const textBox = new SUEY.TextBox();
        textBox.dom.disabled = true;

        const clearButton = new SUEY.Button().addClass('osui-property-button');
        clearButton.add(new SUEY.ShadowBox(`${EDITOR.FOLDER_MENU}delete.svg`).addClass('osui-triadic-colorize'));
        clearButton.dom.setAttribute('tooltip', 'Clear');

        // Event
        textBox.onPointerDown(() => {
            if (asset) {
                const verifyType = SALT.AssetManager.checkType(asset);
                signals.assetSelect.dispatch(verifyType, asset);
            }
        });

        let textBoxValue;
        textBox.dom.addEventListener('dragenter', () => {
            if (textBox.hasClass('osui-disabled')) return;
            textBoxValue = textBox.getValue();
            textBox.setValue(`${typeClassName}`);
            const uuid = editor.dragInfo;
            const checkAsset = SALT.AssetManager.getAsset(uuid);
            textBox.addClass(checkItemType(checkAsset) ? 'osui-yes-drop' : 'osui-no-drop');
        });

        textBox.dom.addEventListener('dragleave', () => {
            if (textBox.hasClass('osui-disabled')) return;
            textBox.setValue(textBoxValue);
            textBox.removeClass('osui-yes-drop', 'osui-no-drop');
        });

        textBox.dom.addEventListener('drop', (event) => {
            textBox.removeClass('osui-yes-drop', 'osui-no-drop');
            event.preventDefault();
            event.stopPropagation();
            if (textBox.hasClass('osui-disabled')) return;
            const uuid = event.dataTransfer.getData('text/plain');
            const checkAsset = SALT.AssetManager.getAsset(uuid);
            if (checkItemType(checkAsset)) {
                asset = checkAsset;
                onChange(uuid);
            }
            updateName();
        });

        clearButton.onClick(() => {
            asset = undefined;
            onChange(null);
            updateName();
        });

        // Helpers
        function checkItemType(asset) {
            if (!asset) return false;
            if (assetType === 'asset') return true;
            return (SALT.AssetManager.checkType(asset) === assetType);
        }

        function updateName() {
            if (checkItemType(asset)) {
                textBox.addClass('osui-valid-type');
                textBox.removeClass('osui-invalid-type');
                textBox.setValue(asset.name);
            } else {
                textBox.removeClass('osui-valid-type');
                textBox.addClass('osui-invalid-type');
                textBox.setValue('None');
            }
        }

        // Init
        updateName();

        // Push
        return propertyList.addRow(itemName, textBox, clearButton);
    }

}

export { AssetInput };

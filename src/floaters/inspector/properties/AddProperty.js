import {
    FOLDER_FLOATERS,
    FOLDER_MENU,
    WIDGET_SPACING,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { ColorizeFilter } from '../../../gui/ColorizeFilter.js';
import { Config } from '../../../config/Config.js';
import { Language } from '../../../config/Language.js';
import { Signals } from '../../../config/Signals.js';

// import { ChangeComponentCommand } from '../../../commands/CommandList.js';
import { MultiCmdsCommand } from '../../../commands/CommandList.js';

let lastAddedType = undefined;

export function addProperty(propertyList, value, propKey, item, updateComponent = () => {}) {

    // Validate Value
    if (value === undefined) value = item['default'];
    if (value === undefined) value = SALT.ComponentManager.defaultValue(item.type);

    // Row with No Title
    const rowWidgets = [];

    // Labeled Row, with Left & Right Widgets
    const leftWidgets = [];
    const rightWidgets = [];

    /***** FORMATTING: 'divider' *****/

    if (item.type === 'divider') {

        if (lastAddedType !== 'divider') {
            propertyList.add(new SUEY.MenuSeparator());
        }

    /***** FORMATTING: 'hidden' *****/

    } else if (item.type === 'hidden') {

        // SKIP

    /***** TYPE: 'select' (int) *****/

    } else if (item.type === 'select') {

        // Value
        const selectOptions = {};
        for (let option of item.select) {
            selectOptions[option] = SUEY.Strings.addSpaces(SUEY.Strings.capitalize(option));
        }
        if (!isNaN(value)) value = Object.keys(selectOptions)[value];

        // Widget
        const selectDropDown = new SUEY.Dropdown().setOptions(selectOptions);
        selectDropDown.overflowMenu = SUEY.OVERFLOW.LEFT;

        // Event
        selectDropDown.on('change', () => {
            value = selectDropDown.getValue();
            updateComponent(item, propKey, value);
        });

        // Init
        selectDropDown.setValue(value);

        // Push
        rightWidgets.push(selectDropDown);

    /***** TYPE: 'number' / 'int' / 'angle' (number) *****/

    } else if (item.type === 'number' || item.type === 'int' || item.type === 'angle') {

        // Value
        if (item.type === 'angle') value = SALT.Maths.radiansToDegrees(value);

        // Widget
        const numberHolder = new SUEY.Span().addClass('suey-number-holder');
        const numberBox = new SUEY.NumberBox();
        numberHolder.add(numberBox);

        // Event
        numberBox.on('change', () => {
            value = numberBox.getValue();
            if (item.type === 'angle') value = SALT.Maths.degreesToRadians(value);
            updateComponent(item, propKey, value);
        });

        // Init
        let min = item['min'] ?? -Infinity;
        let max = item['max'] ??  Infinity;
        let step = item['step'] ?? ((item.type === 'angle') ? 10 : 1);
        let unit = item['unit'] ?? ((item.type === 'angle') ? '°' : '');
        let label = item['label'] ?? '';
        let precision = (item.type === 'int') ? 0 : (item['precision'] ?? 3);
        if (step === 'grid') step = parseFloat(editor.viewport()?.gridSize() ?? 0);
        numberBox.setRange(min, max).setStep(step).setUnit(unit).setPrecision(precision);
        numberBox.setValue(value);
        if (String(label) !== '') {
            numberBox.setStyle('text-align', 'right');
            const labelBox = new SUEY.Text(SUEY.Strings.capitalize(label) + ':');
            labelBox.addClass('suey-number-label-box');
            numberHolder.add(labelBox);
        }

        // Push
        rightWidgets.push(numberHolder);

    /***** TYPE: 'slider' (number) *****/

    } else if (item.type === 'slider') {

        // Widget
        const slider = new SUEY.Slider();
        const slideBox = new SUEY.NumberBox().addClass('suey-property-tiny-row');

        // Event
        slider.on('input', () => {
            value = slider.getValue();
            updateComponent(item, propKey, value, true /* forceSmall */);
            slideBox.setValue(value);
        });

        slider.on('change', () => {
            value = slider.getValue();
            updateComponent(item, propKey, value);
            slideBox.setValue(value);
        });

        slideBox.on('change', () => {
            value = slideBox.getValue();
            updateComponent(item, propKey, value);
            slider.setValue(value);
        });

        // Init
        let min = item['min'] ?? 0;
        let max = item['max'] ?? 100;
        let step = item['step'] ?? 'any';
        let precision = item['precision'] ?? 2;
        slider.setRange(min, max).setStep(step).setPrecision(precision);
        if (step === 'any') {
            step = (Number.isFinite(max) && Number.isFinite(min)) ? (max - min) / 20 : 1;
        }
        slideBox.setRange(min, max).setStep(step).setPrecision(precision);
        slideBox.setStyle('marginLeft', WIDGET_SPACING);
        slider.setValue(value);
        slideBox.setValue(value);

        let digits = SUEY.Strings.countDigits(parseInt(max)) + precision;
        if (precision > 0) digits += 0.5;
        slideBox.dom.style.setProperty('--min-width', `${digits + 1.5}ch`);

        // Push
        rightWidgets.push(slider, slideBox);

    /***** TYPE: 'variable' (number +/- another number) *****/

    } else if (item.type === 'variable') {

        // Value
        if (!Array.isArray(value)) value = [ 0, 0 ];
        while (value.length < 2) value.push(0);

        // Widget
        const numberBox = new SUEY.NumberBox();
        const plusMinus = new SUEY.Span().addClass('salt-plus-minus', 'suey-black-or-white');
        plusMinus.add(new SUEY.VectorBox(`${FOLDER_FLOATERS}inspector/variable.svg`));
        const variableBox = new SUEY.NumberBox();
        variableBox.setStyle('flex', '2 2 auto');
        variableBox.setStyle('min-width', '5ch');

        // Event
        function numberBoxesChanged() {
            value = [ parseFloat(numberBox.getValue()), parseFloat(variableBox.getValue()) ];
            updateComponent(item, propKey, value);
        }
        numberBox.on('change', numberBoxesChanged);
        variableBox.on('change', numberBoxesChanged);

        // Init
        const boxes = [ numberBox, variableBox ];
        for (let i = 0; i < 2; i++) {
            const box = boxes[i];
            let min = (Array.isArray(item['min']) ? item['min'][i] : item['min']) ?? -Infinity;
            let max = (Array.isArray(item['max']) ? item['max'][i] : item['max']) ?? Infinity;
            let step = (Array.isArray(item['step']) ? item['step'][i] : item['step']) ?? 1;
            let unit = (Array.isArray(item['unit']) ? item['unit'][i] : item['unit']) ?? '';
            let precision = (Array.isArray(item['precision']) ? item['precision'][i] : item['precision']) ?? 3;
            if (step === 'grid') step = parseFloat(editor.viewport()?.gridSize() ?? 0);
            box.setRange(min, max).setStep(step).setUnit(unit).setPrecision(precision);
            box.setValue(value[i]);
        }

        // Push
        rightWidgets.push(numberBox, plusMinus, variableBox);

    /***** TYPE: 'vector' (number array) *****/

    } else if (item.type === 'vector') {

        // Value
        if (!Array.isArray(value)) value = [ 0 ];
        const arraySize = item['size'] ?? 1;
        while (value.length < arraySize) value.push(0);

        // Arrays
        const arrayBoxes = [];
        const originalValues = [];

        // Aspect Ratio Lock Button
        let aspectLocked = false;
        const aspectButtonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');
        const lockAspect = new SUEY.Button().addClass('suey-borderless-button').setStyle('font-size', '90%');
        const lockIcon = new SUEY.VectorBox(`${FOLDER_MENU}lock.svg`);
        const unlockIcon = new SUEY.VectorBox(`${FOLDER_MENU}unlock.svg`);
        function setAspectIconColors() {
            const filterLock = ColorizeFilter.fromColor(SUEY.ColorScheme.color(SUEY.TRAIT.TEXT));
            unlockIcon.setStyle('filter', `${filterLock}`);
            lockIcon.setStyle('filter', `${filterLock}`);
        }
        function setAspectIconState() {
            lockIcon.setStyle('opacity', (aspectLocked) ? '1' : '0');
            unlockIcon.setStyle('opacity', (aspectLocked) ? '0' : '1');
            lockAspect.setAttribute('tooltip', (aspectLocked) ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio');
        }
        // Show Button?
        if (item['aspect']) {
            aspectLocked = true;
            leftWidgets.push(aspectButtonRow);
            // Setup
            lockAspect.add(new SUEY.ShadowBox(lockIcon, unlockIcon));
            lockAspect.on('pointerdown', () => {
                aspectLocked = !aspectLocked;
                if (aspectLocked) {
                    setArrayFromBoxes(originalValues);
                }
                setAspectIconState();
            });
            aspectButtonRow.add(new SUEY.FlexSpacer(), lockAspect);
            setAspectIconColors();
            setAspectIconState();
            // Signals
            signals.schemeChanged.add(setAspectIconColors);
            propertyList.on('destroy', function() {
                signals.schemeChanged.remove(setAspectIconColors);
            });
        }

        // Helpers
        function setArrayFromBoxes(toArray) {
            for (let j = 0; j < arrayBoxes.length; j++) {
                toArray[j] = parseFloat(arrayBoxes[j].getValue());
            }
        }

        // Widget
        for (let i = 0; i < arraySize; i++) {
            const numberHolder = new SUEY.Span().addClass('suey-number-holder');
            const numberBox = new SUEY.NumberBox();
            numberHolder.add(numberBox);
            arrayBoxes.push(numberBox);

            // Style
            if (item['tint']) {
                switch (i) {
                    case 0: numberBox.setStyle('color', 'rgb(var(--triadic1))'); break;
                    case 1: numberBox.setStyle('color', 'rgb(var(--triadic2))'); break;
                    case 2: numberBox.setStyle('color', 'rgb(var(--complement))'); break;
                    case 3: numberBox.setStyle('color', 'rgb(var(--triadic3))'); break;
                }
            }

            // Event
            numberBox.on('change', () => {
                if (aspectLocked) {
                    const newValue = parseFloat(arrayBoxes[i].getValue());
                    for (let j = 0; j < arrayBoxes.length; j++) {
                        if (j === i) continue;
                        const ratio = originalValues[j] / originalValues[i];
                        if (!isNaN(ratio) && isFinite(ratio)) {
                            arrayBoxes[j].setValue(newValue * ratio);
                        }
                    }
                }
                setArrayFromBoxes(value);
                updateComponent(item, propKey, value);
            });

            // Init
            let min = (Array.isArray(item['min']) ? item['min'][i] : item['min']) ?? -Infinity;
            let max = (Array.isArray(item['max']) ? item['max'][i] : item['max']) ?? Infinity;
            let step = (Array.isArray(item['step']) ? item['step'][i] : item['step']) ?? 1;
            let unit = (Array.isArray(item['unit']) ? item['unit'][i] : item['unit']) ?? '';
            let label = (Array.isArray(item['label']) ? item['label'][i] : item['label']) ?? '';
            let precision = (Array.isArray(item['precision']) ? item['precision'][i] : item['precision']) ?? 3;
            if (step === 'grid') step = parseFloat(editor.viewport()?.gridSize() ?? 0);
            arrayBoxes[i].setRange(min, max).setStep(step).setUnit(unit).setPrecision(precision);
            arrayBoxes[i].setValue(value[i]);

            if (String(label) !== '') {
                numberBox.setStyle('text-align', 'right');
                const labelBox = new SUEY.Text(SUEY.Strings.capitalize(label) + ':');
                labelBox.addClass('suey-number-label-box');
                numberHolder.add(labelBox);
            }

            // Push
            rightWidgets.push(numberHolder);
        }

        // Set Original Aspect Values
        setArrayFromBoxes(originalValues);

    /***** TYPE: 'boolean' (boolean) *****/

    } else if (item.type === 'boolean') {

        // Widget
        const boolBox = new SUEY.Checkbox();

        // Event
        boolBox.on('change', () => {
            value = boolBox.getValue();
            updateComponent(item, propKey, value);
        });

        // Init
        boolBox.setValue(value);

        // Push
        rightWidgets.push(boolBox, new SUEY.FlexSpacer());

    /***** TYPE: 'option' (boolean array) *****/

    } else if (item.type === 'option') {

        // Value
        if (!Array.isArray(value)) value = [ false ];
        const arraySize = item['size'] ?? 1;
        while (value.length < arraySize) value.push(false);

        // Arrays
        const arrayBoxes = [];
        const originalValues = [];

        // Helpers
        function setArrayFromBoxes(toArray) {
            for (let j = 0; j < arrayBoxes.length; j++) {
                toArray[j] = Boolean(arrayBoxes[j].getValue());
            }
        }

        // Widget
        for (let i = 0; i < arraySize; i++) {
            const boolHolder = new SUEY.Span().addClass('suey-number-holder');
            const boolBox = new SUEY.Checkbox();
            boolHolder.add(boolBox);
            arrayBoxes.push(boolBox);

            // Style
            if (item['tint'] && i < 4) {
                let bgColor = '';
                switch (i) {
                    case 0: bgColor = 'var(--triadic1)'; break;
                    case 1: bgColor = 'var(--triadic2)'; break;
                    case 2: bgColor = 'var(--complement)'; break;
                    case 3: bgColor = 'var(--triadic3)'; break;
                }
                SUEY.Css.setVariable('--bg-color-light', bgColor, boolBox.button);
                SUEY.Css.setVariable('--bg-color-dark', bgColor, boolBox.button);
            }

            // Event
            boolBox.on('change', () => {
                setArrayFromBoxes(value);
                updateComponent(item, propKey, value);
            });

            // Init
            arrayBoxes[i].setValue(value[i]);

            // Push
            rightWidgets.push(boolHolder);
        }

        // Set Original Aspect Values
        setArrayFromBoxes(originalValues);

    /***** TYPE: 'color' (hex value) *****/

    } else if (item.type === 'color') {

        // Widget
        const colorButton = new SUEY.Color();

        // Event
        colorButton.on('input', () => {
            value = colorButton.getHexValue();
            updateComponent(item, propKey, value, true /* forceSmall */);
        });

        colorButton.on('change', () => {
            value = colorButton.getHexValue();
            updateComponent(item, propKey, value);
        });

        // Init
        colorButton.setValue(value);

        // Push
        rightWidgets.push(colorButton);

    /***** TYPE: 'string' *****/

    } else if (item.type === 'string') {

        // Widget
        let stringBox;
        const rows = parseFloat(item['rows']);
        if (!Number.isNaN(rows) && Number.isFinite(rows) && rows > 1) {
            stringBox = new SUEY.TextArea();
            stringBox.setStyle('min-width', '100%');
            stringBox.setStyle('min-height', 'var(--row-height)');
            stringBox.dom.rows = String(rows);
        } else {
            stringBox = new SUEY.TextBox();
        }

        // Event
        stringBox.on('change', () => {
            value = stringBox.getValue();
            updateComponent(item, propKey, value);
        });

        // Init
        stringBox.setValue(value);

        // Push
        rightWidgets.push(stringBox);

    /***** TYPE: 'key' (keyboard key) *****/

    } else if (item.type === 'key') {

        // Widget
        const stringBox = new SUEY.TextBox().setStyle('flex', '1');
        const flexSpacer = new SUEY.FlexSpacer().setStyle('flex', '1');
        stringBox.addClass('salt-key-input');

        // Event
        stringBox.on('keydown', (event) => {
            event.stopPropagation();
            event.preventDefault();
            value = event.key;
            updateComponent(item, propKey, value);
            setKeyBoxText(value);
        });
        stringBox.on('keyup', (event) => {
            event.stopPropagation();
            event.preventDefault();
        });

        // Init
        function setKeyBoxText(keyText) {
            let newText = keyText;
            if (newText === ' ') newText = '" "';
            stringBox.setValue(newText);
        }
        setKeyBoxText(value);

        // Push
        rightWidgets.push(stringBox, flexSpacer);

    /***** TYPE: 'asset' (string, i.e. asset.uuid, texture.uuid, prefab.uuid, etc.) *****/

    } else if (item.type === 'asset') {

        // Asset / Prefab Type
        let asset = SALT.AssetManager.get(value);
        const className = item['class'] ?? item.type;
        const typeClassName = SUEY.Strings.capitalize(className);

        // Widget
        const textBox = new SUEY.TextBox();
        textBox.dom.disabled = true;

        const clearButton = new SUEY.Button();
        clearButton.addClass('suey-property-button');
        clearButton.add(new SUEY.ShadowBox(`${FOLDER_MENU}delete.svg`).addClass('suey-triadic-colorize'));
        clearButton.setAttribute('tooltip', 'Clear');

        // REFRESH ASSET //
        const refreshButtonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 var(--pad-medium)');
        const refreshAsset = new SUEY.Button().addClass('suey-borderless-button');
        refreshAsset.setAttribute('tooltip', `Refresh ${typeClassName}`);
        refreshAsset.setStyle('font-size', '90%');
        const refreshIcon = new SUEY.VectorBox(`${FOLDER_MENU}reset.svg`);

        // Button: Coloring
        const setIconColors = function() {
            const filterLock = ColorizeFilter.fromColor(SUEY.ColorScheme.color(SUEY.TRAIT.TEXT));
            refreshIcon.setStyle('filter', `${filterLock}`);
        };
        setIconColors();

        // Button: Visible?
        function scriptChanged(changedType, script) {
            if (changedType !== 'script') return;
            setRefreshButtonState(script && asset && script.uuid === asset.uuid);
        }
        function setRefreshButtonState(visible = true) {
            refreshAsset.setStyle('display', (visible) ? '' : 'none');
            refreshAsset.setStyle('pointer-events', (visible) ? 'all' : 'none');
        }
        setRefreshButtonState(false);

        // Button: Signals
        signals.assetChanged.add(scriptChanged);
        signals.schemeChanged.add(setIconColors);
        propertyList.on('destroy', function() {
            signals.assetChanged.remove(scriptChanged);
            signals.schemeChanged.remove(setIconColors);
        });

        // Button: Click
        refreshAsset.add(new SUEY.ShadowBox(refreshIcon));
        refreshAsset.onPress(() => {
            const component = propertyList._component;
            if (!component) return;
            const newData = component.toJSON();
            const cmds = [];
            cmds.push(new ChangeComponentCommand(component, newData));
            editor.execute(new MultiCmdsCommand(cmds, `Refresh Script Component`));
            setRefreshButtonState(false);
        });
        refreshButtonRow.add(new SUEY.FlexSpacer(), refreshAsset);

        // REFRESH TYPES: script
        if (className === 'script') {
            leftWidgets.push(refreshButtonRow);
        }
        //////////

        // Event
        textBox.on('pointerdown', () => {
            if (asset) {
                const verifyType = SALT.AssetManager.checkType(asset);
                signals.assetSelect.dispatch(verifyType, asset);
            }
        });

        let textBoxValue;
        textBox.on('dragenter', () => {
            if (textBox.hasClass('suey-disabled')) return;
            textBoxValue = textBox.getValue();
            textBox.setValue(`${typeClassName}`);
            const uuid = editor.dragInfo;
            const checkAsset = SALT.AssetManager.get(uuid);
            textBox.addClass(checkItemType(checkAsset) ? 'suey-yes-drop' : 'suey-no-drop');
        });

        textBox.on('dragleave', () => {
            if (textBox.hasClass('suey-disabled')) return;
            textBox.setValue(textBoxValue);
            textBox.removeClass('suey-yes-drop', 'suey-no-drop');
        });

        textBox.on('drop', (event) => {
            textBox.removeClass('suey-yes-drop', 'suey-no-drop');
            event.preventDefault();
            event.stopPropagation();
            if (textBox.hasClass('suey-disabled')) return;
            const uuid = event.dataTransfer.getData('text/plain');
            const checkAsset = SALT.AssetManager.get(uuid);
            if (checkItemType(checkAsset)) {
                asset = checkAsset;
                value = uuid;
                updateComponent(item, propKey, value);
            }
            updateName();
        });

        clearButton.onPress(() => {
            asset = undefined;
            value = null;
            updateComponent(item, propKey, value);
            updateName();
        });

        // Helpers
        function checkItemType(asset) {
            if (!asset) return false;
            if (className === 'asset') return true;
            return (SALT.AssetManager.checkType(asset) === className);
        }

        function updateName() {
            if (checkItemType(asset)) {
                textBox.addClass('suey-valid-type');
                textBox.removeClass('suey-invalid-type');
                textBox.setValue(asset.name);
            } else {
                textBox.removeClass('suey-valid-type');
                textBox.addClass('suey-invalid-type');
                textBox.setValue('None');
            }
        }

        // Init
        updateName();

        // Push
        rightWidgets.push(textBox, clearButton);

    /***** TYPE: 'object' (variable array) *****/

    } else if (item.type === 'object') {

        // Empty
        if (Object.keys(value).length === 0) {
            rowWidgets.push(new SUEY.Text('No Variables').setDisabled(true));
        }

        // Widgets
        for (let key in value) {
            const variableItem = value[key];

            function variableUpdate(varItem, varKey, varValue, forceSmall = false) {
                value[key].value = varValue;
                updateComponent(item, propKey, value, forceSmall);
            }

            addProperty(propertyList, variableItem.value, key, variableItem, variableUpdate);
        }

    /***** FUTURE *****/

    } else {

        // MORE TO DO!

    }

    /***** BUILD ROW *****/

    // Add Widgets as Row
    if (rowWidgets.length > 0) {
        const propertyRow = propertyList.addRowWithoutTitle(...rowWidgets);

    // Add Widgets as Right Column, with optional Left Column widgets
    } else if (rightWidgets.length > 0) {
        const baseName = item['alias'] ?? propKey;
        const itemName = SUEY.Strings.addSpaces(SUEY.Strings.capitalize(baseName));
        const propertyRow = propertyList.addRow(itemName, ...rightWidgets);

        propertyRow.on('pointerenter', () => {
            const info = item.info ?? Language.getKey('advisor/empty');
            Signals.dispatch('advisorInfo', itemName, info);
        });

        if (leftWidgets.length > 0) {
            propertyRow.leftWidget.setStyle('position', 'relative');
            propertyRow.leftWidget.add(...leftWidgets);
        }
    }

    // Save Last Processed Type
    lastAddedType = item.type;
    return;
}

import { Button } from '../input/Button.js';
import { Element } from '../core/Element.js';
import { Div } from '../core/Div.js';
import { Iris } from '../utils/Iris.js';

const _color = new Iris();

class Color extends Button {

    constructor() {
        super();
        const self = this;
        this.addClass('osui-color-button');
        this.addClass('osui-drop-arrow');

        // Color Input

        const colorBox = new Element(document.createElement('input'));
        colorBox.setClass('osui-input');
        colorBox.addClass('osui-color-input-button');
        colorBox.dom.setAttribute('autocomplete', 'off');
        try { colorBox.dom.type = 'color'; } catch(exception) {}
        this.add(colorBox);

        // Color Background

        const colorBackground = new Div().addClass('osui-drop-color');
        colorBackground.setStyle('backgroundColor', colorBox.dom.value);
        this.add(colorBackground);

        // Child Element Events

        let selected = false;
        function colorBoxClick(event) {
            if (!selected) {
                self.addClass('osui-selected');
                selected = true;
            } else {
                event.stopPropagation();
                event.preventDefault();
                colorBox.blur();
            }
        }

        function colorBoxInput() {
            colorBackground.setStyle('backgroundColor', colorBox.dom.value);
            self.dom.setAttribute('tooltip', colorBox.dom.value);
        }

        function colorBoxBlur() {
            self.removeClass('osui-selected');
            selected = false;
        }

        colorBox.onClick(colorBoxClick);
        colorBox.onInput(colorBoxInput);
        colorBox.dom.addEventListener('blur', colorBoxBlur);
        colorBox.dom.addEventListener('focusout', colorBoxBlur);

        // Member Functions

        /** Returns value as hex string, i.e. '#ff0000' */
        this.getValue = function() {
            if (!colorBox.dom) return 0;
            return colorBox.dom.value;
        };

        /** Returns value as integer, i.e. 16711680 (equivalent to 0xff0000) */
        this.getHexValue = function() {
            if (!colorBox.dom) return 0;
            _color.set(colorBox.dom.value);
            return _color.hex();
        };

        this.setValue = function(value) {
            if (!colorBox.dom) return this;
            _color.set(value);
            colorBox.dom.value = _color.hexString();
            colorBackground.setStyle('backgroundColor', colorBox.dom.value);
            self.dom.setAttribute('tooltip', colorBox.dom.value);
            return this;
        };

        // Init

        this.setValue(0xffffff);

    }

}

export { Color };

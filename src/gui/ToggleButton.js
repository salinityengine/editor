import * as SUEY from 'gui';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

class ToggleButton extends SUEY.Button {

    constructor(icon = '', tip, configKey, callback = () => {}) {
        super(null, false /* closesMenus */);
        const self = this;
        this.setClass('suey-toolbar-button', 'salt-toggle-button');
        this.setStyle('pointerEvents', 'all');
        if (tip) this.setAttribute('tooltip', tip);

        // Contents
        const buttonImageHolder = new SUEY.ShadowBox().setStyle('pointer-events', 'none');
        if (icon && icon !== '') buttonImageHolder.add(new SUEY.VectorBox(icon));
        this.add(buttonImageHolder);

        this.contents = function() { return buttonImageHolder };

        // Events
        this.on('pointerdown', (event) => { event.stopPropagation(); });
        this.on('pointerup', (event) => { event.stopPropagation(); });

        // Toggle
        function setButtonValue() {
            self.wantsClass('suey-toggled', configKey && Config.getKey(configKey));
        }
        this.onPress(() => {
            if (configKey) Config.setKey(configKey, (!Config.getKey(configKey)));
            setButtonValue();
            if (typeof callback === 'function') callback();
        });
        Signals.connect(this, 'settingsRefreshed', setButtonValue)
        setButtonValue();
    }

}

export { ToggleButton };

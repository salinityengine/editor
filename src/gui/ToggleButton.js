import * as SUEY from 'gui';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

class ToggleButton extends SUEY.ToolbarButton {

    constructor(icon = '', tip, configKey, callback = () => {}) {
        super(null, null, false /* addBackground */, false /* closesMenus? */);
        const self = this;
        this.addClass('salt-toggle-button');
        this.add(new SUEY.VectorBox(icon));
        if (tip) this.setAttribute('tooltip', tip);

        function setButtonValue() {
            self.removeClass('suey-toggled');
            if (configKey && Config.getKey(configKey)) self.addClass('suey-toggled');
        }

        // Toggle
        this.onClick(() => {
            if (configKey) Config.setKey(configKey, (!Config.getKey(configKey)));
            setButtonValue();
            if (typeof callback === 'function') callback();
        });

        Signals.connect(this, 'settingsRefreshed', setButtonValue)
        setButtonValue();
    }

}

export { ToggleButton };

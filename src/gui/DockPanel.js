import * as SUEY from 'gui';
import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

/** Used for Dock panels (Advisor, Explorer, Inspector, Preview, etc.) */
class DockPanel extends SUEY.Tabbed {

    #displayEmpty = true;

    constructor({
        displayEmpty = true,
        style = SUEY.PANEL_STYLES.FANCY,
        resizers = [],
        startWidth = null,
        startHeight = null,
        minWidth = 0,
        maxWidth = Infinity,
        minHeight = 0,
        maxHeight = Infinity,
    } = {}) {
        super({ style, resizers, startWidth, startHeight, minWidth, maxWidth, minHeight, maxHeight });
        const self = this;

        // Private Properties
        this.#displayEmpty = displayEmpty;

        /********** EVENTS */

        this.dom.addEventListener('tab-changed', function(event) {
            const tabName = event.value;
            if (tabName) self.setTabPriority(tabName);
        });

        /********** SIGNALS */

        Signals.connect(this, 'refreshWindows', function () {
            // self.changeWidth(parseFloat(Config.getKey(`resizeX/${self.getName()}`)) * SUEY.Css.guiScale());
            // self.changeHeight(parseFloat(Config.getKey(`resizeY/${self.getName()}`)) * SUEY.Css.guiScale());
        });
    }

    /******************** SIZE */

    changeWidth(width) {
        width = super.changeWidth(width);
        if (width != null) Config.setKey(`resizeX/${this.getName()}`, (width / SUEY.Css.guiScale()).toFixed(3));
    }

    changeHeight(height) {
        height = super.changeHeight(height);
        if (height != null) Config.setKey(`resizeY/${this.getName()}`, (height / SUEY.Css.guiScale()).toFixed(3));
    }

    /******************** TABS */

    /** Select last known tab */
    selectLastKnownTab() {
        let tabArray = Config.getKey(`tabs/${this.getName()}`);
        if (!Array.isArray(tabArray)) tabArray = [];
        for (const tabName of tabArray) {
            if (this.selectTab(tabName) === true) return;
        }
        if (this.selectTab(this.defaultTab) === true) return;
        this.selectFirst();
    }

    setTabPriority(tabName) {
        // Get existing tab array from settings
        let tabArray = Config.getKey(`tabs/${this.getName()}`);
        if (!Array.isArray(tabArray)) tabArray = [];

        // Remove existing tab location if found, then set at front
        const tabIndex = tabArray.indexOf(tabName);
        if (tabIndex !== -1) tabArray.splice(tabIndex, 1);
        tabArray.unshift(tabName);

        // Update settings
        Config.setKey(`tabs/${this.getName()}`, tabArray);
    }

}

export { DockPanel };

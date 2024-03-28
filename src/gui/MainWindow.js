import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { InfoBox } from './InfoBox.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

class MainWindow extends SUEY.Docker {

    constructor() {
        super();
        const self = this;
        this.addClass('salt-disable-animations');

        // Input
        this.keyStates = {                                      // Track modifier keys
            'alt': false,
            'control': false,
            'meta': false,
            'shift': false,
            'space': false,
        };
        this.modifierKey = false;                               // True when currently a modifier key pressed

        // InfoBox
        this.infoBox = new InfoBox();
        this.add(this.infoBox);

        // // TODO: Tab Priority
        // this.on('tab-changed', (event) => {
        //     const tabName = event.value;
        //     if (tabName) self.setTabPriority(tabName);
        // });

        // // TODO: Reset Dock Widths
        // Signals.connect(this, 'refreshWindows', function () {
        //     // self.changeWidth(parseFloat(Config.getKey(`resizeX/${self.name}`)) * SUEY.Css.guiScale());
        //     // self.changeHeight(parseFloat(Config.getKey(`resizeY/${self.name}`)) * SUEY.Css.guiScale());
        // });

        // // TODO: Save Dock Sizes
        // changeWidth(width) {
        //     width = super.changeWidth(width);
        //     if (width != null) Config.setKey(`resizeX/${this.name}`, (width / SUEY.Css.guiScale()).toFixed(3));
        // }
        // changeHeight(height) {
        //     height = super.changeHeight(height);
        //     if (height != null) Config.setKey(`resizeY/${this.name}`, (height / SUEY.Css.guiScale()).toFixed(3));
        // }

        // Setup Look / Mode
        this.refreshSettings(); // also selects none

        // Allow Button Animations
        setTimeout(() => self.removeClass('salt-disable-animations'), 1000);
    }

    // // TODO: Select Last Known Tab
    // selectLastKnownTab() {
    //     let tabArray = Config.getKey(`tabs/${this.name}`);
    //     if (!Array.isArray(tabArray)) tabArray = [];
    //     for (const tabName of tabArray) {
    //         if (this.selectTab(tabName) === true) return;
    //     }
    //     if (this.selectTab(this.defaultTab) === true) return;
    //     this.selectFirst();
    // }

    // TODO: Set Tab Prioriy
    // setTabPriority(tabName) {
    //     // Get existing tab array from settings
    //     let tabArray = Config.getKey(`tabs/${this.name}`);
    //     if (!Array.isArray(tabArray)) tabArray = [];
    //     // Remove existing tab location if found, then set at front
    //     const tabIndex = tabArray.indexOf(tabName);
    //     if (tabIndex !== -1) tabArray.splice(tabIndex, 1);
    //     tabArray.unshift(tabName);
    //     // Update settings
    //     Config.setKey(`tabs/${this.name}`, tabArray);
    // }

    /******************** GUI ********************/

    /** Settings were changed, refresh app (color, font size, etc.), dispatch signals */
    refreshSettings() {
        // Font Size Update
        this.fontSizeChange(Config.getKey('scheme/fontSize'));

        // Color Scheme
        this.setSchemeBackground(Config.getKey('scheme/background'));
        const schemeColor = Config.getKey('scheme/iconColor');
        const schemeTint = Config.getKey('scheme/backgroundTint');
        const schemeSaturation = Config.getKey('scheme/backgroundSaturation');
        this.setSchemeColor(schemeColor, schemeTint, schemeSaturation);

        // Transparency
        const panelAlpha = Math.max(Math.min(parseFloat(Config.getKey('scheme/panelTransparency')), 1.0), 0.0);
        SUEY.Css.setVariable('--panel-transparency', panelAlpha);

        // Grids
        Signals.dispatch('gridChanged');

        // Tabs
        this.traverse((child) => {
            if (child.isElement && child.hasClass('suey-tabbed')) {
                child.selectLastKnownTab();
            }
        }, false /* applyToSelf */);

        // Mouse Modes
        Signals.dispatch('mouseModeChanged', Config.getKey('scene/viewport/mode'));
        Signals.dispatch('transformModeChanged', Config.getKey('scene/controls/mode'));

        // Rebuild Inspector / Preview from Existing Items
        Signals.dispatch('inspectorBuild', 'rebuild');
        Signals.dispatch('promodeChanged');

        // Refresh Docks
        Signals.dispatch('refreshWindows');
        Signals.dispatch('settingsRefreshed');
    }

    fontSizeChange(fontSize) {
        if (fontSize === 'up' || fontSize === 'increase') {
            let addSize = Math.floor((SUEY.Css.fontSize() + 10.0) / 10.0);
            fontSize = Math.min(EDITOR.FONT_SIZE_MAX, SUEY.Css.fontSize() + addSize);
        } else if (fontSize === 'down' || fontSize === 'decrease') {
            let addSize = Math.floor((SUEY.Css.fontSize() + 10.0) / 10.0);
            addSize = Math.floor((SUEY.Css.fontSize() - addSize + 10.0) / 10.0);
            fontSize = Math.max(EDITOR.FONT_SIZE_MIN, SUEY.Css.fontSize() - addSize);
        } else {
            fontSize = parseInt(fontSize);
        }
        fontSize = SALT.Maths.clamp(fontSize, EDITOR.FONT_SIZE_MIN, EDITOR.FONT_SIZE_MAX);
        Config.setKey('scheme/fontSize', SUEY.Css.toPx(fontSize));
        SUEY.Css.setVariable('--font-size', SUEY.Css.toPx(fontSize));
        Signals.dispatch('fontSizeChanged');
    }

    cycleSchemeBackground() {
        let background = parseInt(Config.getKey('scheme/background'), 10);
        if (background == SUEY.BACKGROUNDS.DARK) background = SUEY.BACKGROUNDS.MID;
        else if (background == SUEY.BACKGROUNDS.MID) background = SUEY.BACKGROUNDS.LIGHT;
        else background = SUEY.BACKGROUNDS.DARK;
        this.setSchemeBackground(background);
    }

    setSchemeBackground(background = SUEY.BACKGROUNDS.DARK, updateSettings = true) {
        if (updateSettings) {
            Config.setKey('scheme/background', background);
        }
        SUEY.ColorScheme.changeBackground(background);
        Signals.dispatch('schemeChanged');
    }

    setSchemeColor(color = SUEY.THEMES.CLASSIC, tint = 0.0, saturation = 0.0, updateSettings = true) {
        if (updateSettings) {
            Config.setKey('scheme/iconColor', color);
            Config.setKey('scheme/backgroundTint', tint);
            Config.setKey('scheme/backgroundSaturation', saturation);
        }
        SUEY.ColorScheme.changeColor(color, tint, saturation);
        Signals.dispatch('schemeChanged');
    }

    /******************** KEYBOARD ********************/

    checkKeyState(/* any number of comma separated EDITOR.KEYS */) {
        let keyDown = false;
        for (const key of arguments) {
            keyDown = keyDown || this.keyStates[key];
        }
        return keyDown;
    }

    isOnlyModifierKey(key) {
        let keyCount = 0;
        Object.keys(this.keyStates).forEach((modifier) => {
            if (this.keyStates[modifier]) keyCount++;
        });
        return (keyCount === 1 && this.keyStates[key]);
    }

    noModifiers() {
        return this.modifierKey === false;
    }

    updateModifiers(event) {
        if (!event) return;
        this.setKeyState(EDITOR.KEYS.ALT, event.altKey);
        this.setKeyState(EDITOR.KEYS.CONTROL, event.ctrlKey);
        this.setKeyState(EDITOR.KEYS.META, event.metaKey);
        this.setKeyState(EDITOR.KEYS.SHIFT, event.shiftKey);
    }

    setKeyState(key, keyDown) {
        this.keyStates[key] = keyDown;
        this.modifierKey =
            this.keyStates[EDITOR.KEYS.ALT] ||
            this.keyStates[EDITOR.KEYS.CONTROL] ||
            this.keyStates[EDITOR.KEYS.META] ||
            this.keyStates[EDITOR.KEYS.SHIFT] ||
            this.keyStates[EDITOR.KEYS.SPACE];
    }

    /******************** PANELS ********************/

    /** If tab (floater panel) is present in Editor, ensures tab is active */
    selectPanel(tabID = '') {
        if (tabID && tabID.isElement) tabID = tabID.id;
        const panel = this.getPanelByID(tabID);
        if (panel && panel.dock) panel.dock.selectTab(tabID);
    }

    /** Display temporary, centered tooltip */
    showInfo(info) {
        if (this.infoBox) this.infoBox.popupInfo(info);
        return this;
    }

}

export { MainWindow };

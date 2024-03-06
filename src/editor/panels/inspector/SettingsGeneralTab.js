import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Advice } from '../../config/Advice.js';
import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';

const _color = new SUEY.Iris();

class SettingsGeneralTab extends SUEY.Titled {

    constructor() {
        super({ title: Language.getKey('inspector/settings/title') });
        Advice.attach(this.tabTitle, 'settings');

        // Property Box
        const props = new SUEY.PropertyList();
        this.add(props);

        /***** GENERAL *****/

        const generalHeader = props.addHeader(Language.getKey('inspector/settings/general'), `${EDITOR.FOLDER_INSPECTOR}settings/general/general.svg`);
        Advice.attach(generalHeader, 'settings/general');

        // Language
        const languageOptions = {
            en: 'English',
            fr: 'Français',
            zh: '中文',
        };
        const languageDropDown = new SUEY.Dropdown();
        languageDropDown.overflowMenu = SUEY.OVERFLOW.LEFT;
        languageDropDown.setOptions(languageOptions);
        languageDropDown.onChange(() => {
            Config.setKey('settings/language', languageDropDown.getValue());
            signals.refreshSettings.dispatch();
        });
        const languageRow = props.addRow(Language.getKey('inspector/settings/language'), languageDropDown);
        Advice.attach(languageRow, 'settings/general/language');

        // ProMode
        //              List of Changes Below
        //
        //      - Show UUID of Objects in the Inspector
        //      - More options in the Material / Geometry components
        //      - THREE Tab (fps, renderer info)
        //      - Extra 'Settings' options
        //
        //
        const promodeBox = new SUEY.Checkbox().onChange(() => {
            Config.setKey('promode', (!Config.getKey('promode')));
            signals.promodeChanged.dispatch();
        });
        const promodeRow = props.addRow('Pro Mode', promodeBox);
        Advice.attach(promodeRow, 'settings/general/promode');

        /***** STYLE *****/

        const styleHeader = props.addHeader(Language.getKey('inspector/settings/style'), `${EDITOR.FOLDER_INSPECTOR}settings/general/style.svg`);
        Advice.attach(styleHeader, 'settings/style');

        // THEME //

        const themeButton = new SUEY.Button().addClass('osui-dropdown', 'osui-drop-arrow');
        themeButton.overflowMenu = SUEY.OVERFLOW.LEFT;
        themeButton.menuOffsetY = 3;
        const themeBackground = new SUEY.Div().addClass('osui-drop-color');
        themeButton.add(themeBackground);

        // Theme Menu
        const themeMenu = new SUEY.Menu();
        const schemeDark = new SUEY.MenuItem('Dark', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/dark.svg`).keepOpen();
        const schemeMid = new SUEY.MenuItem('Mid', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/mid.svg`).keepOpen();
        const schemeLight = new SUEY.MenuItem('Light', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/light.svg`).keepOpen();
        themeMenu.add(schemeDark, schemeMid, schemeLight);

        // Theme Events
        function setTheme(theme) {
            editor.setSchemeBackground(theme);
            updateUI();
        }
        schemeDark.onSelect(() => setTheme(SUEY.BACKGROUNDS.DARK));
        schemeMid.onSelect(() => setTheme(SUEY.BACKGROUNDS.MID));
        schemeLight.onSelect(() => setTheme(SUEY.BACKGROUNDS.LIGHT));

        // Add Theme Menu, Button
        themeButton.attachMenu(themeMenu, true /* popupStyle */);
        const themeRow = props.addRow('Theme', themeButton);
        Advice.attach(themeRow, 'settings/style/theme');

        // COLOR //

        const colorButton = new SUEY.Button().addClass('osui-dropdown', 'osui-drop-arrow');
        colorButton.overflowMenu = SUEY.OVERFLOW.LEFT;
        colorButton.menuOffsetY = 4;
        const colorBackground = new SUEY.Div().addClass('osui-drop-color');
        colorButton.add(colorBackground);

        // Color Menu
        const colorMenu = new SUEY.Menu();
        const schemeClassic = new SUEY.MenuItem('Classic', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/classic.svg`).keepOpen();
        const schemeSteel = new SUEY.MenuItem('Steel', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/light.svg`).keepOpen();
        const schemeNavy = new SUEY.MenuItem('Navy', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/navy.svg`).keepOpen();
        const schemeGrape = new SUEY.MenuItem('Grape', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/grape.svg`).keepOpen();
        const schemeFlamingo = new SUEY.MenuItem('Flamingo', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/flamingo.svg`).keepOpen();
        const schemeRust = new SUEY.MenuItem('Rust', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/rust.svg`).keepOpen();
        const schemeCarrot = new SUEY.MenuItem('Carrot', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/carrot.svg`).keepOpen();
        const schemeCoffee = new SUEY.MenuItem('Coffee', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/coffee.svg`).keepOpen();
        const schemeGolden = new SUEY.MenuItem('Golden', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/golden.svg`).keepOpen();
        const schemeEmerald = new SUEY.MenuItem('Emerald', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/emerald.svg`).keepOpen();
        const schemeRandom = new SUEY.MenuItem('Random', `${EDITOR.FOLDER_INSPECTOR}settings/general/style/random.svg`).keepOpen();
        colorMenu.add(schemeClassic, schemeSteel, schemeNavy, schemeGrape, schemeFlamingo, schemeRust,
            schemeCarrot, schemeCoffee, schemeGolden, schemeEmerald, schemeRandom);

        // Color Events
        function setColor(color, tint, saturation) {
            editor.setSchemeColor(color, tint, saturation);
            updateUI();
        }
        schemeClassic.onSelect(() => setColor(SUEY.THEMES.CLASSIC, 0.00));
        schemeSteel.onSelect(() => setColor(SUEY.THEMES.STEEL, 0.10, -1.0));
        schemeFlamingo.onSelect(() => setColor(SUEY.THEMES.FLAMINGO, 0.10));
        schemeNavy.onSelect(() => setColor(SUEY.THEMES.NAVY, 0.20));
        schemeGrape.onSelect(() => setColor(SUEY.THEMES.GRAPE, 0.15));
        schemeRust.onSelect(() => setColor(SUEY.THEMES.RUST, 0.20));
        schemeCarrot.onSelect(() => setColor(SUEY.THEMES.CARROT, 0.20));
        schemeCoffee.onSelect(() => setColor(SUEY.THEMES.COFFEE, 0.20));
        schemeGolden.onSelect(() => setColor(SUEY.THEMES.GOLDEN, 0.15));
        schemeEmerald.onSelect(() => setColor(SUEY.THEMES.EMERALD, 0.10));
        schemeRandom.onSelect(() => setColor(SUEY.Iris.randomHex(), 0.10));

        // Add Color Menu and Button
        colorButton.attachMenu(colorMenu, true /* popupStyle */);
        const colorRow = props.addRow('Color', colorButton);
        Advice.attach(colorRow, 'settings/style/color');

        // TEXT SIZE //

        // Smaller
        const smallerButton = new SUEY.Button().addClass('osui-property-button-flex').onClick(() => {
            editor.fontSizeChange('down');
        });
        const smallerLabel = 'Smaller'
        const smallerShortcut = '-';
        smallerButton.add(new SUEY.ShadowBox(`${EDITOR.FOLDER_INSPECTOR}settings/general/style/smaller.svg`));
        const smallShortcutText = new SUEY.Div(smallerShortcut).setClass('osui-menu-shortcut');
        smallShortcutText.setDisplay('block').setStyle('textAlign', 'right').setStyle('paddingLeft', '0').setStyle('paddingRight', '0.55em');
        smallerButton.add(smallShortcutText);
        smallerButton.dom.setAttribute('tooltip', Config.tooltip(smallerLabel, smallerShortcut));

        // Larger
        const largerButton = new SUEY.Button().addClass('osui-property-button-flex').onClick(() => {
            editor.fontSizeChange('up');
        });
        const largerLabel = 'Larger'
        const largerShortcut = '+';
        largerButton.add(new SUEY.ShadowBox(`${EDITOR.FOLDER_INSPECTOR}settings/general/style/larger.svg`));
        const largeShortcutText = new SUEY.Div(largerShortcut).setClass('osui-menu-shortcut');
        largeShortcutText.setDisplay('block').setStyle('textAlign', 'right').setStyle('paddingLeft', '0').setStyle('paddingRight', '0.55em');
        largerButton.add(largeShortcutText);
        largerButton.dom.setAttribute('tooltip', Config.tooltip(largerLabel, largerShortcut));

        // Font Button Row
        const textSizeRow = props.addRow('Text Size', smallerButton, largerButton);
        Advice.attach(textSizeRow, 'settings/style/textsize');

        // OPACITY //

        const alphaSlider = new SUEY.Slider();
        alphaSlider.onInput(() => {
            const panelAlpha = SALT.Maths.clamp(parseFloat(alphaSlider.getValue()), 0.0, 1.0);
            Config.setKey('scheme/panelTransparency', panelAlpha);
            SUEY.Css.setVariable('--panel-transparency', panelAlpha);
        });
        alphaSlider.setRange(0, 1.0).setStep('any').setPrecision(2);
        const opacityRow = props.addRow('Opacity', alphaSlider);
        Advice.attach(opacityRow, 'settings/style/opacity');

        /***** RESET *****/

        const resetHeader = props.addHeader('Reset', `${EDITOR.FOLDER_INSPECTOR}settings/general/reset.svg`);
        Advice.attach(resetHeader, 'settings/reset');

        // Reset All Settings
        const resetButton = new SUEY.Button().addClass('osui-property-button').onClick(() => {
            if (confirm('Reset all editor settings to default values?')) {
                Config.clear();
                signals.refreshSettings.dispatch();
            }
        });
        const resetLabel = Language.getKey('inspector/settings/reset');
        const resetShortcut = Config.getKey('shortcuts/reset');
        resetButton.add(new SUEY.ShadowBox(`${EDITOR.FOLDER_INSPECTOR}settings/general/reset.svg`));
        resetButton.dom.setAttribute('tooltip', Config.tooltip(resetLabel, resetShortcut));
        const resetRow = props.addRow(resetLabel, resetButton);
        Advice.attach(resetRow, 'settings/reset');

        /***** UPDATE *****/

        function updateUI() {
            languageDropDown.setValue(Config.getKey('settings/language'));
            promodeBox.setValue(Config.getKey('promode'));

            themeBackground.setStyle('backgroundColor', 'rgb(var(--background-dark))');
            switch (parseInt(Config.getKey('scheme/background'))) {
                case SUEY.BACKGROUNDS.DARK:  themeButton.dom.setAttribute('tooltip', 'Dark'); break;
                case SUEY.BACKGROUNDS.MID:   themeButton.dom.setAttribute('tooltip', 'Mid'); break;
                case SUEY.BACKGROUNDS.LIGHT: themeButton.dom.setAttribute('tooltip', 'Light'); break;
            }

            let color = parseInt(Config.getKey('scheme/iconColor'));
            let saturation = parseFloat(Config.getKey('scheme/backgroundSaturation'));
            let hexColor = _color.set(color).hslOffset(0, saturation, 0).hexString();
            colorBackground.setStyle('backgroundColor', hexColor);
            colorButton.dom.setAttribute('tooltip', hexColor); // _color.cssString());

            let panelAlpha = Config.getKey('scheme/panelTransparency');
            if (panelAlpha === undefined || panelAlpha === null) {
                panelAlpha = 1.0;
                Config.setKey('scheme/panelTransparency', panelAlpha);
            }
            alphaSlider.setValue(panelAlpha);
        }

        /***** SIGNALS *****/

        signals.inspectorUpdate.add(updateUI);

        this.dom.addEventListener('destroy', function() {
            signals.inspectorUpdate.remove(updateUI);
        }, { once: true });

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { SettingsGeneralTab };

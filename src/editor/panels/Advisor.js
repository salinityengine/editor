import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { DockPanel } from '../gui/DockPanel.js';

class Advisor extends DockPanel {

    constructor({
        style = SUEY.PANEL_STYLES.FANCY,
        resizers = [ SUEY.RESIZERS.TOP, SUEY.RESIZERS.RIGHT ],
        startWidth = null,
        startHeight = null,
        minWidth = 0,
        maxWidth = Infinity,
        minHeight = 0,
        maxHeight = Infinity,
    } = {}) {
        super({ style, resizers, startWidth, startHeight, minWidth, maxWidth, minHeight, maxHeight });
        this.setName('Advisor');
        this.addClass('one-advisor');
        this.setTabSide(SUEY.TAB_SIDES.RIGHT);

        /********** WELCOME */

        const welcomeBody = new SUEY.Div().addClass('osui-absolute-box', 'one-advisor-welcome-box');

        // // OPTION: Text
        welcomeBody.setInnerHtml(`
        <div style='font-size: 110%; color: rgb(var(--triadic2));'>Welcome</div>
        <div style='font-size: 110%; color: rgb(var(--triadic1)); padding: 0 0.4em;'>to</div>
        <div style='font-size: 110%; color: rgb(var(--icon));'>Salinity</div>`);

        // // OPTION: Graphics
        // const onsightIris = new SUEY.VectorBox(`${EDITOR.FOLDER_LOGO}iris.svg`);
        // const onsightText = new SUEY.VectorBox(`${EDITOR.FOLDER_LOGO}onsight.svg`);
        // onsightIris.setStyle('opacity', '0.5', 'transform', 'scale(2.2)', 'filter', 'brightness(1)');
        // onsightIris.setStyle('background', 'rgb(var(--icon)');
        // onsightText.setStyle('opacity', '1', 'filter', `brightness(10) var(--drop-shadow)`);
        // welcomeBody.add(onsightIris, onsightText);

        /********** HISTORY */

        const advice = Advice.getKey('advisor');
        const titles = [];
        const bodies = [];
        let active = true;
        let history = 0;
        let maxSize = 25;

        /********** TAB PANEL */

        const icon = `${EDITOR.FOLDER_TYPES}advisor.svg`;
        const advisorPanel = this.addTab('advisor', null, { icon, color: 'var(--button-dark)' });//, alpha: 0.5 });
        advisorPanel.addClass('one-advisor-panel');
        this.selectFirst();

        // Title
        const titleDiv = new SUEY.Div().addClass('osui-tab-title').setStyle('user-select', 'all');
        const titleText = new SUEY.Text().addClass('osui-tab-title-text');
        titleDiv.add(titleText);

        // Body
        const bodyScroller = new SUEY.Div().addClass('one-advisor-scroller');
        const bodyContents = new SUEY.Div().addClass('one-advisor-contents');
        bodyScroller.add(bodyContents);

        // Add to Panel
        advisorPanel.add(titleDiv, bodyScroller);

        /********** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 0.75em', 'display', 'none');
        const buttonSpacer = new SUEY.FlexSpacer().setStyle('pointer-events', 'none');

        const backButton = new SUEY.Button().addClass('osui-borderless-button');
        const backArrow = new SUEY.ShadowBox(`${EDITOR.FOLDER_MENU}advisor/arrow.svg`);
        backArrow.firstImage().firstImage().setStyle('transform', 'scale(1.25)');
        backButton.setAttribute('tooltip', 'Back');
        backButton.add(backArrow);

        const forwardButton = new SUEY.Button().addClass('osui-borderless-button');
        const forwardArrow = new SUEY.ShadowBox(`${EDITOR.FOLDER_MENU}advisor/arrow.svg`);
        forwardArrow.firstImage().firstImage().setStyle('transform', 'translateX(10%) scaleX(-1.25) scaleY(1.25)');
        forwardButton.setAttribute('tooltip', 'Forward');
        forwardButton.add(forwardArrow);

        backButton.onClick(() => {
            if (history >= titles.length - 1) return;
            history++;
            setInfo(titles[history], bodies[history]);
            updateButtons();
        });

        forwardButton.onClick(() => {
            if (history <= 0) return;
            history--;
            setInfo(titles[history], bodies[history]);
            updateButtons();
        });

        function updateButtons() {
            forwardButton.setStyle('opacity', '1', 'cursor', 'pointer');
            backButton.setStyle('opacity', '1', 'cursor', 'pointer');
            if (history <= 0) forwardButton.setStyle('opacity', '0', 'cursor', 'default');
            if (history >= titles.length - 1) backButton.setStyle('opacity', '0', 'cursor', 'default');
        }
        updateButtons();

        buttonRow.add(backButton, buttonSpacer, forwardButton);
        titleDiv.add(buttonRow);

        /********** EVENTS */

        // Close Button
        SUEY.Interaction.addCloseButton(this, SUEY.CLOSE_SIDES.LEFT);

        // Events
        this.onPointerEnter(() => {
            active = false;
            buttonRow.setStyle('display', '');
        });

        this.onPointerLeave(() => {
            active = true;
            buttonRow.setStyle('display', 'none');
            signals.advisorInfo.dispatch();
        });

        this.dom.addEventListener('hidden', () => {
            Config.setKey('panels/showAdvisor', !Config.getKey('panels/showAdvisor'));
            signals.refreshWindows.dispatch();
        });

        /********** SET INFO */

        function setInfo(title, html = '') {
            if (title) {
                titleText.setInnerHtml(title);
                try { bodyContents.dom.removeChild(welcomeBody.dom); } catch (error) { /* FAILED TO REMOVE */ }
                bodyContents.setInnerHtml(html);
                bodyContents.removeClass('one-advisor-contents-empty');
            } else {
                titleText.setInnerHtml(advice.title);
                bodyContents.setInnerHtml('');
                bodyContents.dom.appendChild(welcomeBody.dom);
                bodyContents.addClass('one-advisor-contents-empty');
                history = -1;
            }
        }

        function infoWantsToChange(title, html) {
            if (!active) return;
            if (title && ((titles.length === 0) || (titles.length > 0 && title !== titles[0]))) {
                titles.unshift(title);
                bodies.unshift(html ?? '');
                while (titles.length > maxSize) { titles.pop(); }
                while (bodies.length > maxSize) { bodies.pop(); }
                history = 0;
            }
            setInfo(title, html);
            updateButtons();
        }

        signals.advisorInfo.add(infoWantsToChange);

        this.dom.addEventListener('destroy', function() {
            signals.advisorInfo.remove(infoWantsToChange);
        }, { once: true });

        /***** INIT *****/

        setInfo();

    } // end ctor

}

export { Advisor };

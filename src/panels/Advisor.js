import * as EDITOR from 'editor';
import * as SUEY from 'gui';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { DockPanel } from '../gui/DockPanel.js';
import { Signals } from '../config/Signals.js';

let _title = '__NOT_SET__';

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
        this.addClass('salt-advisor');
        this.setTabSide(SUEY.TAB_SIDES.RIGHT);

        /********** WELCOME */

        const welcomeContents = new SUEY.Div().addClass('suey-absolute-box', 'salt-advisor-welcome-box');
        welcomeContents.setInnerHtml(`
        <div style='padding-bottom: 0.5em;'>
            <span style='font-size: 110%; color: rgb(var(--triadic2));'>Welcome</span>
            <span style='font-size: 110%; color: rgb(var(--triadic1));'>&nbspto&nbsp</span>
            <span style='font-size: 110%; color: rgb(var(--icon));'>Salinity</span>
        </div>
        <div class='salt-advisor-wave-holder'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 5600 16' class='water_wave water_wave_back salt-instant-start'>
                <pattern id="wave1" patternUnits="userSpaceOnUse" width="280" height="16">
                <path d="M140,15.986c21.5,-0.319 38.8,-1.998 51.1,-3.597c13.4,-1.758 26.5,-4.157 27.3,-4.316c15.6,-2.878 19.6,-4.317 30.1,-5.916c7.1,-1.039 17.9,-2.238 31.5,-2.158l0,15.987l-140,0Zm0,0l-140,0l0,-15.987c13.6,-0.08 24.3,1.119 31.5,2.158c10.5,1.599 14.5,3.038 30.1,5.916c0.8,0.159 13.9,2.558 27.3,4.316c12.3,1.599 29.6,3.278 51.1,3.597Z"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#wave1)"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 5600 16' class='water_wave water_wave_middle salt-instant-start'>
                <pattern id="wave2" patternUnits="userSpaceOnUse" width="280" height="16">
                <path d="M140,15.986c21.5,-0.319 38.8,-1.998 51.1,-3.597c13.4,-1.758 26.5,-4.157 27.3,-4.316c15.6,-2.878 19.6,-4.317 30.1,-5.916c7.1,-1.039 17.9,-2.238 31.5,-2.158l0,15.987l-140,0Zm0,0l-140,0l0,-15.987c13.6,-0.08 24.3,1.119 31.5,2.158c10.5,1.599 14.5,3.038 30.1,5.916c0.8,0.159 13.9,2.558 27.3,4.316c12.3,1.599 29.6,3.278 51.1,3.597Z"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#wave2)"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 5600 16' class='water_wave water_wave_front salt-instant-start'>
                <pattern id="wave3" patternUnits="userSpaceOnUse" width="280" height="16">
                <path d="M140,15.986c21.5,-0.319 38.8,-1.998 51.1,-3.597c13.4,-1.758 26.5,-4.157 27.3,-4.316c15.6,-2.878 19.6,-4.317 30.1,-5.916c7.1,-1.039 17.9,-2.238 31.5,-2.158l0,15.987l-140,0Zm0,0l-140,0l0,-15.987c13.6,-0.08 24.3,1.119 31.5,2.158c10.5,1.599 14.5,3.038 30.1,5.916c0.8,0.159 13.9,2.558 27.3,4.316c12.3,1.599 29.6,3.278 51.1,3.597Z"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#wave3)"/>
            </svg>
        </div>
        `);

        // OPTION: Graphics
        const irisLogo = new SUEY.VectorBox(`${EDITOR.FOLDER_LOGO}iris.svg`);
        irisLogo.setStyle(
            'z-index', '-1',
            'opacity', '0.25',
            'transform', 'scale(1.5)',
        );
        welcomeContents.add(irisLogo);

        /********** HISTORY */

        const advice = Advice.getKey('advisor');
        const titles = [];
        const bodies = [];
        let active = true;
        let history = 0;
        let maxSize = 25;

        /********** TAB PANEL */

        const icon = `${EDITOR.FOLDER_TYPES}advisor.svg`;
        const advisorPanel = this.addNewTab('advisor', null, { icon, color: 'var(--button-dark)' });//, alpha: 0.5 });
        advisorPanel.addClass('salt-advisor-panel');
        this.selectFirst();

        // Title
        const titleDiv = new SUEY.Div().addClass('suey-tab-title').setStyle('user-select', 'all');
        const titleText = new SUEY.Text().addClass('suey-tab-title-text');
        titleDiv.add(titleText);

        // Body
        const bodyScroller = new SUEY.Div().addClass('salt-advisor-scroller');
        const bodyContents = new SUEY.Div().addClass('salt-advisor-contents');
        bodyScroller.add(welcomeContents, bodyContents);

        // Add to Panel
        advisorPanel.add(titleDiv, bodyScroller);

        /********** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().setStyle('padding', '0 0.75em', 'display', 'none');
        const buttonSpacer = new SUEY.FlexSpacer().setStyle('pointer-events', 'none');

        const backButton = new SUEY.Button().addClass('suey-borderless-button');
        const backArrow = new SUEY.ShadowBox(`${EDITOR.FOLDER_MENU}advisor/arrow.svg`);
        backArrow.firstImage().firstImage().setStyle('transform', 'scale(1.25)');
        backButton.setAttribute('tooltip', 'Back');
        backButton.add(backArrow);

        const forwardButton = new SUEY.Button().addClass('suey-borderless-button');
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
            setInfo();
        });

        this.dom.addEventListener('hidden', () => {
            Config.setKey('panels/showAdvisor', !Config.getKey('panels/showAdvisor'));
            Signals.dispatch('refreshWindows');
        });

        /********** SET INFO */

        function setInfo(title, html = '') {
            if (title === _title) return;
            if (title) {
                titleText.setInnerHtml(title);
                bodyContents.setInnerHtml(html);
                bodyContents.setOpacity(1.0);
                welcomeContents.setOpacity(0.0);
            } else {
                titleText.setInnerHtml(advice.title);
                bodyContents.setInnerHtml('');
                bodyContents.setOpacity(0.0);
                welcomeContents.setOpacity(1.0);
                history = -1;
            }
            _title = title;
        }

        function wantsToUpdate(title, html = '') {
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

        /***** SIGNALS *****/

        Signals.connect(this, 'advisorInfo', wantsToUpdate);

        /***** INIT *****/

        setInfo();

    } // end ctor

}

export { Advisor };

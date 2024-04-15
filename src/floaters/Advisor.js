import {
    FOLDER_FLOATERS,
    FOLDER_LOGO,
    FOLDER_MENU,
} from 'constants';
import * as SUEY from 'gui';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

/**
 * Helpful Advice
 */
class Advisor extends SmartFloater {

    #title = '__NOT_SET__';

    constructor() {
        const icon = `${FOLDER_FLOATERS}advisor.svg`;
        super('advisor', { icon, color: 'var(--button-dark)' });//, alpha: 0.5 });
        const self = this;
        this.addClass('salt-advisor');
        Advice.attach(this.button, 'floater/advisor');

        /********** WELCOME */

        const welcomeContents = new SUEY.Div().addClass('salt-advisor-welcome-box');
        welcomeContents.setInnerHtml(`
            <div style='padding: 0.55em 0; text-align: center; width: 100%; margin: auto;'>
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
        const irisLogo = new SUEY.VectorBox(`${FOLDER_LOGO}iris.svg`);
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

        /********** CONTENTS */

        // Title
        const titleDiv = new SUEY.Div().addClass('suey-tab-title');
        const titleText = new SUEY.Text().addClass('suey-tab-title-text');
        titleDiv.add(titleText);

        // Body
        const bodyScroller = new SUEY.Div().addClass('salt-advisor-scroller');
        const bodyContents = new SUEY.Div().addClass('salt-advisor-contents');
        bodyScroller.add(welcomeContents, bodyContents);

        // Add to Advisor
        this.add(titleDiv, bodyScroller);

        /********** HEADER BUTTONS */

        const buttonRow = new SUEY.AbsoluteBox().addClass('salt-advisor-buttons').setStyle('pointer-events', 'all');
        const buttonSpacer = new SUEY.FlexSpacer().setStyle('pointer-events', 'none');

        const backButton = new SUEY.Button().addClass('suey-borderless-button');
        const backArrow = new SUEY.ShadowBox(`${FOLDER_MENU}advisor/arrow.svg`);
        backArrow.firstImage().firstImage().setStyle('transform', 'scale(1.25)');
        backButton.setAttribute('tooltip', 'Back');
        backButton.add(backArrow);

        const forwardButton = new SUEY.Button().addClass('suey-borderless-button');
        const forwardArrow = new SUEY.ShadowBox(`${FOLDER_MENU}advisor/arrow.svg`);
        forwardArrow.firstImage().firstImage().setStyle('transform', 'translateX(10%) scaleX(-1.25) scaleY(1.25)');
        forwardButton.setAttribute('tooltip', 'Forward');
        forwardButton.add(forwardArrow);

        backButton.onPress(() => {
            if (history >= titles.length - 1) return;
            history++;
            setInfo(titles[history], bodies[history]);
            updateButtons();
        });

        forwardButton.onPress(() => {
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

        // Events
        this.on('pointerenter', () => {
            // Deactivate, Show Buttons
            active = false;
            buttonRow.setStyle('opacity', '1');
        });

        this.on('pointerleave', () => {
            // Reactivate, Hide Buttons, Clear Info
            active = true;
            buttonRow.setStyle('opacity', '0');
            setInfo();

            // Clear Selection
            const selection = window.getSelection();
            if (typeof selection.empty === 'function') selection.empty();
            if (typeof selection.removeAllRanges === 'function') selection.removeAllRanges();
        });

        /********** SET INFO */

        function setInfo(title, html = '') {
            if (title === self.#title) return;
            let newTitle = advice.title;
            if (title) {
                newTitle = title;
                bodyContents.setInnerHtml(html);
                bodyContents.setStyle('display', '');
                welcomeContents.setStyle('display', 'none');
            } else {
                bodyContents.setInnerHtml('');
                bodyContents.setStyle('display', 'none');
                welcomeContents.setStyle('display', '');
                history = -1;
            }
            titleText.setInnerHtml(newTitle);
            if (self.dock && self.dock.hasClass('suey-window')) {
                self.dock.setTitle(newTitle);
            }
            self.#title = title;
            updateButtons();
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
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'advisorInfo', wantsToUpdate);

        /***** INIT *****/

        setInfo();

    } // end ctor

}

export { Advisor };

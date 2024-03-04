import * as EDITOR from 'editor';
import * as SUEY from 'gui';

let _displayTimer;

/** Temporary popup info box, useful for displaying zoom level, mouse coords, etc. */
class InfoBox extends SUEY.Div {

    constructor() {
        super();
        const self = this;
        this.setClass('osui-info-box');
        this.setInnerHtml('');

        function showInfo(info) {
            self.setInnerHtml(info);

            // Set Position
            const left = (window.innerWidth / 2) - (self.getWidth() / 2);
            const top = (window.innerHeight / 2) - (self.getHeight() / 2);
            self.setLeft(`${left}px`);
            //self.setTop(`${top}`);
            self.setTop('4.5em');

            // Show
            self.addClass('osui-updated');

            // Set Hide Timeout
            clearTimeout(_displayTimer);
            _displayTimer = setTimeout(() => self.removeClass('osui-updated'), EDITOR.TIMEOUT_INFOBOX);
        }

        /***** SIGNALS *****/

        signals.showInfo.add(showInfo);

        /***** DESTROY *****/

        this.dom.addEventListener('destroy', function() {
            signals.showInfo.remove(showInfo);
        }, { once: true });

    }

}

export { InfoBox };

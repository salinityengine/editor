import * as EDITOR from 'editor';
import * as SUEY from 'gui';

let _displayTimer;

/** Temporary popup info box, useful for displaying zoom level, mouse coords, etc. */
class InfoBox extends SUEY.Div {

    constructor() {
        super();
        this.setClass('suey-info-box');
        this.setInnerHtml('');
    } // end ctor

    popupInfo(info) {
        const self = this;
        this.setInnerHtml(info);

        // Set Position
        const left = (window.innerWidth / 2) - (this.getWidth() / 2);
        const top = (window.innerHeight / 2) - (this.getHeight() / 2);
        this.setStyle('left', `${left}px`);
        this.setStyle('top', '4.5em'); // `${top}px`);

        // Show
        this.addClass('suey-updated');

        // Set Hide Timeout
        clearTimeout(_displayTimer);
        _displayTimer = setTimeout(() => self.removeClass('suey-updated'), EDITOR.TIMEOUT_INFOBOX);
    }

}

export { InfoBox };

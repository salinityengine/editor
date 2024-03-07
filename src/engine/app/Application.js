// https://pixijs.download/release/docs/PIXI.Application.html

import * as PIXI from 'pixi';

class Application extends PIXI.Application {

    constructor({
        element = document.body,
        backgroundAlpha = 1.0,
        backgroundColor = '#242424',
    } = {}) {
        // https://pixijs.download/release/docs/PIXI.IApplicationOptions.html
        // https://pixijs.download/release/docs/PIXI.IRendererOptions.html
        super();
        this.init({
            backgroundColor,
            resizeTo: element,
        });

        element.appendChild(this.view);
    }

}

export { Application };

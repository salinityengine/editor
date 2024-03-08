// https://pixijs.download/release/docs/PIXI.Application.html

import * as PIXI from 'pixi';

class Application extends PIXI.Application {

    constructor() {
        super();
    }

    async init({
        element = document.body,
    } = {}) {
        await super.init({
            resizeTo: element,
        });
        element.appendChild(this.view);
    }

}

export { Application };

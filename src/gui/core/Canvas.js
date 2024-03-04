import { Element } from './Element.js';

class Canvas extends Element {

    constructor(width = 300, height = 150) {
        // const canvas = document.createElement('canvas');
        // // OR
        const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        canvas.width = width;
        canvas.height = height;

        // Base
        super(canvas);

        // Context
        this.ctx = this.dom.getContext('2d');
    }

    get width() { return this.dom.width; }
    set width(x) { this.dom.width = x; }

    get height() { return this.dom.height; }
    set height(x) { this.dom.height = x; }

    ratio() {
        const rect = this.dom.getBoundingClientRect();
        return ((this.dom.width / this.dom.height) / (rect.width / rect.height));
    }

}

export { Canvas };

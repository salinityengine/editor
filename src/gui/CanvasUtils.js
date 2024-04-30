// drawPalette()        // Draws a palette asset to a canvas

import * as SALT from 'salt';
import * as SUEY from 'suey';

const _color = new SUEY.Iris();

class CanvasUtils {

    /** Draws a palette asset to a canvas */
    static drawPalette(canvas, palette) {
        if (!palette || !palette.isPalette || !Array.isArray(palette.colors)) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const numColors = palette.colors.length;
        const rowSize = Math.ceil(Math.sqrt(numColors));
        const cellX = canvas.width / rowSize;
        const cellY = canvas.height / rowSize;

        let index = 0;
        for (let y = 0; y < rowSize; y++) {
            for (let x = 0; x < rowSize; x++) {
                if (index < numColors) {
                    _color.set(palette.colors[index]);
                    ctx.fillStyle = _color.hexString();
                    ctx.fillRect(x * cellX, y * cellY, cellX, cellY);
                }
                index++;
            }
        }
    }

}

export { CanvasUtils };

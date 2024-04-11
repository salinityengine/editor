import * as SALT from 'engine';
import * as SUEY from 'gui';
import { EnhancedFloater } from '../gui/EnhancedFloater.js';

/**
 * Shaper Editor
 */
class Shaper extends EnhancedFloater {

    constructor() {
        super({
            height: '85%',
            width: '60%',
            title: 'Shaper',
        });
        const self = this;
        this.id = 'Shaper';
        this.setStyle('display', 'none');

        // Background Color
        this.contents().setStyle('backgroundColor', 'rgb(var(--background-light))');

        // Elements
        this.canvas = new SUEY.Canvas(2000, 2000).addClass('salt-shaper-canvas');
        this.points = new SUEY.Div().setClass('salt-shaper-points');
        this.add(this.canvas, this.points);

        // Properties
        this.shape = null;
        this.scale = 1;
        this.offset = { x: 0, y: 0 };

        // Events
        function updateSize() {
            self.canvas.width = Math.max(1, self.contents().getWidth());
            self.canvas.height = Math.max(1, self.contents().getHeight());
            self.drawShape();
        }
        this.on('resizer', updateSize);
        window.addEventListener('resize', updateSize);

        // Initial Scale / Offset
        this.on('displayed', () => {
            self.canvas.width = Math.max(1, self.contents().getWidth());
            self.canvas.height = Math.max(1, self.contents().getHeight());
            const shape = self.shape;
            if (shape && shape.type === 'Shape') {
                const pts = shape.getPoints(50);
                _box.setFromPoints(pts);
                _box.getCenter(_center);
                _box.getSize(_size);
                const xRatio = self.canvas.dom.width / _size.x;
                const yRatio = self.canvas.dom.height / _size.y;
                const scale = Math.min(xRatio, yRatio) * 0.8;
                self.scale = scale;
                self.offset.copy(_center);
            }
            self.drawShape();
        });

        // Clean Up
        this.on('destroy', () => {
            window.removeEventListener('resize', updateSize);
        });
    }

    drawShape(drawHidden = false) {
        if (!drawHidden && this.isHidden()) return;
        const shape = this.shape;
        const scale = this.scale;

        // Clear Canvas
        const canvas = this.canvas.dom;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = _clr.set(SUEY.ColorScheme.color(SUEY.TRAIT.COMPLEMENT)).hexString();
        ctx.lineWidth = 2;
        if (!shape || shape.type !== 'Shape') return;

        // // SHAPE -> PATH (for drawing curve path, .lineTo, etc.) -> CURVEPATH -> CURVE
        // // shape.holes = [ CurvePath ]
        // // shape.path.currentPoint = Vector2 (end point)
        // // shape.path.curvepath.curves = [ Curve ]
        // // shape.path.curvepath.autoClose = false
        // for (let i = 0; i < shape.curves.length; i++) {
        //     const curve = shape.curves[i];

        //     function mapX(x) { return (x * scale) + ((canvas.width / 2) - (_center.x * scale)); }
        //     function mapY(y) { return (y * scale * -1) + ((canvas.height / 2) + (_center.y * scale)); }

        //     switch (curve.type) {
        //         case 'ArcCurve':
        //         case 'EllipseCurve':
        //             // aX = 0
        //             // aY = 0
        //             // xRadius = 1
        //             // yRadius = 1
        //             // aStartAngle = 0
        //             // aEndAngle = PI * 2
        //             // aClockwise = false
        //             // aRotation = 0
        //             ctx.beginPath();
        //             ctx.ellipse(
        //                 mapX(curve.aX),
        //                 mapY(curve.aY),
        //                 curve.xRadius * scale,
        //                 curve.yRadius * scale,
        //                 curve.aRotation,
        //                 curve.aStartAngle,
        //                 curve.aEndAngle,
        //                 !curve.aClockwise);
        //             ctx.stroke();
        //             break;

        //         case 'CubicBezierCurve':
        //             // v0       Vector2     start point
		//             // v1       Vector2     control point 1
		//             // v2       Vector2     control point 2
		//             // v3       Vector2     end point
        //             ctx.beginPath();
        //             ctx.moveTo(mapX(curve.v0.x), mapY(curve.v0.y));
        //             ctx.bezierCurveTo(mapX(curve.v1.x), mapY(curve.v1.y), mapX(curve.v2.x), mapY(curve.v2.y), mapX(curve.v3.x), mapY(curve.v3.y));
        //             ctx.stroke();
        //             break;

        //         case 'LineCurve':
        //             // v1       Vector2     start point
        //             // v2       Vector2     end point
        //             ctx.beginPath();
        //             ctx.moveTo(mapX(curve.v1.x), mapY(curve.v1.y));
        //             ctx.lineTo(mapX(curve.v2.x), mapY(curve.v2.y));
        //             ctx.stroke();
        //             break;

        //         case 'QuadraticBezierCurve':
        //             // v0       Vector2     start point
		//             // v1       Vector2     control point
		//             // v2       Vector2     end point
        //             ctx.beginPath();
        //             ctx.moveTo(mapX(curve.v0.x), mapY(curve.v0.y));
        //             ctx.quadraticCurveTo(mapX(curve.v1.x), mapY(curve.v1.y), mapX(curve.v2.x), mapY(curve.v2.y));
        //             ctx.stroke();
        //             break;

        //         case 'SplineCurve':
        //             // points = [ Vector2 ]
        //             break;

        //         // 3D CURVES UNSUPPORTED
        //         case 'CatmullRomCurve3':        // 3D               points[Vector3]
        //         case 'LineCurve3':              // 3D               v1, v2 (as Vector3)
        //         case 'QuadraticBezierCurve3':   // 3D
        //         default: console.log(`Shaper: '' is an unsupported shape type`);
        //     }

        //     //
        //     // NEXT: Holes
        //     //
        // }
    }

    setShape(shape) {
        // Clear Divs
        this.points.clearContents();
        this.scale = 1;
        this.offset.set(0, 0);

        //
        // TODO: Add Point Divs
        //

        // Save
        this.shape = shape;

        // // DEBUG
        // console.log(shape);
        // console.log(_size, _center);
        // for (let i = 0; i < shape.curves.length; i++) {
        //     const curve = shape.curves[i];
        //     console.log(curve);
        // }
    }

    showWindow(shape) {
        this.setShape(shape);

    }

}

export { Shaper };

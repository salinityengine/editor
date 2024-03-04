import { Div } from '../core/Div.js';
import { VectorBox } from '../layout/VectorBox.js';
import { IMAGE_CLOSE, NODE_TYPES } from '../constants.js';

class NodeItem extends Div {

    constructor({
        quantity = 1, /* number of connections allowed */
        type = NODE_TYPES.INPUT,
        title = '',
    } = {}) {
        super(title);
        const self = this;
        this.addClass('osui-node-item');

        // Elements
        const disconnect = new VectorBox(IMAGE_CLOSE);
        this.point = new Div().addClass('osui-node-item-point');
        this.detach = new Div().addClass('osui-node-item-detach').add(disconnect);
        this.add(this.point, this.detach);

        // Properties
        this.connections = [];
        this.incoming = 0;
        this.quantity = quantity;
        this.type = type;
        this.node = this;

        switch (type) {
            case NODE_TYPES.INPUT: this.addClass('osui-node-left'); break;
            case NODE_TYPES.OUTPUT: this.addClass('osui-node-right'); break;
        }

        // Graph
        this.graph = () => { return (self.node && self.node.graph) ? self.node.graph : undefined; };

        // Point Pointer Events
        function pointPointerDown(event) {
            if (event.button !== 0) return;
            if (!self.graph()) return;
            event.stopPropagation();
            event.preventDefault();
            self.point.dom.ownerDocument.addEventListener('pointermove', pointPointerMove);
            self.point.dom.ownerDocument.addEventListener('pointerup', pointPointerUp);
            self.point.addClass('osui-active-item');
            self.graph().activeItem = self;
            self.graph().activePoint.x = event.clientX;
            self.graph().activePoint.y = event.clientY;
            self.graph().drawLines();
        }
        function pointPointerUp(event) {
            event.stopPropagation();
            event.preventDefault();
            self.point.removeClass('osui-active-item');
            self.graph().connect();
            self.point.dom.ownerDocument.removeEventListener('pointermove', pointPointerMove);
            self.point.dom.ownerDocument.removeEventListener('pointerup', pointPointerUp);
        }
        function pointPointerMove(event) {
            event.stopPropagation();
            event.preventDefault();
            self.graph().activePoint.x = event.clientX;
            self.graph().activePoint.y = event.clientY;
            self.graph().drawLines();
        }
        function pointPointerEnter(event) {
            if (self.graph() && self.graph().activeItem) {
                if (self.type !== self.graph().activeItem.type) {
                    self.graph().connectItem = self;
                    if (self.graph().activeItem) self.point.addClass('osui-active-item');
                    self.point.addClass('osui-hover-point');
                }
            } else {
                self.point.addClass('osui-hover-point');
            }
        }
        function pointPointerLeave(event) {
            if (self.graph()) {
                self.graph().connectItem = undefined;
                if (self.graph().activeItem !== self) self.point.removeClass('osui-active-item');
            }
            self.point.removeClass('osui-hover-point');
        }
        this.point.onPointerDown(pointPointerDown);
        this.point.onPointerEnter(pointPointerEnter);
        this.point.onPointerLeave(pointPointerLeave);

        // Detach Pointer Events
        function breakPointerDown(event) {
            if (!self.hasClass('osui-item-connected')) return;
            if (event.button !== 0) return;
            event.stopPropagation();
            event.preventDefault();
            self.disconnect();
        }
        this.detach.onPointerDown(breakPointerDown);
    }

    /******************** CONNECTION */

    connect(item) {
        if (item === this) return;
        if (!this.connections.includes(item)) {
            // Make room
            if (this.connections.length >= this.quantity) {
                this.connections[this.connections.length - 1].reduceIncoming();
                this.connections.length = Math.max(0, this.connections.length - 1);
            }
            // Connect
            if (this.connections.length < this.quantity) {
                item.increaseIncoming();
                this.connections.push(item);
            }
        }
        if (this.connections.length > 0) {
            this.addClass('osui-item-connected');
        } else {
            this.removeClass('osui-item-connected');
        }
    }

    disconnect() {
        switch (this.type) {
            case NODE_TYPES.OUTPUT:
                for (let i = 0; i < this.connections.length; i++) {
                    this.connections[i].reduceIncoming();
                }
                this.connections.length = 0;
                break;
            case NODE_TYPES.INPUT:
                if (this.graph()) this.graph().disconnect(this);
                break;
        }
        this.removeClass('osui-item-connected');
        if (this.graph()) this.graph().drawLines();
    }

    increaseIncoming() {
        this.incoming++;
        this.addClass('osui-item-connected');
    }

    reduceIncoming() {
        if (this.incoming > 0) this.incoming--;
        if (this.incoming === 0) this.removeClass('osui-item-connected');
    }

}

export { NodeItem };

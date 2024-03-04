import { Div } from '../core/Div.js';
import { Css } from '../utils/Css.js';
import { Iris } from '../utils/Iris.js';
import { MenuSeparator } from './MenuSeparator.js';
import { Utils } from '../utils/Utils.js';

const TRIANGLE_SIZE = 3.0;                  // Bigger value is smaller triangle (size = width / TRIANGLE_SIZE)

const _clr = new Iris();

class Menu extends Div {

    #addedTo = false;

    constructor() {
        super();
        this.setClass('osui-menu');

        // Mouse Area
        this.mouseSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.mouseSvg.setAttribute('class', 'osui-menu-mouse-triangle');
        // this.mouseSvg.setAttribute('style', 'border: 1px solid black');      // NOTE: Un-comment to see container
        this.mouseSvg.setAttribute('pointer-events', 'none');
        this.mouseSvg.setAttribute('version', '1.1');

        this.mouseArea = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        this.mouseArea.setAttribute('fill', _clr.setRandom().hexString());
        this.mouseArea.setAttribute('opacity', '0.0');                          // NOTE: Comment out to see triangle
        this.mouseArea.setAttribute('pointer-events', 'fill');
        this.mouseSvg.appendChild(this.mouseArea);

        // Flag
        this.menuParentDom = undefined;
    }

    /******************** CATEGORIES ********************/

    add() {
        if (!this.#addedTo && this.children) {
            let menuItems = this.children;
            if (menuItems.length > 0) {
                const lastItem = menuItems[menuItems.length - 1];
                if (lastItem.constructor.name !== 'MenuSeparator') {
                    super.add(new MenuSeparator());
                }
            }
        }
        if (arguments && arguments.length > 0) {
            this.#addedTo = true;
            super.add(...arguments);
        }
        return this;
    }

    newCategory() {
        this.#addedTo = false;
    }

    /******************** SHOW MENU ********************/

    closeMenu(applyToSelf = true, dontCloseChildrenOf = undefined) {
        // Close children menus and attached sub menus
        this.traverse((child) => {
            // Don't close menus that are children of 'dontCloseChildrenOf'
            if (dontCloseChildrenOf && Utils.isChildOf(child.dom, dontCloseChildrenOf)) {
                // NOTHING
            } else {
                child.removeClass('osui-menu-show', 'osui-selected');
                if (child.attachedMenu && typeof child.attachedMenu.closeMenu === 'function') {
                    child.attachedMenu.closeMenu(true);
                }
                if (child.dom && typeof child.dom.blur === 'function') child.dom.blur();
            }
        }, applyToSelf);

        // Close self
        if (applyToSelf) {
            // Un-select button that spawned menu
            let parent = this.menuParentDom;
            while (parent) {
                if (this.menuParentDom.classList.contains('osui-menu-button')) {
                    parent.classList.remove('osui-selected');
                    parent = undefined;
                } else {
                    parent = parent.parentElement;
                }
            }

            // Remove event listeners
            if (typeof this.removeHandlers === 'function') this.removeHandlers();

            // Remove Menu focus globally
            document.dispatchEvent(new Event('nofocus'));
        }
    }

    /** Is Shown? */
    isShown() {
        return this.hasClass('osui-menu-show');
    }

    /** Shows Menu, adds Menu Closer listenser to base menu */
    showMenu(parentDom) {
        const self = this;
        this.menuParentDom = parentDom;

        // Show Menu
        this.addClass('osui-menu-show');
        this.focus();

        // Attach mouse area polygon if this menu is a child of another menu
        if (Utils.isChildOfElementWithClass(this.dom, 'osui-menu')) {
            // Turn off mouse events temporarily while when give menu time to animate
            this.mouseArea.setAttribute('pointer-events', 'none');

            // Make sure svg has been added to this sub menu
            this.contents().dom.insertBefore(this.mouseSvg, this.contents().dom.firstChild);
            this.updateMouseArea();

            // Update svg size when animation is complete
            const timeFloat = parseFloat(Css.getVariable('--menu-timing')) * 1000.0
            setTimeout(() => this.updateMouseArea(), timeFloat);
        }

        /***** EVENTS *****/

        function onCloseMenu() {
            self.closeMenu();
        }

        function onKeyDown(event) {
            if (event.key === 'Escape') {
                self.closeMenu();
            }
        }

        // Document Pointer Down (closes menu on 'document' click)
        function onPointerDown(event) {
            // MenuItem Click
            if (self.dom.contains(event.target)) {
                // NOTHING
            } else {
                self.closeMenu();
            }
        }

        document.addEventListener('closemenu', onCloseMenu);
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown);

        /***** DESTROY *****/

        this.removeHandlers = function() {
            document.removeEventListener('closemenu', onCloseMenu);
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown);
        };

        this.dom.addEventListener('destroy', function() {
            self.removeHandlers();
        }, { once: true });

        return this;
    }

    /******************** MOUSE POLYGON ********************/

    /** Updates mouse polygon svg points */
    updateMouseArea() {
        const parentRect = this.dom.parentElement.getBoundingClientRect();
        const myRect = this.dom.getBoundingClientRect();

        if (!this.hasClass('osui-menu-under')) {
            const middle = (parentRect.top - myRect.top) + (parentRect.height / 2);
            const middle1 = middle - (parentRect.height / 2);
            const middle2 = middle + (parentRect.height / 2);
            const leftSide = parentRect.width / TRIANGLE_SIZE;
            const topSides = 10;

            this.mouseSvg.style['left'] = `-${leftSide}px`;
            this.mouseSvg.style['top'] = `-${topSides}px`;
            this.mouseSvg.setAttribute('width', `${myRect.width + leftSide}px`);
            this.mouseSvg.setAttribute('height', `${myRect.height + topSides*2}px`);

            const point1 = `${leftSide},0`;
            const point2 = `0,${topSides + middle1}`;
            const point3 = `0,${topSides + middle2}`;
            const point4 = `${leftSide},${myRect.height + topSides*2}`;
            const point5 = `${leftSide + myRect.width},${myRect.height + topSides*2}`;
            const point6 = `${leftSide + myRect.width},0`;
            this.mouseArea.setAttributeNS(null, 'points', `${point1} ${point2} ${point3} ${point4} ${point5} ${point6}`);
            this.mouseArea.setAttribute('pointer-events', 'fill');

        } else {
            const middle = myRect.width / 2;
            const middle1 = middle - (parentRect.width / 2);
            const middle2 = middle + (parentRect.width / 2);
            const topSides = parentRect.height / 1.5;

            this.mouseSvg.style['left'] = '0';
            this.mouseSvg.style['top'] = `-${topSides}px`;
            this.mouseSvg.setAttribute('width', `${myRect.width}px`);
            this.mouseSvg.setAttribute('height', `${myRect.height + topSides}px`);

            const point1 = `${middle1},0`;
            const point2 = `0,${topSides}`;
            const point3 = `0,${myRect.height + topSides}`;
            const point4 = `${myRect.width},${myRect.height + topSides}`;
            const point5 = `${myRect.width},${topSides}`;
            const point6 = `${middle2},0`;
            this.mouseArea.setAttributeNS(null, 'points', `${point1} ${point2} ${point3} ${point4} ${point5} ${point6}`);
            this.mouseArea.setAttribute('pointer-events', 'fill');
        }

        return this;
    }

}

export { Menu };

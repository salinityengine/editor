class Clipboard {

    constructor() {
        this.items = [];
    }

    clear() {
        for (const item of this.items) {
            if (item && typeof item.dispose === 'function') item.dispose();
        }
        this.items = [];
    }

    copy(data) {
        this.clear();

        data = Array.isArray(data) ? data : [ data ];
        for (const item of data) {
            if (item.isThing) {
                const thing = item.clone(true /* recursive */);
                this.items.push(thing);
            }
        }
    }

    containsComponents(entityType) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            // if (item.base && item.base.isComponent === true) {
            //     const ComponentClass = ONE.ComponentManager.registered(item.base.type);
            //     const config = ComponentClass.config ?? {};
            //     if (Array.isArray(config.group) !== true) return false;
            //     if (config.group.indexOf(entityType) === -1) return false;
            //     return true;
            // }
        }
        return false;
    }

    containsEntities() {
        for (const item of this.items) {
            if (item.isEntity) return true;
        }
        return false;
    }

}

export { Clipboard };

class Clipboard {

    constructor() {
        // Properties, Data
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

    containsEntities() {
        for (const item of this.items) {
            if (item.isEntity) return true;
        }
        return false;
    }

}

export { Clipboard };

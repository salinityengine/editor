class Clipboard {

    constructor() {
        // Properties, Data
        this.items = [];
    }

    clear() {
        for (const item of this.items) {
            if (item && item.isEntity) item.dispose();
        }
        this.items = [];
    }

    copy(data) {
        this.clear();

        data = Array.isArray(data) ? data : [ data ];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item.isEntity) {
                const entity = item.clone();
                this.items.push(entity);
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

import * as SUEY from 'gui';

class SelectInput extends SUEY.Dropdown {

    constructor(callback, value, options, overflow = SUEY.OVERFLOW.RIGHT) {
        super();
        const self = this;
        this.overflowMenu = overflow;

        this.setOptions(options);

        this.on('change', () => {
            if (typeof callback !== 'function') return;
            callback(self.getValue());
        });

        this.setValue(value);
    }

}

export { SelectInput };

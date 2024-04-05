import * as SUEY from 'gui';

class PropertyGroup extends SUEY.Shrinkable {

    constructor({
        title,
        icon,
        arrow = 'left',
        border = false,
        leftPropertyWidth = '50%',
    } = {}) {
        super({ title, icon, arrow, border });

        // Property List
        const properties = new SUEY.PropertyList(leftPropertyWidth);
        this.add(properties);
        this.properties = properties;

        // Contents Accessor (this.add(...rows))
        this.contents = function() { return properties };

        // Expanded
        this.setExpanded(true);
    }

    setLeftPropertyWidth(width = '50%') {
        return this.properties.setLeftPropertyWidth(width);
    }

    addRow(title = '', ...controls) {
        return this.properties.addRow(title, ...controls);
    }

    addRowWithoutTitle(...controls) {
        return this.properties.addRowWithoutTitle(...controls);
    }

    createRow(title = '', ...controls) {
        return this.properties.createRow(title, ...controls);
    }

    createRowWithoutTitle(...controls) {
        return this.properties.createRowWithoutTitle(...controls);
    }

    /** Creates a zero margin Row to hold right side controls of a Property Row */
    createControls(/* any number of Osui Elements */) {
        return this.properties.createControls(...arguments);
    }

    disableInputs(disable = true) {
        return this.properties.disableInputs(disable);
    }

}

export { PropertyGroup };

import * as SALT from 'engine';
import * as OSUI from 'gui';

const _color  = new OSUI.Iris();

class PrefabFactory {

    static camera(type) {
        const name = (type) ? SALT.Strings.capitalize(type) : 'Camera';
        const entity = new SALT.Camera3D(name);
        return entity;
    }

    static empty() {
        const entity = new SALT.Entity3D('Entity');
        return entity;
    }

    static light(type) {
        type = SALT.Light3D.validateType(type);
        const name = SALT.Strings.capitalize(String(type).toLowerCase().replace('light', ''));
        const entity = new SALT.Light3D({ name, type });
        return entity;
    }

    static shape(type, color) {
        const name = SALT.Strings.capitalize(type);
        if (type === 'wedge') type = 'shape';
        _color.set(color);

        const entity = new SALT.Entity3D(name);
        entity.addComponent('geometry', { style: type });
        entity.addComponent('material', { style: 'standard', color: _color.hex() });
        return entity;
    }

}

export { PrefabFactory };

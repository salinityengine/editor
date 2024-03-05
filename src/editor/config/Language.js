import { Config } from './Config.js';

const _values = {

    /********** ENGLISH **********/

    en: {

        // Main Menu
        'menubar/file':                     'File',
        'menubar/file/new':                 'New',
        'menubar/file/import':              'Import',
        'menubar/file/export/geometry':     'Export Geometry',
        'menubar/file/export/object':       'Export Object',
        'menubar/file/export/scene':        'Export Scene',
        'menubar/file/publish':             'Publish',

        'menubar/edit':                     'Edit',
        'menubar/edit/undo':                'Undo',
        'menubar/edit/redo':                'Redo',

        // Settings
        'inspector/settings/title':         'Settings',
        'inspector/settings/general':       'General',
        'inspector/settings/language':      'Language',
        'inspector/settings/style':         'Style',
        'inspector/settings/reset':         'Reset Settings',

        'inspector/view/title':             'View',
        'inspector/view/camera':            'Camera',
        'inspector/view/editorCamera':      'Editor View',
        'inspector/view/reset':             'Reset Camera',
        'inspector/view/lock':              'Lock Rotation',
        'inspector/view/zoom':              'Zoom on Focus',
        'inspector/view/render':            'Render',
        'inspector/view/origin':            'Draw Origin',
        'inspector/view/drawMode':          'Draw Mode',

        'inspector/grid/title':             'Grid',
        'inspector/grid/magnet':            'Snap',
        'inspector/grid/snap':              'Snap to Grid',
        'inspector/grid/style':             'Style',
        'inspector/grid/plane':             'Grid Plane',
        'inspector/grid/size':              'Mini Grid Size',
        'inspector/grid/multiplier':        'Grid Multiplier',
        'inspector/grid/visibility':        'Visibility',
        'inspector/grid/showCanvas':        'Show Grid',
        'inspector/grid/showInfinite':      'Show Mini Grid',

        'inspector/project/title':          'Project',
        'inspector/project/name':           'Name',

        'inspector/graph/title':            'Graph',
        'inspector/graph/line':             'Line Type',
        'inspector/graph/grid':             'Grid Style',

        // Entity
        'inspector/entity/name':            'Name',
        'inspector/entity/position':        'Position',
        'inspector/entity/rotation':        'Rotation',
        'inspector/entity/scale':           'Scale',
        'inspector/entity/size':            'Size',

        'inspector/material/color':         'Color',
        'inspector/material/opacity':       'Opacity',

        // Explorer
        'explorer/search':                  'Search',

        // Assets
        'assets/delete':                    'Are you sure you want to delete the selected',
        'assets/empty':                     'Empty',
        'assets/types/geometry':            'Geometry',
        'assets/types/material':            'Material',
        'assets/types/palette':             'Palette',
        'assets/types/script':              'Script',
        'assets/types/script/variables':    'Variables',
        'assets/types/shape':               'Shape',
        'assets/types/texture':             'Texture',

        // Advisor
        'advisor/noInfo':                   'No description provided.',
    },

    /********** FRENCH **********/

    fr: {

        // Main Menu
        'menubar/file':                     'Fichier',
        'menubar/file/new':                 'Nouveau',
        'menubar/file/import':              'Importer',
        'menubar/file/export/geometry':     'Exporter Geometrie',
        'menubar/file/export/object':       'Exporter Objet',
        'menubar/file/export/scene':        'Exporter Scene',
        'menubar/file/publish':             'Publier',

        'menubar/edit':                     'Edition',
        'menubar/edit/undo':                'Annuler',
        'menubar/edit/redo':                'Refaire',

        // Settings
        'inspector/settings/title':         'Général',
        'inspector/settings/language':      'Langue',
        'inspector/settings/style':         'Style',
        'inspector/settings/reset':         'Réinitialiser les options',

        'inspector/view/title':             'Voir',
        'inspector/view/camera':            'Appareil Photo',
        'inspector/view/editorCamera':      "Affichage de l'éditeur",
        'inspector/view/reset':             'Réinitialiser la caméra',
        'inspector/view/zoom':              'Zoomer sur la mise au point',
        'inspector/view/render':            'Rendre',
        // 'inspector/view/origin':         '',
        'inspector/view/drawMode':          'Mode Dessin',

        'inspector/grid/title':             'La Grille',
        'inspector/grid/magnet':            'Instantané',
        'inspector/grid/snap':              'Aligner sur la Grille',
        'inspector/grid/style':             'Style',
        'inspector/grid/plane':             'Plan de Grille',
        'inspector/grid/size':              'Taille de la Grille',
        'inspector/grid/visibility':        'Visibilité',
        'inspector/grid/showCanvas':        'Afficher la grille',
        'inspector/grid/showInfinite':      'Afficher la mini-grille',

        'inspector/project/title':          'Projet',
        'inspector/project/name':           'Nom',

        'inspector/graph/title':            'Graph',
        'inspector/graph/line':             'Line Type',
        'inspector/graph/grid':             'Grid Style',

        // Entity
        'inspector/entity/name':            'Nom',
        'inspector/entity/position':        'Position',
        'inspector/entity/rotation':        'Rotation',
        'inspector/entity/scale':           'Échelle',

        'inspector/material/color':         'Couleur',
        'inspector/material/opacity':       'Opacité',

    },

};

class Language {

    static getKey(key) {
        const language = Config.getKey('settings/language');
        if (_values[language] && _values[language][key]) return _values[language][key];
        if (_values['en'] && _values['en'][key]) return _values['en'][key];
        return '???';
    }

}

export { Language };

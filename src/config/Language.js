import { Config } from './Config.js';

const _values = {

    /********** ENGLISH **********/

    en: {

        // Main Menu
        'menubar/file':                     'File',
        'menubar/edit':                     'Edit',
        'menubar/window':                   'Window',
        'menubar/help':                     'Help',

        // Sub Menus
        'menubar/file/new':                 'New',
        'menubar/file/open':                'Open',
        'menubar/file/save':                'Save',
        'menubar/file/import':              'Import',
        'menubar/file/export':              'Export',
        'menubar/file/publish':             'Publish',
        'menubar/file/close':               'Exit',

        'menubar/edit/undo':                'Undo',
        'menubar/edit/redo':                'Redo',
        'menubar/edit/cut':                 'Cut',
        'menubar/edit/copy':                'Copy',
        'menubar/edit/paste':               'Paste',
        'menubar/edit/duplicate':           'Duplicate',
        'menubar/edit/delete':              'Delete',
        'menubar/edit/all':                 'Select All',
        'menubar/edit/none':                'Select None',

        'menubar/window/hide':              'Collapse All Tabs',
        'menubar/window/show':              'Expand All Tabs',
        'menubar/window/fullscreen':        'Toggle Fullscreen',

        'menubar/help/samples':             'Sample Projects',
        'menubar/help/manual':              'Manual',
        'menubar/help/faq':                 'FAQ',
        'menubar/help/tutorials':           'Tutorials',
        'menubar/help/contact':             'Contact',
        'menubar/help/bug':                 'Bug Report',
        'menubar/help/github':              'GitHub',
        'menubar/help/about':               'About',

        // Settings
        'floater/settings/general':         'General',
        'floater/settings/language':        'Language',
        'floater/settings/promode':         'Pro Mode',
        'floater/settings/theme':           'Theme',
        'floater/settings/color':           'Color',
        'floater/settings/textSize':        'Text Size',
        'floater/settings/opacity':         'Opacity',
        'floater/settings/reset':           'Reset',

        // Entity
        'inspector/entity/name':            'Name',
        'inspector/entity/position':        'Position',
        'inspector/entity/rotation':        'Rotation',
        'inspector/entity/scale':           'Scale',
        'inspector/entity/size':            'Size',

        // Gui
        'gui/search/box':                   'Search',

        // Assets
        'assets/delete':                    'Are you sure you want to delete the selected',
        'assets/empty':                     'Empty',

        // Advisor
        'advisor/empty':                    'No description provided.',

    },

};

class Language {

    static getKey(key) {
        const language = Config.getKey('editor/language');
        if (_values[language] && _values[language][key]) return _values[language][key];
        if (_values['en'] && _values['en'][key]) return _values['en'][key];
        return '???';
    }

}

export { Language };

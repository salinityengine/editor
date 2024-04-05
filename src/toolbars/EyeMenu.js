// PROPERTIES
//  checked:    .setChecked(true / false);
//  disabled:   .setDisabled(true / false);

import {
    FOLDER_MENU,
} from 'constants';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../config/Config.js';
import { Language } from '../config/Language.js';
import { Layout } from '../config/Layout.js';
import { Loader } from '../config/Loader.js';
import { Signals } from '../config/Signals.js';

import { zipSync, strToU8 } from '../libs/fflate.module.js';

class EyeMenu extends SUEY.Menu {

    constructor(editor) {
        super();

        // Enable / Disable Menu Items
        const useFile = true;
        const useEdit = true;
        const useWindow = true;
        const useHelp = true;

        /******************** MENU: FILE ********************/

        let fileNew, fileOpen, fileSave, fileImport, fileExport, filePublish, fileClose;

        if (useFile) {
            fileNew = new SUEY.MenuItem(Language.getKey('menubar/file/new'), `${FOLDER_MENU}main/file/new.svg`);
            fileOpen = new SUEY.MenuItem(Language.getKey('menubar/file/open'), `${FOLDER_MENU}main/file/open.svg`);
            fileSave = new SUEY.MenuItem(Language.getKey('menubar/file/save'), `${FOLDER_MENU}main/file/save.svg`);
            fileImport = new SUEY.MenuItem(Language.getKey('menubar/file/import'), `${FOLDER_MENU}main/file/import.svg`);
            fileExport = new SUEY.MenuItem(Language.getKey('menubar/file/export'), `${FOLDER_MENU}main/file/export.svg`);
            filePublish = new SUEY.MenuItem(Language.getKey('menubar/file/publish'), `${FOLDER_MENU}main/file/publish.svg`);
            fileClose = new SUEY.MenuItem(Language.getKey('menubar/file/close'), ``);

            // NEW

            fileNew.onSelect(() => {
                //
                // TODO: New Project!
                //
                alert('CLICK: New File');
            });

            // OPEN

            const formOpen = document.createElement('form');
            formOpen.style.display = 'none';
            document.body.appendChild(formOpen);

            const fileDialog = document.createElement('input');
            fileDialog.type = 'file';
            fileDialog.addEventListener('change', function() {
                Loader.loadFiles(fileDialog.files);
                formOpen.reset();
            });
            formOpen.appendChild(fileDialog);

            fileOpen.onSelect(() => {
                fileDialog.accept = '.eye';
                fileDialog.multiple = false;
                fileDialog.click();
            });

            // SAVE

            function formatJSON(json) {
                try {
                    json = JSON.stringify(json, null, '\t');                    // convert to string, add tab spacing
                    json = json.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');      // removes array line breaks
                } catch (error) {
                    json = JSON.stringify(json);
                }
                return json;
            }

            fileSave.onSelect(() => {
                const output = formatJSON(editor.project.toJSON());
                const filename = ((editor.project.name !== '') ? editor.project.name : 'untitled') + '.eye';
                SALT.System.saveString(output, filename);
            });

            // IMPORT

            fileImport.onSelect(() => {
                fileDialog.accept = '*/*';
                fileDialog.multiple = true;
                fileDialog.click();
            });

            // EXPORT

            const menuExport = new SUEY.Menu();
            const exportObject = new SUEY.MenuItem('Object', '');

            menuExport.add(exportObject);
            fileExport.attachSubMenu(menuExport);

            exportObject.onSelect(() => {

                // TODO: Exports!
                alert('CLICK: Export Object');

                // if (editor.selected.length === 0) {
                //     alert('No object selected!');
                // } else if (!editor.selected[0].isObject3D) {
                //     alert('Selection is not an Object!');
                // } else{
                //     const object = editor.selected[0];
                //     const output = formatJSON(object.toJSON());
                //     const filename = ((object.name !== '') ? object.name : 'object') + '.json';
                //     SALT.System.saveString(output, filename);
                // }

            });

            // PUBLISH

            filePublish.onSelect(() => {
                const output = formatJSON(editor.project.toJSON());

                const toZip = {};
                toZip['data/project.eye'] = strToU8(output);

                const title = editor.project.name;

                // const manager = new THREE.LoadingManager(function() {
                //     const zipped = zipSync(toZip, { level: 9 });
                //     const filename = ((title !== '') ? title : 'untitled') + '.zip';
                //     SALT.System.saveBuffer(zipped.buffer, filename, 'application/zip');
                // });

                // const loader = new THREE.FileLoader(manager);
                // loader.load('./src/export/index.html', function(content) {
                //     content = content.replace('<!-- TITLE -->', title);
                //     toZip['index.html'] = strToU8(content);
                // });
                // loader.load('./src/libs/salinity.min.js', function(content) {
                //     toZip['libs/salinity.min.js'] = strToU8(content);
                // });
                // loader.load('./src/libs/graphics/three.module.js', function(content) {
                //     toZip['libs/three.module.js'] = strToU8(content);
                // });
            });
        }

        /******************** MENU: EDIT ********************/

        let editUndo, editRedo, editCopy, editCut, editPaste, editDuplicate, editDelete, editAll, editNone;

        if (useEdit) {
            editUndo = new SUEY.MenuItem(Language.getKey('menubar/edit/undo'), `${FOLDER_MENU}main/edit/undo.svg`, `${SALT.System.metaKeyOS()}Z`).keepOpen();
            editRedo = new SUEY.MenuItem(Language.getKey('menubar/edit/redo'), `${FOLDER_MENU}main/edit/redo.svg`, `⇧${SALT.System.metaKeyOS()}Z`).keepOpen();
            editCut = new SUEY.MenuItem(Language.getKey('menubar/edit/cut'), `${FOLDER_MENU}main/edit/cut.svg`, `${SALT.System.metaKeyOS()}X`);
            editCopy = new SUEY.MenuItem(Language.getKey('menubar/edit/copy'), `${FOLDER_MENU}main/edit/copy.svg`, `${SALT.System.metaKeyOS()}C`);
            editPaste = new SUEY.MenuItem(Language.getKey('menubar/edit/paste'), `${FOLDER_MENU}main/edit/paste.svg`, `${SALT.System.metaKeyOS()}V`);
            editDuplicate = new SUEY.MenuItem(Language.getKey('menubar/edit/duplicate'), `${FOLDER_MENU}main/edit/duplicate.svg`, 'D');
            editDelete = new SUEY.MenuItem(Language.getKey('menubar/edit/delete'), `${FOLDER_MENU}main/edit/delete.svg`, '⌫');
            editAll = new SUEY.MenuItem(Language.getKey('menubar/edit/all'), `${FOLDER_MENU}main/edit/all.svg`, `${SALT.System.metaKeyOS()}A`);
            editNone = new SUEY.MenuItem(Language.getKey('menubar/edit/none'), `${FOLDER_MENU}main/edit/none.svg`, '⎋');

            editCut.setDisabled(true);
            editCopy.setDisabled(true);
            editPaste.setDisabled(true);

            editUndo.onSelect(() => { editor.undo(); });
            editRedo.onSelect(() => { editor.redo(); });
            editCopy.onSelect(() => { editor.copy(); });
            editCut.onSelect(() => { editor.cut(); });
            editPaste.onSelect(() => { editor.paste(); });
            editDuplicate.onSelect(() => { editor.duplicate('d'); });
            editDelete.onSelect(() => { editor.delete(); });
            editAll.onSelect(() => { editor.selectAll(); });
            editNone.onSelect(() => { editor.selectNone(); });

            // Clipboard changed
            Signals.connect(this, 'clipboardChanged', function() {
                const hasEntities = editor.clipboard.containsEntities();
                editPaste.setDisabled(!hasEntities);
            });

            // History changed
            Signals.connect(this, 'historyChanged', function() {
                editUndo.setDisabled(editor.history.undos.length == 0);
                editRedo.setDisabled(editor.history.redos.length == 0);
            });

            // Disable menu items when no selection
            Signals.connect(this, 'selectionChanged', function() {
                const entitiesSelected = editor.selected.length;
                editCut.setDisabled(entitiesSelected === 0);
                editCopy.setDisabled(entitiesSelected === 0);
                editDuplicate.setDisabled(entitiesSelected === 0);
                editDelete.setDisabled(entitiesSelected === 0);
                editNone.setDisabled(entitiesSelected === 0);
            });
        }

        /******************** MENU: WINDOW ********************/

        let windowHide, windowShow;
        let windowItems = [];
        let windowFullscreen;

        if (useWindow) {
            const fullscreenTxt = `${SALT.System.metaKeyOS()}↵`; // i.e. Ctrl + "Enter" or "Return"

            windowHide = new SUEY.MenuItem(Language.getKey('menubar/window/hide'), `${FOLDER_MENU}main/window/hide-panels.svg`).keepOpen();
            windowShow = new SUEY.MenuItem(Language.getKey('menubar/window/show'), `${FOLDER_MENU}main/window/show-panels.svg`).keepOpen();
            windowFullscreen = new SUEY.MenuItem(Language.getKey('menubar/window/fullscreen'), `${FOLDER_MENU}main/window/fullscreen.svg`, fullscreenTxt);

            windowHide.onSelect(() => editor.docker.collapseTabs());
            windowShow.onSelect(() => editor.docker.expandTabs());
            windowFullscreen.onSelect(() => { SALT.System.fullscreen(); });

            // Toggle Window Types
            function toggleWindow(windowMenuItem, windowName) {
                if (windowMenuItem.checked) Layout.removeFloater(editor.getFloaterByID(windowName, false, false));
                else editor.getFloaterByID(windowName, true /* build? */, true /* select? */);
            }
            for (const type in Layout.allFloaters()) {
                const windowItem = new SUEY.MenuItem(`Show ${SUEY.Strings.capitalize(type)}`).keepOpen();
                windowItem.onSelect(() => toggleWindow(windowItem, type));
                windowItem.floaterType = type;
                windowItems.push(windowItem);
            }

            // Update Items on Tabs Changed
            function updateWindowItems() {
                for (const windowItem of windowItems) {
                    windowItem.setChecked(editor.getFloaterByID(windowItem.floaterType, false, false));
                }
            }
            editor.on('tabs-changed', updateWindowItems);

            // Update Items on Editor Mode Changed
            Signals.connect(editor, 'editorModeChanged', () => {
                const allowed = editor.viewport().floaterFamily();
                for (const windowItem of windowItems) {
                    windowItem.setStyle('display', allowed.includes(windowItem.floaterType) ? '' : 'none');
                }
                updateWindowItems();
            });
        }

        /******************** MENU: HELP ********************/

        let helpSamples, helpManual, helpFaq, helpTutorials, helpContact, helpBug, helpGithub, helpAbout;

        if (useHelp) {
            helpSamples = new SUEY.MenuItem(Language.getKey('menubar/help/samples'), `${FOLDER_MENU}main/help/samples.svg`);
            helpManual = new SUEY.MenuItem(Language.getKey('menubar/help/manual'), `${FOLDER_MENU}main/help/manual.svg`);
            helpFaq = new SUEY.MenuItem(Language.getKey('menubar/help/faq'), `${FOLDER_MENU}main/help/faq.svg`);
            helpTutorials = new SUEY.MenuItem(Language.getKey('menubar/help/tutorials'), `${FOLDER_MENU}main/help/tutorial.svg`);
            helpContact = new SUEY.MenuItem(Language.getKey('menubar/help/contact'), `${FOLDER_MENU}main/help/contact.svg`);
            helpBug = new SUEY.MenuItem(Language.getKey('menubar/help/bug'), `${FOLDER_MENU}main/help/bug.svg`);
            helpGithub = new SUEY.MenuItem(Language.getKey('menubar/help/github'), `${FOLDER_MENU}main/help/github.svg`);
            helpAbout = new SUEY.MenuItem(Language.getKey('menubar/help/about'), `${FOLDER_MENU}main/help/about.svg`);

            helpGithub.onSelect(() => window.open('https://github.com/salinityengine', '_blank').focus());
        }

        /******************** MENU: BUILD ********************/

        const itemFile =    new SUEY.MenuItem(Language.getKey('menubar/file'), `${FOLDER_MENU}main/file.svg`);
        const itemEdit =    new SUEY.MenuItem(Language.getKey('menubar/edit'), `${FOLDER_MENU}main/edit.svg`);
        const itemWindow =  new SUEY.MenuItem(Language.getKey('menubar/window'), `${FOLDER_MENU}main/window.svg`);
        const itemHelp =    new SUEY.MenuItem(Language.getKey('menubar/help'), `${FOLDER_MENU}main/help.svg`);

        if (useFile) {
            itemFile.attachSubMenu(new SUEY.Menu().add(
                fileNew, fileOpen, fileSave,
                new SUEY.MenuSeparator(), fileImport, fileExport,
                new SUEY.MenuSeparator(), filePublish, /* new SUEY.MenuSeparator(), fileClose */
            ));
            this.add(itemFile);
        }

        if (useEdit) {
            itemEdit.attachSubMenu(new SUEY.Menu().add(
                editUndo, editRedo,
                new SUEY.MenuSeparator(), editCut, editCopy, editPaste,
                new SUEY.MenuSeparator(), editDuplicate, editDelete,
                new SUEY.MenuSeparator(), editAll, editNone
            ));
            this.add(itemEdit);
        }

        if (useWindow) {
            itemWindow.attachSubMenu(new SUEY.Menu().add(
                windowHide, windowShow,
                new SUEY.MenuSeparator(), ...windowItems,
                new SUEY.MenuSeparator(), windowFullscreen
            ));
            this.add(itemWindow);
        }

        if (useHelp) {
            itemHelp.attachSubMenu(new SUEY.Menu().add(
                // helpSamples,
                // new SUEY.MenuSeparator(), helpManual, helpFaq, helpTutorials, helpContact, helpBug,
                helpGithub,
                new SUEY.MenuSeparator(), helpAbout
            ));
            this.add(itemHelp);
        }

    } // end ctor

}

export { EyeMenu };

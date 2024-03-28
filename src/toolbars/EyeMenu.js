// PROPERTIES
//  checked:    .setChecked(true / false);
//  disabled:   .setDisabled(true / false);

import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { zipSync, strToU8 } from '../libs/fflate.module.js';

class EyeMenu extends SUEY.Menu {

    constructor() {
        super();

        // Properties
        this.menuType = 'extended';
        // this.menuType = 'simple'; /* NOT IMPLEMENTED */

        // Enable / Disable Menu Items
        const useFile = true;
        const useEdit = true;
        const useWindow = true;
        const useHelp = true;

        /******************** MENU: FILE ********************/

        let fileNew, fileOpen, fileSave, fileImport, fileExport, filePublish, fileClose;

        if (useFile) {
            fileNew = new SUEY.MenuItem('New !!', `${EDITOR.FOLDER_MENU}main/file/new.svg`);
            fileOpen = new SUEY.MenuItem('Open', `${EDITOR.FOLDER_MENU}main/file/open.svg`);
            fileSave = new SUEY.MenuItem('Save', `${EDITOR.FOLDER_MENU}main/file/save.svg`);
            fileImport = new SUEY.MenuItem('Import', `${EDITOR.FOLDER_MENU}main/file/import.svg`);
            fileExport = new SUEY.MenuItem('Export', `${EDITOR.FOLDER_MENU}main/file/export.svg`);
            filePublish = new SUEY.MenuItem('Publish', `${EDITOR.FOLDER_MENU}main/file/publish.svg`);
            fileClose = new SUEY.MenuItem('Exit !!', ``);

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

                editor.loader.loadFiles(fileDialog.files);

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
            editUndo = new SUEY.MenuItem('Undo', `${EDITOR.FOLDER_MENU}main/edit/undo.svg`, `${SALT.System.metaKeyOS()}Z`).keepOpen();
            editRedo = new SUEY.MenuItem('Redo', `${EDITOR.FOLDER_MENU}main/edit/redo.svg`, `⇧${SALT.System.metaKeyOS()}Z`).keepOpen();
            editCut = new SUEY.MenuItem('Cut', `${EDITOR.FOLDER_MENU}main/edit/cut.svg`, `${SALT.System.metaKeyOS()}X`);
            editCopy = new SUEY.MenuItem('Copy', `${EDITOR.FOLDER_MENU}main/edit/copy.svg`, `${SALT.System.metaKeyOS()}C`);
            editPaste = new SUEY.MenuItem('Paste', `${EDITOR.FOLDER_MENU}main/edit/paste.svg`, `${SALT.System.metaKeyOS()}V`);
            editDuplicate = new SUEY.MenuItem('Duplicate', `${EDITOR.FOLDER_MENU}main/edit/duplicate.svg`, 'D');
            editDelete = new SUEY.MenuItem('Delete', `${EDITOR.FOLDER_MENU}main/edit/delete.svg`, '⌫');
            editAll = new SUEY.MenuItem('Select All', `${EDITOR.FOLDER_MENU}main/edit/all.svg`, `${SALT.System.metaKeyOS()}A`);
            editNone = new SUEY.MenuItem('Select None', `${EDITOR.FOLDER_MENU}main/edit/none.svg`, '⎋');

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
        let windowFullscreen;

        if (useWindow) {
            windowHide = new SUEY.MenuItem('Hide All Panels', `${EDITOR.FOLDER_MENU}main/window/hide-panels.svg`).keepOpen();
            windowShow = new SUEY.MenuItem('Show All Panels', `${EDITOR.FOLDER_MENU}main/window/show-panels.svg`).keepOpen();

            const fullscreenTxt = `${SALT.System.metaKeyOS()}↵`; // i.e. "Enter" or "Return"
            windowFullscreen = new SUEY.MenuItem('Enter Fullscreen', `${EDITOR.FOLDER_MENU}main/window/fullscreen.svg`, fullscreenTxt);

            windowHide.onSelect(() => editor.collapseTabs());
            windowShow.onSelect(() => editor.expandTabs());
            windowFullscreen.onSelect(() => { SALT.System.fullscreen(); });
        }

        /******************** MENU: HELP ********************/

        let helpSamples, helpManual, helpFaq, helpTutorials, helpContact, helpBug, helpAbout;

        if (useHelp) {
            helpSamples = new SUEY.MenuItem('Sample Projects !!', `${EDITOR.FOLDER_MENU}main/help/samples.svg`);
            helpManual = new SUEY.MenuItem('Manual !!', `${EDITOR.FOLDER_MENU}main/help/manual.svg`);
            helpFaq = new SUEY.MenuItem('FAQ !!', `${EDITOR.FOLDER_MENU}main/help/faq.svg`);
            helpTutorials = new SUEY.MenuItem('Tutorials !!', `${EDITOR.FOLDER_MENU}main/help/tutorial.svg`);
            helpContact = new SUEY.MenuItem('Contact !!', `${EDITOR.FOLDER_MENU}main/help/contact.svg`);
            helpBug = new SUEY.MenuItem('Bug Report !!', `${EDITOR.FOLDER_MENU}main/help/bug.svg`);
            helpAbout = new SUEY.MenuItem('About !!', `${EDITOR.FOLDER_MENU}main/help/about.svg`);
        }

        /******************** MENU: EXTENDED ********************/

        if (this.menuType === 'extended') {
            const itemFile =      new SUEY.MenuItem('File', `${EDITOR.FOLDER_MENU}main/file.svg`);
            const itemEdit =      new SUEY.MenuItem('Edit', `${EDITOR.FOLDER_MENU}main/edit.svg`);
            const itemWindow =    new SUEY.MenuItem('Window', `${EDITOR.FOLDER_MENU}main/window.svg`);
            const itemHelp =      new SUEY.MenuItem('Help', `${EDITOR.FOLDER_MENU}main/help.svg`);

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
                    windowHide, windowShow, new SUEY.MenuSeparator(),
                    windowFullscreen
                ));
                this.add(itemWindow);
            }

            if (useHelp) {
                itemHelp.attachSubMenu(new SUEY.Menu().add(
                    helpSamples,
                    new SUEY.MenuSeparator(), helpManual, helpFaq, helpTutorials, helpContact, helpBug,
                    new SUEY.MenuSeparator(), helpAbout
                ));
                this.add(itemHelp);
            }
        }

    } // end ctor

}

export { EyeMenu };

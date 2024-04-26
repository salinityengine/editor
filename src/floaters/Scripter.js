import {
    FOLDER_FLOATERS,
 } from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { Scrimp } from 'scrimp';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';
import { Layout } from '../config/Layout.js';
import { Signals } from '../config/Signals.js';

import { AddAssetCommand } from '../commands/CommandList.js';
import { SetAssetValueCommand } from '../commands/CommandList.js';
import { SetScriptSourceCommand } from '../commands/CommandList.js';

/**
 * Script Editor
 */
class Scripter extends SmartFloater {

    mode = SALT.SCRIPT_FORMAT.JAVASCRIPT;
    script = null;

    constructor() {
        const icon = `${FOLDER_FLOATERS}scripter.svg`;
        super('scripter', { titled: false, icon, color: '#090B11', shrink: '75%' });
        const self = this;
        this.addClass('salt-scripter');
        this.addClass('suey-custom-font');
        Advice.attach(this.button, 'floater/scripter');

        /********** TITLE */

        const tabTitle = new SUEY.Div().addClass('suey-tab-title');
        tabTitle.add(new SUEY.Text('Scripter').addClass('suey-tab-title-text'));
        this.add(tabTitle);
        this.tabTitle = tabTitle;

        /********** EVENTS */

        // Focus on Scrimp when parent dock gains focus
        this.on('activate-window', () => {
            if (scrimp) setTimeout(() => scrimp.focus(), 0);
        });

        // Dispose of things when Window 'X' is clicked
        this.on('destroy', () => {
            // Clean up codemirror
            scrimp.destroy();

            // Highlight script
            if (self.script && self.script.isScript) {
                Signals.dispatch('assetSelect', 'script', self.script);
            }
        });

        /********** SCRIPT NAME */

        const nameRow = new SUEY.FlexBox();
        const scriptGutter = new SUEY.Text('').addClass('salt-script-gutter').selectable(false);
        const scriptName = new SUEY.TextBox().addClass('salt-script-name');
        const scriptRight = new SUEY.Text('').addClass('salt-script-right').selectable(false);
        this.add(nameRow.add(scriptGutter, scriptName, scriptRight));
        this.scriptGutter = scriptGutter;
        this.scriptName = scriptName;

        scriptName.on('input', () => {
            if (self.script && self.script.isScript) {
                editor.execute(new SetAssetValueCommand(self.script, 'name', scriptName.getValue()));
            }
        });

        /********** SCRIMP (CODEMIRROR) */

        const wrapper = new SUEY.Div().addClass('salt-script-wrapper');
        this.add(wrapper, new SUEY.FlexBox());

        const scrimp = new Scrimp(wrapper.dom, { theme: 'suey', initialContents: '' });
        this.scrimp = scrimp;
        this.scroller = scrimp;

        // UPDATE
        let updateTimeout;
        function onUpdate(viewUpdate) {
            // Replace native tooltips (HTMLElement.title) with custom tooltips
            const queue = [ scrimp.dom ];
            while (queue.length > 0) {
                const currentElement = queue.shift();
                for (const child of currentElement.children) {
                    if (child.hasAttribute('title')) {
                        const tooltip = child.getAttribute('title');
                        child.removeAttribute('title');
                        child.setAttribute('tooltip', tooltip);
                    }
                    queue.push(child);
                }
            }

            // Name Gutter Width
            const cmGutter = SUEY.Dom.childWithClass(scrimp.dom, 'cm-gutters');
            if (cmGutter) {
                const gutterRect = cmGutter.getBoundingClientRect();
                scriptGutter.setStyle('width', `${gutterRect.width}px`);
            }

            // Document Changed
            if (viewUpdate.docChanged) {
                const script = self.script;
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(() => {
                    if (!self.script || !self.script.isScript) return;
                    const value = scrimp.getContent();
                    // //
                    // TODO: !validate(value);
                    //
                    const hasErrors = false;
                    //
                    // //
                    if (value !== script.source) {
                        editor.execute(new SetScriptSourceCommand(script, value, hasErrors));
                    }
                }, 300);
            }
        }
        scrimp.addUpdate(onUpdate);

        // KEY: Save
        function onKeySave() {
            if (!self.script) {
                const script = new SALT.Script();
                script.name = self.scriptName.getValue();
                script.source = scrimp.getContent();
                editor.execute(new AddAssetCommand(script));
                self.script = script;
                self.dock.focus();
            }
        }
        scrimp.addKeymap('Ctrl-s', onKeySave);
        scrimp.addKeymap('Meta-s', onKeySave);

        /***** VALIDATE *****/

        // const errorLines = [];
        // const lineWidgets = [];
        //
        // const validate = function(string) {
        //     return codemirror.operation(function() {
        //         while (errorLines.length > 0) {
        //             codemirror.removeLineClass(errorLines.shift(), 'background', 'errorLine');
        //         }
        //         while (lineWidgets.length > 0) {
        //             codemirror.removeLineWidget(lineWidgets.shift());
        //         }
        //
        //         let errors = [];
        //         switch (self.mode) {
        //             case SALT.SCRIPT_FORMAT.JAVASCRIPT:
        //                 // // OPTION: 'esprima' (original Three.js)
        //                 try {
        //                     const syntax = esprima.parse(string, { tolerant: true });
        //                     // console.log(syntax);
        //                     errors = syntax.errors;
        //                 } catch (error) {
        //                     errors.push({
        //                         lineNumber: error.lineNumber - 1,
        //                         message: error.message,
        //                     });
        //                 }
        //                 for (let i = 0; i < errors.length; i++) {
        //                     const error = errors[i];
        //                     error.message = error.message.replace(/Line [0-9]+: /, '');
        //                 }
        //
        //                 // // OPTION: 'jshint' (experimental)
        //                 // const jshintOptions = '/* jshint esversion: 6, asi: true */';
        //                 // JSHINT(jshintOptions + '\n' + string);
        //                 // for (let i = 0; i < JSHINT.errors.length; ++i) {
        //                 //     let error = JSHINT.errors[i];
        //                 //     errors.push({
        //                 //         lineNumber: error.line - 1,
        //                 //         message: error.reason,
        //                 //     });
        //                 // }
        //
        //                 break;
        //             case 'json':
        //                 //
        //                 // NOT IMPLEMENTED
        //                 //
        //                 break;
        //             case 'glsl':
        //                 //
        //                 // NOT IMPLEMENTED
        //                 //
        //                 break;
        //             default: ;
        //         }
        //
        //         // Add Errors
        //         for (const error of errors) {
        //             const message = document.createElement('div');
        //             message.className = 'errorMessage';
        //             message.textContent = error.message;
        //
        //             const lineNumber = Math.max(error.lineNumber, 0);
        //             errorLines.push(lineNumber);
        //             codemirror.addLineClass(lineNumber, 'background', 'errorLine');
        //
        //             const lineOptions = {
        //                 coverGutter: false,
        //                 noHScroll: true
        //             };
        //             const widget = codemirror.addLineWidget(lineNumber, message, lineOptions);
        //             lineWidgets.push(widget);
        //         }
        //
        //         return (errors.length === 0);
        //     });
        // };

        /***** TERN JS AUTOCOMPLETE *****/

        // const server = new CodeMirror.TernServer({
        //     caseInsensitive: true,
        //     plugins: { threejs: null }
        // });

        // codemirror.setOption('extraKeys', {
        //     'Ctrl-Space': function(cm)  { server.complete(cm); },
        //     'Ctrl-I': function(cm)      { server.showType(cm); },
        //     'Ctrl-O': function(cm)      { server.showDocs(cm); },
        //     'Alt-.': function(cm)       { server.jumpToDef(cm); },
        //     'Alt-,': function(cm)       { server.jumpBack(cm); },
        //     'Ctrl-Q': function(cm)      { server.rename(cm); },
        //     'Ctrl-.': function(cm)      { server.selectName(cm); },
        // });

        // codemirror.on('cursorActivity', function(cm) {
        //     if (self.script && self.script.isScript) {
        //         const pos = codemirror.getCursor();
        //         self.script.line = pos.line;
        //         self.script.char = pos.ch;
        //     }
        //     if (self.mode !== SALT.SCRIPT_FORMAT.JAVASCRIPT) return;
        //     server.updateArgHints(cm);
        // });

        // codemirror.on('keypress', function(cm, kb) {
        //     if (self.mode !== SALT.SCRIPT_FORMAT.JAVASCRIPT) return;
        //     const typed = String.fromCharCode(kb.which || kb.keyCode);
        //     if (/[\w\.]/.exec(typed)) {
        //         server.complete(cm);
        //     }
        // });

        /***** SIGNALS *****/

        Signals.connect(this, 'assetChanged', (type, script) => {
            // Checks
            if (type !== 'script' || !script || !script.isScript) return;
            if (!self.script || self.script.uuid !== script.uuid) return;
            // Update Elements
            if (self.scriptName.getValue() !== script.name) self.scriptName.setValue(script.name);
            if (self.scrimp.getContent() !== script.source) self.scrimp.setContent(script.source);
        });

        Signals.connect(this, 'assetRemoved', (type, script) => {
            // Checks
            if (type !== 'script' || !script || !script.isScript) return;
            if (!self.script || self.script.uuid !== script.uuid) return;
            // Remove Self
            Layout.removeFloater(self);
        });

    } // end ctor

    loadScript(script) {
        // Script
        if (script && script.isScript) {
            this.scriptName.setValue(script.name);
            this.script = script;
            this.mode = script.format;
            this.scrimp.setLanguage(this.mode);
            this.scrimp.setContent(script.source);
        // Empty
        } else {
            this.scriptName.setValue('None');
            this.script = null;
            this.mode = SALT.SCRIPT_FORMAT.JAVASCRIPT;
            this.scrimp.setLanguage(this.mode);
            this.scrimp.setContent('');
        }

        //
        // TODO: codemirror.setCursor(script.line, script.char);
        //

        this.scrimp.clearHistory();
    }

}

export { Scripter };

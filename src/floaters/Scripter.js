import {
    FOLDER_FLOATERS,
 } from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { Scrimp } from 'scrimp';
import { SmartFloater } from '../gui/SmartFloater.js';

import { Advice } from '../config/Advice.js';

// import { SetAssetValueCommand } from '../commands/CommandList.js';
// import { SetScriptSourceCommand } from '../commands/CommandList.js';

/**
 * Script Editor
 */
class Scripter extends SmartFloater {

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
            if (scrimp) scrimp.focus();
        });

        // Dispose of things when Window 'X' is clicked
        this.on('destroy', () => {
            scrimp.destroy(); // clean up codemirror
        });

        /********** SCRIPT NAME */

        const scriptName = new SUEY.TextBox().addClass('salt-script-name');
        this.add(scriptName);

        // scriptName.on('change', () => {
        //     if (currentScript && currentScript.isScript) {
        //         editor.execute(new SetAssetValueCommand(currentScript, 'name', scriptName.getValue()));
        //     }
        // });

        /********** WRAPPER */

        const wrapper = new SUEY.Div().addClass('salt-script-wrapper');
        this.add(wrapper, new SUEY.FlexBox());

        /********** SCRIMP (CODEMIRROR) */

        // Internal Variables
        let renderer = null; //editor.viewport.renderer;
        let delay;
        let currentMode;
        let currentScript;
        let editing = false;

        let initialContents =
`function updateSize() {
    const width = Math.max(1, self.contents().getWidth());
    const height = Math.max(1, self.contents().getHeight());
    app.setSize(width, height);
}

this.on('resizer', updateSize);
window.addEventListener('resize', updateSize);

// Stop Player when Window 'X' is clicked
this.on('hidden', () => {
    console.warn('Player.on("hidden"): Player should be destroyed, not hidden');
});

this.on('destroy', () => {
    window.removeEventListener('resize', updateSize);
    self.stop();
});`;

        const scrimp = new Scrimp(wrapper.dom, { theme: 'suey', initialContents });
        this.scroller = scrimp;

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

            // Document Changed
            if (viewUpdate.docChanged) {


            }
        }
        scrimp.addUpdate(onUpdate);

        // // Codemirror: On Change
        // scrimp.on('change', function() {
        //    console.log('Script changed');
        //     if (scrimp.state.focused === false) return;
        //     clearTimeout(delay);
        //     delay = setTimeout(function() {
        //         const value = scrimp.getValue();
        //         const hasErrors = !validate(value);
        //         if (typeof currentScript === 'object') {
        //             if (value !== currentScript.source) {
        //                 editor.execute(new SetScriptSourceCommand(currentScript, value, hasErrors));
        //             }
        //             return;
        //         }
        //     }, 300);
        // });

        function onKeySave() {
            //
            // TODO: Make sure script is saved. Close scripter?
            //
            console.log('TODO: Script wants save');
        }
        scrimp.addKeymap('Ctrl-s', onKeySave);
        scrimp.addKeymap('Meta-s', onKeySave);

        /***** VALIDATE *****/

        // const errorLines = [];
        // const lineWidgets = [];

        // const validate = function(string) {
        //     return codemirror.operation(function() {
        //         while (errorLines.length > 0) {
        //             codemirror.removeLineClass(errorLines.shift(), 'background', 'errorLine');
        //         }
        //         while (lineWidgets.length > 0) {
        //             codemirror.removeLineWidget(lineWidgets.shift());
        //         }

        //         let errors = [];
        //         switch (currentMode) {
        //             case 'javascript':
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

        //         // Add Errors
        //         for (const error of errors) {
        //             const message = document.createElement('div');
        //             message.className = 'errorMessage';
        //             message.textContent = error.message;

        //             const lineNumber = Math.max(error.lineNumber, 0);
        //             errorLines.push(lineNumber);
        //             codemirror.addLineClass(lineNumber, 'background', 'errorLine');

        //             const lineOptions = {
        //                 coverGutter: false,
        //                 noHScroll: true
        //             };
        //             const widget = codemirror.addLineWidget(lineNumber, message, lineOptions);
        //             lineWidgets.push(widget);
        //         }

        //         return (errors.length === 0);
        //     });
        // };

        // /***** TERN JS AUTOCOMPLETE *****/

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
        //     // Enable Comments
        //     'Cmd-/': function(cm)       { cm.execCommand('toggleCommentIndented'); },
        //     'Ctrl-/': function(cm)      { cm.execCommand('toggleCommentIndented'); },
        // });

        // codemirror.on('cursorActivity', function(cm) {
        //     if (editing && currentScript && currentScript.isScript) {
        //         const pos = codemirror.getCursor();
        //         currentScript.line = pos.line;
        //         currentScript.char = pos.ch;
        //     }
        //     if (currentMode !== 'javascript') return;
        //     server.updateArgHints(cm);
        // });

        // codemirror.on('keypress', function(cm, kb) {
        //     if (currentMode !== 'javascript') return;
        //     const typed = String.fromCharCode(kb.which || kb.keyCode);
        //     if (/[\w\.]/.exec(typed)) {
        //         server.complete(cm);
        //     }
        // });

        // /***** SIGNALS *****/

        // signals.assetRemoved.add(function(type, script) {
        //     if (type !== 'script') return;
        //     if (script && currentScript && currentScript.uuid === script.uuid) {
        //         self.hide();
        //     }
        // });

        // signals.editScript.add(function(script) {
        //     editing = false;
        //     // Set Script
        //     scriptName.setValue(script.name);
        //     currentMode = 'javascript';
        //     currentScript = script;
        //     // Display Scripter
        //     self.showWindow();
        //     // Update CodeMirror
        //     codemirror.setValue(script.source);
        //     codemirror.clearHistory();
        //     codemirror.setOption('mode', currentMode);
        //     validate(codemirror.getValue());
        //     // Set Focus
        //     codemirror.display.input.focus();
        //     codemirror.setCursor(script.line, script.char);
        //     editing = true;
        // });

        // /***** EVENTS *****/

        // this.on('hidden', () => {
        //     editing = false;
        //     if (currentScript && currentScript.isScript) {
        //         signals.assetSelect.dispatch('script', currentScript);
        //     }
        // });

    } // end ctor

}

export { Scripter };

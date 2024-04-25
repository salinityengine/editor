class Command {

    constructor() {
        this.isCommand = true;
        this.id = -1;
        this.type = this.constructor.name;
        this.brief = '';
        this.inMemory = false;
        this.updatable = false;
        this.valid = true;
    }

    /** Used to cancel command during constructor, see example in SelectCommand. */
    cancel(msg) {
        if (msg) console.warn(msg);
        this.valid = false;
        return this;
    }

    /** Called when command is not valid, or when Commands stack is cleared. Good time to dispose() of things. */
    purge() {
        //
        // OVERLOAD
        //
    }

    execute() {
        console.warn(`${this.constructor.name}.execute(): Method must be reimplemented`);
    }

    undo() {
        console.warn(`${this.constructor.name}.undo(): Method must be reimplemented`);
    }

    /** Called when command is executed again after 'undo()' has been previously called. */
    redo() {
        this.execute();
    }

}

export { Command };

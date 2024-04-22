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

    /** Used to cancel command during constructor, see example in SelectCommand */
    cancel(msg) {
        if (msg) console.warn(msg);
        this.valid = false;
        return this;
    }

    /** Called when command is determined to be invalid and is not executed */
    invalid() {
        /** OVERLOAD */
    }

    /** Called when Commands stack is cleared, good time to dispose() of things */
    purge() {
        /** OVERLOAD */
    }

    /** Called when command is executed again after having been previously 'undo()' */
    redo() {
        this.execute();
    }

}

export { Command };

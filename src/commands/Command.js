class Command {

    constructor() {
        this.isCommand = true;
        this.id = -1;
        this.type = '';
        this.brief = '';
        this.inMemory = false;
        this.updatable = false;
        this.valid = true; /* used to cancel command during constructor, see example SelectCommand */
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

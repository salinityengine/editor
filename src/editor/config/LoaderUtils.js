// https://github.com/mrdoob/three.js/blob/master/editor/js/LoaderUtils.js

class LoaderUtils {

    static createFilesMap(files) {
        const map = {};
        for (const file of files) {
            map[file.name] = file;
        }
        return map;
    }

    static getFilesFromItemList(items, onDone) {
        let itemsCount = 0;
        let itemsTotal = 0;

        const files = [];
        const filesMap = {};

        function onEntryHandled() {
            itemsCount++;
            if (itemsCount === itemsTotal) onDone(files, filesMap);
        }

        function handleEntry(entry) {
            if (entry.isDirectory) {
                const reader = entry.createReader();
                reader.readEntries(function(entries) {
                    for (const entry of entries) {
                        handleEntry(entry);
                    }
                    onEntryHandled();
                });
            } else if (entry.isFile) {
                entry.file(function(file) {
                    files.push(file);
                    filesMap[entry.fullPath.slice(1)] = file;
                    onEntryHandled();
                });
            }
            itemsTotal++;
        }

        for (const item of items) {
            if (item.kind === 'file') {
                handleEntry(item.webkitGetAsEntry());
            }
        }
    }

}

export { LoaderUtils };

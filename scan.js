var path = require('path'),
    fs = require('graceful-fs'),
    sep = path.sep;

/**
 * @param {String} dir
 * @param {Object} [opts]
 * @param {Function} [opts.scanner]
 * @param {Function} callback
 */
module.exports = function scanFiles(dir, opts, callback) {
    if(!callback) {
        callback = opts;
        opts = {};
    }

    dir = path.resolve(dir);

    if(!fs.existsSync(dir)) {
        return callback(new Error('level does not exists "' + dir + '"'));
    }

    var list = {},
        blocks = {},
        flat = [],
        files = {
            files : list,
            tree : blocks,
            blocks : flat
        },
        items = { push : push },
        scanBlock = opts.scanner || scanElem;

    scanBlocks(dir, scanBlock, function(err) {
        if(err) return callback(err);
        callback(null, files);
    });

    return;

    function push(file, item) {
        file.suffix = item.suffix[0] === '.'? item.suffix.substr(1) : item.suffix;

        (list[file.suffix] || (list[file.suffix] = [])).push(file);
        flat.push(item);

        var block = blocks[item.block] || (blocks[item.block] = {elems : {}, mods : {}, files : {}});
        if(item.mod && !item.elem) {
            block = block.mods[item.mod] || (block.mods[item.mod] = {vals : {}, files : {}});

            if(item.val) block = block.vals[item.val] || (block.vals[item.val] = {files : {}});
        }

        if(item.elem) {
            block = block.elems[item.elem] || (block.elems[item.elem] = {mods : {}, files : {}});

            if(item.mod) block = block.mods[item.mod] || (block.mods[item.mod] = {vals : {}, files : {}});
            if(item.val) block = block.vals[item.val] || (block.vals[item.val] = {files : {}});
        }

        (block.files[file.suffix] || (block.files[file.suffix] = [])).push(file);
    }

    function scanBlocks(dir, scanner, callback) {
        scanner = scanner.bind(null);
        walk(dir, function(f, next) { scanner(f, null, items, next) }, callback);
    }

    function scanElem(block, elem, items, callback) {
        var blockPart = block.file,
            dir = block.fullpath;

        if(elem) {
            blockPart += elem.file;
            dir = elem.fullpath;
        }

        blockPart += '.';
        var blockPartL = blockPart.length;

        walk(dir, function(f, next) {
            var file = f.file,
                isLooksGood = file.substr(0, blockPartL) === blockPart;

            if(f.stat.isFile() && !isLooksGood) {
                next();
                return;
            }

            var suffix = file.substr(blockPartL - 1),
                item = {
                    block : block.file,
                    suffix : suffix
                };

            if(elem) item.elem = file;

            if(f.stat.isDirectory()) {
                if(isElemDir(file)) {
                    scanElem(block, f, items, next);
                    return;
                }
                if(isModDir(file)) {
                    scanMod(block, elem, f, items, next);
                    return;
                }
                if(!isLooksGood) {
                    next();
                    return;
                }

                items.push(f, item);

                walk(f.fullpath, function(f, next) {
                    var suffix = (file + sep + f.file).substr(blockPartL - 1),
                        item = {
                            block : block.file,
                            suffix : suffix
                        };

                    if(elem) item.elem = elem.file.substr(2);

                    items.push(f, item);
                    next();

                }, next);
                return;
            }

            items.push(f, item);

            next();

        }, callback);
    }

    function scanMod(block, elem, mod, items, callback) {
        var blockPart = block.file + (elem? elem.file : '') + mod.file,
            blockPartL = blockPart.length;

        walk(mod.fullpath, function(f, next) {
            var file = f.file;
            if(file.substr(0, blockPartL) !== blockPart) {
                next();
                return;
            }

            var modval = file.substr(blockPartL),
                val;

            if(modval[0] === '_') val = modval.substr(1);

            var suffix = modval.substr(modval.indexOf('.')),
                b = block.file,
                m = mod.file.substr(1),
                item = {
                    block : b,
                    mod : m,
                    suffix : suffix
                };

            if(elem) item.elem = elem.file.substr(2);
            if(val) item.val = val.substr(0, val.indexOf('.'));

            items.push(f, item);

            if(f.stat.isDirectory()) {
                walk(f.fullpath, function(f, next) {
                    var suffix = modval.substr(modval.indexOf('.')) + sep + f.file,
                        item = {
                            block : b,
                            mod : m,
                            suffix : suffix
                        };

                    if(elem) item.elem = elem.file.substr(2);
                    if(val) item.val = val.substr(0, val.indexOf('.'));

                    items.push(f, item);

                    next();
                }, next);
                return;
            }

            next();
        }, callback);
    }
};

function walk(dir, onFile, done) {
    fs.readdir(dir, traverse);

    function traverse(err, files) {
        if(err) {
            done(err);
            return;
        }

        var pending = files.length;
        if(pending === 0) {
            done();
            return;
        }

        files.forEach(function(file) {
            if(file[0] === '.') {
                next();
                return;
            }

            var fullpath = dir + sep + file;

            onFile({
                dir : dir,
                file : file,
                fullpath : fullpath,
                stat : fs.statSync(fullpath)
            }, next);
        });

        function next(err) {
            --pending === 0 && done(err);
        }
    }
}

function isElemDir(dir) {
    return dir.indexOf('__') === 0 && !~dir.indexOf('.');
}

function isModDir(dir) {
    return dir[0] === '_' && dir[1] !== '_';
}

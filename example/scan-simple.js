var scanl = require('..'),
    inspect = require('util').inspect;

scanl('./blocks-simple', { scanner : scanSimple }, function(err, files) {
    if(err) {
        console.error(err);
        return;
    }
    console.log(inspect(files, { depth : 3 }));
});

/**
 * Custom scanner function to parse "simple" levels.
 * @param {Object} block
 * @param {Object|null} elem
 * @param {Object} items
 * @param {Function} next
 */
function scanSimple(block, elem, items, next) {
    var file = block.file,
        underscore = file.indexOf('_'),
        dot = file.indexOf('.'),
        bk = file.substr(0, ~underscore? underscore : dot),
        el;

    if(!bk || dot < underscore) return next();

    var suffix = file.substr(dot),
        item = {
            block : bk,
            suffix : suffix
        };

    file = file.substring(0, dot);

    // block
    if(!~underscore) {
        items.push(block, item);
        next();
        return;
    }

    file = file.substr(underscore + 1);
    underscore = file.indexOf('_', 1);

    // block_elem...
    if(file[0] === '_') {
        el = file.substring(1, ~underscore? underscore : file.length);
        item.elem = el;

        // block__elem
        if(!~underscore) {
            items.push(block, item);
            next();
            return;
        }

        file = file.substr(underscore + 1);
    }

    underscore = file.indexOf('_');
    item.mod = file.substring(0, ~underscore? underscore : file.length);

    // block_mod or block__elem_mod
    if(!~underscore) {
        items.push(block, item);
        next();
        return;
    }

    // block_mod_val or block__elem_mod_val
    item.val = file.substr(underscore + 1);

    items.push(block, item);
    next();
}

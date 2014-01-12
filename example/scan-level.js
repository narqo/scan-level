var scanl = require('..'),
    inspect = require('util').inspect;

scanl('./blocks', function(err, files) {
    console.log(inspect(files, { depth : 3 }));
});

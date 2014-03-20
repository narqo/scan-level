scan-level
==========

Scan the level of definition to generate it's object model as JSON object.

Most of source code is taken from [bem-tools] project (MIT License) with
some minor refactoring.

## Example

```javascript
var scanl = require('scan-level'),
    inspect = require('util').inspect;

scanl('bem-core/common.blocks', function(err, files) {
    if(err) {
        console.error(err);
        return;
    }
    console.log(inspect(files, { depth : 3 }));
});
```

part of ouput:

```
{ files:
   { css:
      [ { dir: '/Users/varankinv/src/bem-core/common.blocks/clearfix',
          file: 'clearfix.css',
          fullpath: '/Users/varankinv/src/bem-core/common.blocks/clearfix/clearfix.css',
          stat: [Object],
          suffix: 'css' } ],
     js:
      [ { dir: '/Users/varankinv/src/bem-core/common.blocks/cookie',
          file: 'cookie.js',
          fullpath: '/Users/varankinv/src/bem-core/common.blocks/cookie/cookie.js',
          stat: [Object],
          suffix: 'js' },
          /* ... */
  tree:
   { clearfix:
      { elems: {},
        mods: {},
        files:
         { css: [Object] } },
     cookie:
      { elems: {},
        mods: {},
        files: { js: [Object], 'spec.js': [Object] } },
        /* ... */
  blocks:
   [ { block: 'clearfix', suffix: '.css' },
     { block: 'cookie', suffix: '.js' },
     { block: 'cookie', suffix: '.spec.js' },
     /* ... */
```

## Usage

```javascript
var scanl = require('scan-level');
```

### `scanl(dir, opts, cb)`

* `dir` is a string path for your level;
* `cb(err, files)` is a callback function with scanning results.

You could specify your custom function-scanner, with `opts.scanner` option.
See [scan-simple.js](example) example for usage.

## Install

Install it with [npm]:

```
› npm istall git://github.com/narqo/scan-level
```

## License

MIT

[bem-tools]: https://github.com/bem/bem-tools
[npm]: http://npmjs.org


# LogPose

[![NPM version](https://badge.fury.io/js/log-pose.png)](http://badge.fury.io/js/log-pose)
[![travis-ci](https://api.travis-ci.org/pateketrueke/log-pose.svg)](https://travis-ci.org/pateketrueke/log-pose)
[![codecov](https://codecov.io/gh/pateketrueke/log-pose/branch/master/graph/badge.svg)](https://codecov.io/gh/pateketrueke/log-pose)

Small logger interface.

```bash
$ npm i log-pose --save
# or `yarn add log-pose`
```

## API

Import the module and retrieve a shared logger instance.

```js
import LogPose from 'log-pose';

const log = LogPose.setLevel('verbose').getLogger();
```

> Calling `newLogger()` will return a single `log()` method, not an Logger instance.

- `pause()` &mdash; Pause the logging output
- `resume()` &mdash; Resume the logging output
- `setLevel(type: String|Boolean)` &mdash; Set a logging level to disable/enable verbs; if `false` is given logging gets disabled (types are: `info`, `debug`, `verbose`)
- `setLogger()` &mdash; Set the standard-output for logging; if any falsy value is given, then the entire logging is disabled
- `getLogger()` &mdash; Returns a new `Logger` instance
- `newLogger()` &mdash; Returns a single `log` method

### Logger

Created instances are functions:

```js
// single tasks
log('testing');

// prefixed tasks
log('kind', 'value');

// async tasks
async function main() {
  // single task delayed
  await log('long task', () => new Promise(resolve => setTimeout(resolve, 1000)));

  // prefixed task delayed
  await log('kind', 'value', () => new Promise(resolve => setTimeout(resolve, 1000)));

  // prefixed task delayed, with callback
  await log('write', 'filepath', done => setTimeout(() => {
    // custom feedback on logs
    done('filepath', 'failed', 'fail');
  }, 1000));
}

main();
```

Those functions also have methods:

- `printf(...)` &mdash; Prints always, with formatting enabled
- `write(...)` &mdash; Prints always, without formatting
- `info(...)` &mdash; Prints if level is `>= 0`
- `debug(...)` &mdash; Prints if level is `>= 1`
- `verbose(...)` &mdash; Prints if level is `>= 2`
- `isInfo()` &mdash; Returns `true` if level is `> 0`
- `isDebug()` &mdash; Returns `true` if level is `> 1`
- `isVerbose()` &mdash; Returns `true` if level is `> 2`
- `isEnabled()` &mdash; Returns `true` if level is `>= 0`

Formatting works replacing all `%s` for the stringified version of given values, e.g.

```js
log.info('{%info.bgBlue.white Text with spaces and values: %s%}\n', 42);
```

Available symbols are:

- `tick` &rarr; ✔
- `cross` &rarr; ✖
- `star` &rarr; ★
- `line` &rarr; ─
- `info` &rarr; ➲
- `reload` &rarr; ↺
- `pointer` &rarr; ›
- `warning` &rarr; ⚠

Built-in types are:

- `exception` &rarr; `line.bgRed.bold`
- `featured` &rarr; `star.bgBlue.bold`
- `failure` &rarr; `warning.bgRed.white`
- `success` &rarr; `line.green`
- `error` &rarr; `line.red`
- `tip` &rarr; `star.yellow`
- `link` &rarr; `line.cyan`
- `item` &rarr; `line.gray`
- `warn` &rarr; `warning.bold`
- `info` &rarr; `info.blue`
- `fail` &rarr; `cross.red`
- `wait` &rarr; `reload.gray`
- `end` &rarr; `tick.cyan`
- `log` &rarr; `pointer.gray`
- `ok` &rarr; `tick.green`

Using these you can short your code:

```js
log.info('{%ok Text with spaces and values: %s%}\n', 42);
```

> Color names are defined by [Chalk](https://github.com/chalk/chalk).

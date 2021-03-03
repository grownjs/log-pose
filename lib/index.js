'use strict';

const cliWidth = require('cli-width');

const _ = require('./constants');
const $ = require('./utils');


// disabled
let current = false;
let paused = false;
let latest;
let stdout;

/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

function log(allowed, format, depth, out, p, s) {
  return function _log(...args) {
    /* istanbul ignore else */
    if (out && current !== false && allowed <= current) {
      if (format !== null) {
        out.write(format !== false
          ? $.style($.puts(...args), depth, cliWidth({ stdout: out }))
          : `${$.puts(...args)}${s || ''}`);
      } else {
        out.write(`${p ? `${p}: ` : ''}${
          $.style($.puts(...args), depth, cliWidth({ stdout: out }))
        }${s || ''}`);
      }
    }

    return this;
  };
}

function status(type, ctx, cb) {
  /* istanbul ignore else */
  if (typeof ctx === 'string') {
    const source = ctx;

    ctx = { type, source };
    type = undefined;
  }

  /* istanbul ignore else */
  if (typeof type === 'string') {
    ctx = ctx || {};
    ctx.source = type;
  }

  /* istanbul ignore else */
  if (typeof type === 'object') {
    cb = ctx;
    ctx = type;
  }

  /* istanbul ignore else */
  if (typeof cb === 'object') {
    ctx = cb;
    cb = arguments[3] || arguments[2];
  }

  // fix
  ctx = ctx || {};

  /* istanbul ignore else */
  if (ctx.type && ctx.type.indexOf(':') > -1) {
    ctx.prefix = ctx.type.split(':')[0];
    ctx.type = ctx.type.split(':')[1];
  }

  ctx.cb = ctx.cb || cb;
  ctx.type = ctx.type || false;
  ctx.source = ctx.source || ctx.src || '?';
  ctx.target = ctx.target || ctx.dest || ctx.source;

  /* istanbul ignore else */
  if (ctx.source) {
    /* istanbul ignore else */
    if (Array.isArray(ctx.source) && ctx.source.length > 1) {
      ctx.source = `[${ctx.source.length} files]`;
    }
  }

  const ok = this.isEnabled();

  let interval;

  function begin() {
    /* istanbul ignore else */
    if (ok) {
      if (ctx.type === false) {
        this.printf('\r{% wait %s %}', ctx.source);
      } else {
        this.printf('\r  {% pad.gray %s %} {% wait %s %}', ctx.prefix || ctx.type, ctx.source);
      }

      const c = _.CHARS.length;

      let i = 0;

      interval = setInterval(() => {
        if (ctx.type === false) {
          this.printf('\r{% gray %s %s %}', _.CHARS[i], ctx.source);
        } else {
          this.printf('\r  {% pad.gray %s %} {% gray %s %s %}', ctx.prefix || ctx.type, _.CHARS[i], ctx.source);
        }

        i += 1;

        /* istanbul ignore else */
        if (i === c) {
          i = 0;
        }
      }, 100);
    }
  }

  function end(_error) {
    /* istanbul ignore else */
    if (ok) {
      clearInterval(interval);
      this.write('\r');

      const diff = ctx.start
        ? $.timeDiff(ctx.start)
        : false;

      let base = 'gray';

      // Ns (seconds)
      /* istanbul ignore else */
      if (diff !== false && diff.indexOf('ms') === -1) {
        /* istanbul ignore else */
        if (parseFloat(diff) > 0.1) {
          base = 'white';
        }

        /* istanbul ignore else */
        if (parseFloat(diff) > 0.4) {
          base = 'cyan';
        }

        /* istanbul ignore else */
        if (parseFloat(diff) > 1.0) {
          base = 'yellow';
        }

        /* istanbul ignore else */
        if (parseFloat(diff) > 2.0) {
          base = 'red';
        }
      }

      const ms = diff !== false ? `{% ${base} +${diff} %}` : '';

      if (_error) {
        if (ctx.type === false) {
          this.printf('\r{% fail %s %} %s\n', ctx.source || ctx.target, ms);
        } else {
          this.printf('\r  {% pad.gray %s %} {% fail %s %} %s\n', ctx.prefix || ctx.type,
            ctx.source || ctx.target,
            ms);
        }

        this.printf('{% error %s %}\n', _error);
      } else if (ctx.type === false) {
        this.printf('\r{% %s %s %} %s\n', _.TYPES[ctx.type] || 'ok', ctx.target, ms);
      } else {
        this.printf('\r  {% pad.gray %s %} {% %s %s %} %s\n',
          ctx.prefix || ctx.type,
          (ctx.type && ctx.prefix ? ctx.type : _.TYPES[ctx.type]) || 'ok',
          ctx.target,
          ms);
      }
    }
  }

  /* istanbul ignore else */
  if (ctx.cb && typeof ctx.cb !== 'function') {
    throw new Error(`Expected callback, given '${ctx.cb}'`);
  }

  return new Promise((resolve, reject) => {
    ctx.start = new Date();

    // commit changes
    if (ctx.cb) {
      begin.call(this);

      const retval = ctx.cb((target, _prefix, _type) => {
        if (target && typeof target.then === 'function') {
          target.then(resolve).catch(reject);
        } else {
          /* istanbul ignore else */
          if (typeof target === 'function') {
            process.nextTick(() => {
              try {
                resolve(target());
              } catch (e) {
                reject(e);
              }
            });
            return;
          }

          /* istanbul ignore else */
          if (_prefix && _prefix.indexOf(':') > -1) {
            ctx.prefix = _prefix.split(':')[0];
            ctx.type = _prefix.split(':')[1];
          }

          ctx.type = _type || ctx.type;
          ctx.target = target || ctx.target;
          ctx.prefix = _prefix || ctx.prefix;

          resolve();
        }
      });

      /* istanbul ignore else */
      if (!ctx.cb.length || (retval && typeof retval.then === 'function')) {
        Promise.resolve(retval).then(resolve).catch(reject);
      }
    } else {
      resolve();
    }
  })
    .then(() => end.call(this))
    .catch(error => {
    // stop everything before rethrow
      clearInterval(interval);
      this.write('\r');
      throw error;
    });
}

function makeLogger(depth, _stdout) {
  /* istanbul ignore else */
  if (_stdout && _stdout._handle && _stdout.isTTY
    && typeof _stdout._handle.setBlocking === 'function') {
    _stdout._handle.setBlocking(true);
  }

  const ctx = {
    printf: log(0, true, depth, _stdout || stdout),
    write: log(0, false, depth, _stdout || stdout),
    info: log(1, null, depth, _stdout || stdout),
    debug: log(2, null, depth, _stdout || stdout),
    verbose: log(3, null, depth, _stdout || stdout),
    isInfo: () => current > 0,
    isDebug: () => current > 1,
    isVerbose: () => current > 2,
    isEnabled: () => current >= 0,
  };

  const $logger = status.bind(ctx);

  Object.keys(ctx).forEach(key => {
    $logger[key] = ctx[key].bind(ctx);
  });

  return $logger;
}

module.exports = {
  pause() {
    /* istanbul ignore else */
    if (!paused && typeof latest === 'undefined') {
      latest = current;
      current = false;
      paused = true;
    }
  },
  resume() {
    /* istanbul ignore else */
    if (paused) {
      current = latest;
      paused = false;
    }
  },
  setLevel(type) {
    if (type === false) {
      current = -1;
    } else {
      current = typeof type === 'string'
        ? _.LOG_LEVELS.indexOf(type)
        : type || 0;
    }
    return this;
  },
  setLogger(out) {
    if (typeof out === 'boolean' || out === 0) {
      stdout = out || out === 0 ? 0 : false;
    } else {
      stdout = out || process.stdout;
    }
    return this;
  },
  getLogger(depth, _stdout) {
    return makeLogger(depth,
      _stdout || stdout || process.stdout);
  },
  newLogger(prefix, level, depth, _stdout) {
    level = typeof level === 'string'
      ? _.LOG_LEVELS.indexOf(level)
      : level;

    return log(level || current,
      null,
      depth,
      _stdout || stdout || process.stdout,
      prefix,
      '\n');
  },
};

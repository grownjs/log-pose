'use strict';

const cliWidth = require('cli-width');

const _ = require('./constants');
const $ = require('./utils');

let stdout;
let stderr;

// disabled
let current = false;

/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

function log(allowed, format, depth, out) {
  return function _log() {
    /* istanbul ignore else */
    if (out && current !== false && allowed <= current) {
      if (format !== null) {
        out.write(format !== false
          ? $.style(`\r\r${$.puts.apply(null, arguments)}`, depth, cliWidth({ stdout: out }))
          : $.puts.apply(null, arguments));
      } else {
        out.write($.style($.puts.apply(null, arguments), depth, cliWidth({ stdout: out })));
      }
    }

    return this;
  };
}

function status(ctx, cb) {
  if (ctx instanceof Date) {
    ctx = { start: ctx };
  }

  if (typeof cb === 'string') {
    const type = ctx;
    const source = cb;

    cb = arguments[2];
    ctx = { type, source };
  }

  if (typeof cb === 'object') {
    ctx = cb;
    cb = arguments[2];
  }

  if (typeof ctx === 'string') {
    const source = ctx;

    ctx = { source };
  }

  /* istanbul ignore else */
  if (ctx.type && ctx.type.indexOf(':') > -1) {
    ctx.prefix = ctx.type.split(':')[0];
    ctx.type = ctx.type.split(':')[1];
  }

  ctx.source = ctx.source || ctx.src || '?';
  ctx.target = ctx.target || ctx.dest || ctx.source;

  /* istanbul ignore else */
  if (ctx.source) {
    if (Array.isArray(ctx.source) && ctx.source.length > 1) {
      ctx.source = `[${ctx.source.length} file${ctx.source.length !== 1 ? 's' : ''}]`;
    } else {
      ctx.source = (ctx.source || '').toString();
    }
  }

  const ok = this.isEnabled();

  let err;
  let retval;
  let interval;

  function begin() {
    /* istanbul ignore else */
    if (ok) {
      if (ctx.type === false) {
        this.printf('\b{%wait|%s%:}\r\r', ctx.source);
      } else {
        this.printf('\b  {%pad.gray|%s%} {%wait|%s%}\r\r', ctx.prefix || ctx.type, ctx.source);
      }

      const c = _.CHARS.length;

      let i = 0;

      interval = setInterval(() => {
        if (ctx.type === false) {
          this.printf('\b{%gray|%s %s%}', _.CHARS[i], ctx.source);
        } else {
          this.printf('\b  {%pad.gray|%s%} {%gray|%s %s%}', ctx.prefix || ctx.type, _.CHARS[i], ctx.source);
        }

        i += 1;

        /* istanbul ignore else */
        if (i === c) {
          i = 0;
        }
      }, 100);
    }
  }

  function end(res, _error) {
    /* istanbul ignore else */
    if (ok) {
      clearInterval(interval);
      this.write('\b');

      const diff = ctx.start
        ? $.timeDiff(ctx.start)
        : '';

      let base = 'gray';

      // Ns (seconds)
      /* istanbul ignore else */
      if (diff.indexOf('ms') === -1) {
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

      const ms = ctx.start ? `{%${base}|+${diff}%}` : '';

      if (err || _error) {
        if (ctx.type === false) {
          this.printf('\r\r{%err|%s%} %s\n', ctx.source || ctx.target, ms);
        } else {
          this.printf('\r\r  {%pad.gray|%s%} {%err|%s%} %s\n', ctx.prefix || ctx.type,
            ctx.source || ctx.target,
            ms);
        }

        this.printf('{%red|%s%}\n', (err || _error));
      } else {
        /* istanbul ignore else */
        if (res && Array.isArray(res)) {
          console.log('GOT', res);
          // ctx.prefix = (res.length === 3 ? res[0] : null) || ctx.prefix;
          // ctx.type = (res.length === 3 ? res[1] : res[0]) || ctx.type;
          // ctx.target = (res.length === 3 ? res[2] : res[1]) || ctx.target;
        }

        if (ctx.type === false) {
          this.printf('\r\r{%%s|%s%} %s\n', _.TYPES[ctx.type] || ctx.type || 'ok', ctx.target, ms);
        } else {
          this.printf('\r\r  {%pad.gray|%s%} {%%s|%s%} %s\n',
            ctx.prefix || ctx.type,
            (ctx.type && ctx.prefix ? ctx.type : _.TYPES[ctx.type]) || 'ok',
            ctx.target,
            ms);
        }
      }
    }

    return retval;
  }

  /* istanbul ignore else */
  if (cb && typeof cb !== 'function') {
    throw new Error(`Expected callback, given '${cb}'`);
  }

  return new Promise((resolve, reject) => {
    if (cb) {
      begin.call(this);
      retval = cb((prefix, label) => {
        if (prefix && typeof prefix.then === 'function') {
          prefix.then(resolve).catch(reject);
        } else {
          if (!label && prefix) {
            label = prefix;
            prefix = ctx.type || 'end';
          }

          resolve();
        }
      });

      /* istanbul ignore else */
      if (!cb.length) {
        resolve(retval);
      }
    }
  })
  .then(() => {
    /* istanbul ignore else */
    if (!retval || typeof retval.then !== 'function') {
      return end.call(this, retval);
    }

    return retval
      .then(result => end.call(this, result || ctx.target))
      .catch(error => end.call(this, ctx.target, error));
  });
}

function makeLogger(depth, _stdout, _stderr) {
  [_stdout || stdout, _stderr || stderr].forEach(stream => {
    /* istanbul ignore else */
    if (stream._handle && stream.isTTY
      && typeof stream._handle.setBlocking === 'function') {
      stream._handle.setBlocking(true);
    }
  });

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
  setLogger(cb, e) {
    if (typeof cb === 'boolean' || cb === 0) {
      stdout = cb || cb === 0 ? 0 : false;
    } else {
      stdout = cb || process.stdout;
    }
    stderr = e || process.stderr;
    return this;
  },
  getLogger(depth, _stdout, _stderr) {
    return makeLogger(depth,
      _stdout || process.stdout,
      _stderr || process.stderr);
  },
};

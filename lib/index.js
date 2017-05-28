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

function status(start, type, out, cb) {
  /* istanbul ignore else */
  if (typeof type === 'function') {
    cb = type;
    out = start;
    type = false;
    start = start !== false ? new Date() : false;
  }

  /* istanbul ignore else */
  if (start !== false && !(start instanceof Date)) {
    cb = out;
    out = type || {};
    type = start || 'log';
    start = new Date();
  }

  /* istanbul ignore else */
  if (typeof type === 'object') {
    cb = out;
    out = type || {};
    type = out.type || 'unknown';
  }

  let prefix = '';

  /* istanbul ignore else */
  if (type && type.indexOf(':') > -1) {
    prefix = type.split(':')[0];
    type = type.split(':')[1];
  }

  let target = (out && typeof out === 'object') ? (out.target || out.dest) : out;
  let source = (out && typeof out === 'object') ? (out.source || out.src) : out;

  source = source || '?';
  target = target || source;

  /* istanbul ignore else */
  if (source) {
    if (Array.isArray(source) && source.length > 1) {
      source = `[${source.length} file${source.length !== 1 ? 's' : ''}]`;
    } else {
      source = (source || '').toString();
    }
  }

  const ok = this.isEnabled();

  let err;
  let retval;
  let finisher;
  let interval;

  function begin() {
    if (type === false) {
      this.printf('\b{wait|%s}\r\r', source);
    } else {
      this.printf('\b  {pad.gray|%s} {wait|%s}\r\r', prefix || type, source);
    }

    const c = _.CHARS.length;

    let i = 0;

    interval = setInterval(() => {
      if (type === false) {
        this.printf('\b{gray|%s %s}', _.CHARS[i], source);
      } else {
        this.printf('\b  {pad.gray|%s} {gray|%s %s}', prefix || type, _.CHARS[i], source);
      }

      i += 1;

      /* istanbul ignore else */
      if (i === c) {
        i = 0;
      }
    }, 100);
  }

  function end(res, _error) {
    /* istanbul ignore else */
    if (ok) {
      clearInterval(interval);
      this.write('\b');

      const diff = start !== false
        ? $.timeDiff(start)
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

      const ms = start !== false ? `{${base}|+${diff}}` : '';

      if (err || _error) {
        if (type === false) {
          this.printf('\r\r{err|%s} %s\n', source || target, ms);
        } else {
          this.printf('\r\r  {pad.gray|%s} {err|%s} %s\n', prefix || type,
            source || target,
            ms);
        }

        this.printf('{red|%s}\n', (err || _error));
      } else {
        /* istanbul ignore else */
        if (res && Array.isArray(res)) {
          prefix = (res.length === 3 ? res[0] : null) || prefix;
          type = (res.length === 3 ? res[1] : res[0]) || type;
          target = (res.length === 3 ? res[2] : res[1]) || target;
        }

        if (type === false) {
          this.printf('\r\r{%s|%s} %s\n', _.TYPES[type] || 'ok', target, ms);
        } else {
          this.printf('\r\r  {pad.gray|%s} {%s|%s} %s\n',
            prefix || type,
            _.TYPES[type] || 'ok',
            target,
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
    try {
      /* istanbul ignore else */
      if (cb) {
        begin.call(this);
        retval = cb((_err, result) => {
          if (_err) {
            reject(_err);
          } else {
            if (typeof result === 'function') {
              finisher = result;
            } else {
              retval = result;
            }
            resolve();
          }
        });
      }
    } catch (e) {
      err = e;
    }

    /* istanbul ignore else */
    if (cb && cb.length === 1) {
      return;
    }

    resolve();
  })
  .then(() => {
    /* istanbul ignore else */
    if (!retval || typeof retval.then !== 'function') {
      return end.call(this, retval);
    }

    return retval
      .then(result => end.call(this, result || target))
      .catch(error => end.call(this, target, error));
  })
  // execute last callback
  .then(() => finisher && finisher());
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
    return makeLogger(depth, _stdout, _stderr);
  },
};

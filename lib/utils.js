'use strict';

/* eslint-disable prefer-rest-params */

const ms = require('pretty-ms');
const clc = require('chalk');

const _ = require('./constants');

const die = process.exit.bind(process);

const reStyles = /\{([.\w]+?)\|([^{}]*?)\}(?=\s*|\b|$)/g;

function puts(message) {
  const args = Array.prototype.slice.call(arguments, 1);

  return String(message)
    .replace(/%s/g, () => args.shift());
}

function style(message, depth, max) {
  // normalize maximum
  max = message.indexOf('\b') > -1
    ? Math.max(10, (max + 3) - ((depth || 11) * 2))
    : false;

  return message
  .replace(_.CR, `${_.CLR}\r`)
  .replace(_.LF, `${_.CLR}\n`)
  .replace(reStyles, ($0, fmt, text) => {
    const segments = (_.TYPES[fmt] || fmt).split('.');

    let colorized = clc;

    /* eslint-disable no-continue */
    while (segments.length) {
      const key = segments.shift();

      /* istanbul ignore else */
      if (key === 'pad') {
        text = (new Array((depth || 11) - (text.length + 1))).join(' ') + text;
        continue;
      }

      /* istanbul ignore else */
      if (_.SYMBOLS[key]) {
        text = `${_.SYMBOLS[key]} ${text}`;
        continue;
      }

      /* istanbul ignore else */
      if (!colorized[key]) {
        text = `${key}. ${clc.cyan(text)}`;
        break;
      }

      colorized = colorized[key];
    }

    /* istanbul ignore else */
    if (max !== false && text.length > max) {
      text = `${text.substr(0, Math.ceil(max / 2))}...${text.substr(-Math.floor(max / 2))}`;
    }

    /* istanbul ignore else */
    if (typeof colorized === 'function') {
      return colorized(text);
    }

    return text;
  });
}

function timeDiff(start) {
  return ms((new Date()) - start);
}

module.exports = {
  die,
  puts,
  style,
  timeDiff,
};

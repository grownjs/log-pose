'use strict';

/* eslint-disable prefer-rest-params */

const ms = require('pretty-ms');
const clc = require('chalk');

const _ = require('./constants');

const die = process.exit.bind(process);

const reNum = /^[0-9]{1,2}$/;
const reStyles = /\{%\s*([.\w]+?)\s+([\s\S]*?)\s*%\}/g;
const reSprintf = /%s/g;

function puts(message) {
  const args = Array.prototype.slice.call(arguments, 1);

  return String(message)
    .replace(reSprintf, () => {
      const value = args.shift();

      if (value && typeof value === 'object') {
        try {
          return JSON.stringify(value);
        } catch (e) {
          return value.toString();
        }
      }

      return value;
    });
}

function style(message, depth, max) {
  // normalize constraints
  depth = depth || 11;
  max = message.indexOf('\b') > -1
    ? Math.max(10, (max + 3) - (depth * 2))
    : false;

  return message
    .replace(_.CR, `${_.CLR}\r`)
    .replace(_.LF, `${_.CLR}\n`)
    .replace(reStyles, ($0, fmt, text) => {
      const segments = (_.TYPES[fmt] || fmt).split('.');

      let colorized = clc;
      let _depth = depth;

      /* eslint-disable no-continue */
      while (segments.length) {
        const key = segments.shift();

        /* istanbul ignore else */
        if (reNum.test(key)) {
          _depth = parseInt(key, 10);
          continue;
        }

        /* istanbul ignore else */
        if (key === 'pad' && text.length < _depth) {
          text = (new Array(_depth - (text.length + 1))).join(' ') + text;
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

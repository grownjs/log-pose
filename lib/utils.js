'use strict';

/* eslint-disable prefer-rest-params */

const ms = require('pretty-ms');
const clc = require('chalk');
const util = require('util');

const _ = require('./constants');

const puts = util.format;
const die = process.exit.bind(process);

const reNum = /^[0-9]{1,2}$/;
const reStyles = /\{%\s*([.\w]+?)\s+([\s\S]*?)\s*%\}/g;

function style(message, depth, max) {
  // normalize constraints
  depth = depth || 11;
  max = message.charAt() === '\r'
    ? Math.max(10, (max + 3) - (depth * 2))
    : false;

  if (max && !message.includes('\n')) {
    message += _.CLR;
  }

  return message
    .replace(/\\b/g, _.BACK)
    .replace(/\n/g, `${_.CLR}\n`)
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

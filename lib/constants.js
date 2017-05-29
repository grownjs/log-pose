'use strict';

const LOG_LEVELS = [0, 'info', 'debug', 'verbose'];

const SYMBOLS = {
  tick: '✔',
  cross: '✖',
  star: '★',
  line: '─',
  info: 'ℹ',
  reload: '↺',
  pointer: '›',
  warning: '⚠',
};

const TYPES = {
  exception: 'line.bgRed.bold',
  featured: 'star.bgBlue.bold',
  failure: 'warning.bgRed.white',
  success: 'line.green',
  error: 'line.red',
  tip: 'star.yellow',
  link: 'line.cyan',
  item: 'line.gray',
  warn: 'warning.bold',
  info: 'info.blue',
  fail: 'cross.red',
  wait: 'reload.gray',
  end: 'tick.cyan',
  log: 'pointer.gray',
  ok: 'tick.green',
};

const CHARS = ['|', '\\', '-', '/', '|', '\\', '-', '/'];

const CLR = '\x1b[K';

const CR = /\r\r/g;
const LF = /\r\n/g;

module.exports = {
  LOG_LEVELS,
  SYMBOLS,
  TYPES,
  CHARS,
  CLR,
  CR,
  LF,
};

'use strict';

const LOG_LEVELS = [0, 'info', 'debug', 'verbose'];

const SYMBOLS = {
  tick: '✔',
  cross: '✖',
  star: '★',
  line: '─',
  info: '➲',
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

const BACK = '\x1b[1A';
const CLR = '\x1b[K';

module.exports = {
  LOG_LEVELS,
  SYMBOLS,
  TYPES,
  CHARS,
  BACK,
  CLR,
};

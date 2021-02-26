'use strict';

const LOG_LEVELS = [0, 'info', 'debug', 'verbose'];

const SYMBOLS = {
  fav: '★',
  tick: '✔',
  cross: '✖',
  line: '─',
  info: 'ℹ',
  edit: '✎',
  flag: '⚑',
  cube: '❒',
  tube: '❍',
  angle: '❯',
  arrow: '➩',
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
  link: 'line.blueBright',
  item: 'line.gray',
  warn: 'warning.bold',
  info: 'info.cyan',
  fail: 'cross.red',
  wait: 'reload.gray',
  end: 'tick.cyanBright',
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

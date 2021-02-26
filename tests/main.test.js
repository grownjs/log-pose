const { expect } = require('chai');

const logger = require('../lib');
const util = require('../lib/utils');

function stdout() {
  stdout.buffer = [];

  return {
    write(...args) {
      stdout.buffer.push(args.join(''));
    },
  };
}

/* global beforeEach, describe, it */

describe('utils', () => {
  describe('style()', () => {
    it('should use a backspace char to backline', () => {
      expect(util.style('\b')).to.eql('\u001b[1A');
    });

    it('should clear before the first newline', () => {
      expect(util.style('x')).to.eql('x');
      expect(util.style('\n')).to.eql('\n');
      expect(util.style('x\ny\nz')).to.eql('x\ny\nz');
      expect(util.style('\rx\ny\nz')).to.eql('\rx\x1b[K\ny\nz');
      expect(util.style('\rm\nosoms\n!!')).to.eql('\rm\x1b[K\nosoms\n!!');
    });

    it('should shorten the styled text on line-clear', () => {
      expect(util.style('\r{% red this is a large text %}')).to.contain('this is...e text');
    });

    it('should keep styled text without shortening using .', () => {
      expect(util.style('\r{% red. this is a large text %}')).to.contain('this is a large text');
      expect(util.style('\r{% error. this is a large text %}')).to.contain('this is a large text');
    });
  });
});

describe('logger', () => {
  let log;
  beforeEach(() => {
    log = logger.getLogger(10, stdout());
    logger.setLevel(1);
  });

  it('can print some logs', async () => {
    await log();
    await log('ok');
    await log('foo');
    await log('bar', 'buzz');
    await log('fail', 'message');
    await log('write', 'message', () => 42);

    expect(stdout.buffer.length).to.eql(13);
  });

  it('can print and await...', async () => {
    await log('async', { src: 'input', dest: 'output' }, () =>
      new Promise(resolve => {
        setTimeout(() => resolve(null), 1000);
      }));

    expect(stdout.buffer.length).to.eql(12);
  });

  it('can handle levels', async () => {
    logger.setLevel(false);
    log.write(1);

    expect(stdout.buffer).to.eql([]);

    // enable
    logger.setLevel(0);
    log.write(1);
    log.printf(2);
    log.verbose(-1);

    expect(stdout.buffer).to.eql([
      '1',
      '2',
    ]);

    // info-level
    logger.setLevel(1);
    log.info(3);
    log.verbose(-1);

    expect(stdout.buffer).to.eql([
      '1',
      '2',
      '3',
    ]);

    // debug-level
    logger.setLevel(2);
    log.debug(4);
    log.verbose(-1);

    expect(stdout.buffer).to.eql([
      '1',
      '2',
      '3',
      '4',
    ]);

    // verbose-level
    logger.setLevel(3);
    log.verbose(5);

    expect(stdout.buffer).to.eql([
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
  });
});

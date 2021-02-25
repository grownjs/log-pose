const { expect } = require('chai');

const logger = require('..');

function stdout() {
  stdout.buffer = [];

  return {
    write(...args) {
      stdout.buffer.push(args.join(''));
    },
  };
}

let log;

/* global beforeEach, describe, it */

describe('logger', () => {
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
      '\r\u001b[1A2\u001b[1A\u001b[\u001b[1AK\u001b[1A',
    ]);

    // info-level
    logger.setLevel(1);
    log.info(3);
    log.verbose(-1);

    expect(stdout.buffer).to.eql([
      '1',
      '\r\u001b[1A2\u001b[1A\u001b[\u001b[1AK\u001b[1A',
      '\u001b[1A3\u001b[1A',
    ]);

    // debug-level
    logger.setLevel(2);
    log.debug(4);
    log.verbose(-1);

    expect(stdout.buffer).to.eql([
      '1',
      '\r\u001b[1A2\u001b[1A\u001b[\u001b[1AK\u001b[1A',
      '\u001b[1A3\u001b[1A',
      '\u001b[1A4\u001b[1A',
    ]);

    // verbose-level
    logger.setLevel(3);
    log.verbose(5);

    expect(stdout.buffer).to.eql([
      '1',
      '\r\u001b[1A2\u001b[1A\u001b[\u001b[1AK\u001b[1A',
      '\u001b[1A3\u001b[1A',
      '\u001b[1A4\u001b[1A',
      '\u001b[1A5\u001b[1A',
    ]);
  });
});

logger = require('..')

strip = (str) ->
  str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g, '')

stdout = ->
  stdout.buffer = []

  write: (msg...) ->
    stdout.buffer.push strip(msg.join(''))

stderr = -> {}

describe 'logger', ->
  beforeEach ->
    @log = logger.getLogger(10, stdout(), stderr())
    logger.setLevel(1)

  it 'can print some logs', (done) ->
    @log()
    @log('ok')
    @log('foo')
    @log('bar', 'buzz')
    @log('fail', 'message')
    @log('write', 'message', -> 42).then ->
      expect(stdout.buffer.length).toEqual 13
      done()

  it 'can print and await...', (done) ->
    @log 'async', { src: 'input', dest: 'output' }, ->
      new Promise (resolve) ->
        setTimeout ->
          resolve(null)
        , 1100

    .then ->
      expect(stdout.buffer.length).toEqual 13
      done()

  it 'can handle levels', ->
    logger.setLevel(false)
    @log.write(1)

    expect(stdout.buffer).toEqual []

    # enable
    logger.setLevel(0)
    @log.write(1)
    @log.printf(2)
    @log.verbose(-1)

    expect(stdout.buffer).toEqual ['1', '\r2']

    # info-level
    logger.setLevel(1)
    @log.info(3)
    @log.verbose(-1)

    expect(stdout.buffer).toEqual ['1', '\r2', '3']

    # debug-level
    logger.setLevel(2)
    @log.debug(4)
    @log.verbose(-1)

    expect(stdout.buffer).toEqual ['1', '\r2', '3', '4']

    # verbose-level
    logger.setLevel(3)
    @log.verbose(5)

    expect(stdout.buffer).toEqual ['1', '\r2', '3', '4', '5']

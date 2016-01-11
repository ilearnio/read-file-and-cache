var fs = require('fs')
var expect = require('chai').expect
var readFileAndCache = require('..')
var readFileAndCacheSync = require('..').readFileAndCacheSync

var test_file = __dirname + '/test.txt'

// Just to be sure the test file always contains correct initial value
before(function() {
  fs.writeFileSync(test_file, 'ok')
})
after(function() {
  fs.writeFileSync(test_file, 'ok')
})

describe('Reading from a file', function() {

  describe('using callback', function() {
    it('can use callback', function(done) {
      readFileAndCache(test_file, function(err, result) {
        expect(err).to.equal(null)
        expect(result.trim()).to.equal('ok')
        done()
      })
    })

    it('should update cache if file was changed', function(done) {
      readFileAndCache(test_file, function(err, result) {
        expect(err).to.equal(null)
        expect(result.trim()).to.equal('ok')

        fs.writeFileSync(test_file, 'foo')

        readFileAndCache(test_file, function(err, result) {
          fs.writeFileSync(test_file, 'ok')

          expect(err).to.equal(null)
          expect(result.trim()).to.equal('foo')
          done()
        })
      })
    })

    it('should NOT return updated file if it was modified (never_update: true)', function(done) {
      readFileAndCache(test_file, function(err, result) {
        expect(err).to.equal(null)
        expect(result.trim()).to.equal('ok')

        fs.writeFileSync(test_file, 'foo')

        readFileAndCache(test_file, function(err, result) {
          fs.writeFileSync(test_file, 'ok')

          expect(err).to.equal(null)
          expect(result.trim()).to.equal('ok')
          done()
        }, { never_update: true })
      })
    })
  })


  describe('using Promise', function() {
    it('can use Promise', function(done) {
      readFileAndCache(test_file).then(function(result) {
        expect(result.trim()).to.equal('ok')
        done()
      })
    })

    it('should update cache if file was changed', function(done) {
      readFileAndCache(test_file).then(function(result) {
        expect(result.trim()).to.equal('ok')

        fs.writeFileSync(test_file, 'foo')

        readFileAndCache(test_file).then(function(result) {
          fs.writeFileSync(test_file, 'ok')

          expect(result.trim()).to.equal('foo')
          done()
        })
      })
    })

    it('should NOT return updated file if it was modified (never_update: true)', function(done) {
      readFileAndCache(test_file).then(function(result) {
        expect(result.trim()).to.equal('ok')

        fs.writeFileSync(test_file, 'foo')

        readFileAndCache(test_file, { never_update: true }).then(function(result) {
          fs.writeFileSync(test_file, 'ok')

          expect(result.trim()).to.equal('ok')
          done()
        })
      })
    })
  })


  describe('using synchronous readFileAndCacheSync', function() {
    it('can use readFileAndCacheSync', function(done) {
      var result = readFileAndCacheSync(test_file)

      expect(result.trim()).to.equal('ok')
      done()
    })

    it('should update cache if file was changed', function(done) {
      var result = readFileAndCacheSync(test_file)
      expect(result.trim()).to.equal('ok')

      fs.writeFileSync(test_file, 'foo')

      result = readFileAndCacheSync(test_file)

      fs.writeFileSync(test_file, 'ok')

      expect(result.trim()).to.equal('foo')
      done()
    })

    it('should NOT return updated file if it was modified (never_update: true)', function(done) {
      var result = readFileAndCacheSync(test_file)
      expect(result.trim()).to.equal('ok')

      fs.writeFileSync(test_file, 'foo')

      result = readFileAndCacheSync(test_file, { never_update: true })

      fs.writeFileSync(test_file, 'ok')

      expect(result.trim()).to.equal('ok')
      done()
    })

    it('should return updated file if it was modified only after some delay (check_delay: 0.1)', function(done) {
      var result = readFileAndCacheSync(test_file)
      expect(result.trim()).to.equal('ok')

      fs.writeFileSync(test_file, 'foo')

      result = readFileAndCacheSync(test_file, { check_delay: 0.1 })

      expect(result.trim()).to.equal('ok')

      setTimeout(function() {
        result = readFileAndCacheSync(test_file, { check_delay: 0.1 })

        fs.writeFileSync(test_file, 'ok')

        expect(result.trim()).to.equal('foo')
        done()
      }, 100)
    })
  })

})

'use strict'

//copied from https://github.com/yibn2008/progress-extract/blob/master/lib/index.js, without the tar.gz dependency

const path = require('path')
const Bar = require('./bar')

module.exports = function (source, destination) {
  destination = destination || process.cwd()

  let bar = new Bar()

  if (source.endsWith('.zip')) {
    const zip = require('./zip')
    return zip(source, destination, bar)
  } else {
    throw new Error('currently does NOT support extract for file type', path.extname(source))
  }
}

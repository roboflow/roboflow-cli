'use strict'

const fs = require('fs')
const extract = require('extract-zip')

module.exports = function (source, destination, bar) {
  return new Promise((resolve, reject) => {
    let stat = fs.statSync(source)

    bar.start(stat.size)

    extract(source, {
      dir: destination,
      onEntry (entry) {
        bar.tick(entry.compressedSize)
      }
    }, err => {
      bar.done(err)

      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
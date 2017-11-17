'use strict'

const Heap = require('heap')
const P = require('bluebird')
const Events = require('events')
const event = new Events.EventEmitter()

module.exports = (logSources, printer) => {
  // init heap with comparator for log entry dates
  const heap = new Heap((a, b) => {
    if (a.date < b.date) {
      return -1
    } else if (a.date > b.date) {
      return 1
    }
  })

  function fetch(fromSource) {
    let newEntries = []
    if (fromSource) {
      newEntries.push(logSources[fromSource].popAsync())
    } else {
      newEntries = logSources.map((source) => {
        return source.popAsync()
      })
    }

    P.all(newEntries).then(() => {
      P.each(newEntries, (entry, index) => {
        if (entry) {
          entry.sourceIndex = index
          heap.push(entry)
        }
      })
      .then(() => event.emit('fetched'))
    })
  }

  event.on('fetched', () => {
    if (!heap.empty()) {
      let entry = heap.pop()
      printer.print(entry)
      let fromSource = entry.sourceIndex
      event.emit('printed', fromSource)
    } else {
      printer.done()
    }
  })

  event.on('printed', fetch)

  fetch()
}

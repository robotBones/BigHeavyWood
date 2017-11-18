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
          // associate entry with source so only one entry
          // from each source is in the heap and we constrain space.
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
      fetch(entry.sourceIndex)
    } else {
      printer.done()
    }
  })

  fetch()
}

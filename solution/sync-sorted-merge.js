'use strict'

const Heap = require('heap')

module.exports = (logSources, printer) => {
  const heap = new Heap((a, b) => {
    if (a.date < b.date) {
      return -1
    } else if (a.date > b.date) {
      return 1
    }
  })

  logSources.forEach((source, index) => {
    let entry = source.pop()
    if (entry) {
      // associate entry with source so only one entry
      // from each source is in the heap and we constrain space.
      entry.sourceIndex = index
      heap.push(entry)
    }
  })

  while (!heap.empty()) {
    let entry = heap.pop()
    printer.print(entry)

    if (!logSources[entry.sourceIndex].drained) {
      let newEntry = logSources[entry.sourceIndex].pop()
      if (newEntry) {
        newEntry.sourceIndex = entry.sourceIndex
        heap.push(newEntry)
      }
    }
  }
  printer.done()
}

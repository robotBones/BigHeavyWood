'use strict'

const Heap = require('heap')

function getFirstEntries(logSources) {
  let entries = []
  for (var i = 0; i < logSources.length; i++) {
    let entry = logSources[i].pop()
    if (entry) {
      entries.push(entry)
    }
  }
  return entries
}

module.exports = (logSources, printer) => {
  const heap = new Heap((a, b) => {
    if (a.date < b.date) {
      return -1
    } else if (a.date > b.date) {
      return 1
    }
  })

  for (let i = 0; i < logSources.length; i++) {
    let entry = logSources[i].pop()
    if (entry) {
      entry.sourceIndex = i
      heap.push(entry)
    }
  }

  while (heap.size()) {
    let entry = heap.pop()
    if (!logSources[entry.sourceIndex].drained) {
      let newEntry = logSources[entry.sourceIndex].pop()
      if (newEntry) {
        newEntry.sourceIndex = entry.sourceIndex
        heap.push(newEntry)
      }
    }
    printer.print(entry)
  }
  printer.done()
}

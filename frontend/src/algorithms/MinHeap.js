/**
 * Binary min-heap used as the priority queue for Dijkstra, A* and Greedy
 * Best-First Search.
 *
 * Implemented from scratch (no external dependency) with parallel arrays for
 * keys and priorities so that no wrapper object is allocated per push — that
 * matters because a 40x80 board can push tens of thousands of entries.
 *
 * There is no decrease-key operation: relaxing an edge simply pushes a second
 * entry with the better priority ("lazy deletion"). Stale entries are cheap to
 * detect on pop because the node is already finalised. This keeps the heap
 * O(log V) per operation while avoiding an index-tracking table.
 */
export class MinHeap {
  constructor(capacityHint = 64) {
    this.keys = new Int32Array(capacityHint)
    this.priorities = new Float64Array(capacityHint)
    this.size = 0
  }

  get isEmpty() {
    return this.size === 0
  }

  #grow() {
    const nextKeys = new Int32Array(this.keys.length * 2)
    const nextPriorities = new Float64Array(this.priorities.length * 2)
    nextKeys.set(this.keys)
    nextPriorities.set(this.priorities)
    this.keys = nextKeys
    this.priorities = nextPriorities
  }

  #swap(a, b) {
    const key = this.keys[a]
    const priority = this.priorities[a]
    this.keys[a] = this.keys[b]
    this.priorities[a] = this.priorities[b]
    this.keys[b] = key
    this.priorities[b] = priority
  }

  /** O(log n) insertion. */
  push(key, priority) {
    if (this.size === this.keys.length) this.#grow()
    let i = this.size
    this.keys[i] = key
    this.priorities[i] = priority
    this.size += 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.priorities[parent] <= this.priorities[i]) break
      this.#swap(parent, i)
      i = parent
    }
  }

  /** O(log n) extract-min. Returns -1 when the heap is empty. */
  pop() {
    if (this.size === 0) return -1
    const top = this.keys[0]
    this.size -= 1
    if (this.size > 0) {
      this.keys[0] = this.keys[this.size]
      this.priorities[0] = this.priorities[this.size]
      let i = 0
      for (;;) {
        const left = 2 * i + 1
        const right = left + 1
        let smallest = i
        if (left < this.size && this.priorities[left] < this.priorities[smallest]) smallest = left
        if (right < this.size && this.priorities[right] < this.priorities[smallest]) smallest = right
        if (smallest === i) break
        this.#swap(i, smallest)
        i = smallest
      }
    }
    return top
  }

  peekPriority() {
    return this.size === 0 ? Infinity : this.priorities[0]
  }
}

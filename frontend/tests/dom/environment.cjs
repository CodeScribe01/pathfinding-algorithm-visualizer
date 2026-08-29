const fs = require('fs')
const { JSDOM } = require('jsdom')

/**
 * jsdom window preconfigured with the browser APIs the app relies on but jsdom
 * does not implement: matchMedia, ResizeObserver (Recharts), IntersectionObserver
 * (Framer Motion's whileInView) and a canvas 2D context stub (board previews).
 *
 * Note there is no `Worker` in jsdom — which exercises the synchronous fallback
 * path in usePathfinder, so both execution paths get covered by the suite.
 */
function createEnvironment(bundlePath, route = '/') {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: `http://localhost:5173${route}`,
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  })

  const { window } = dom
  const errors = []

  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })

  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback
    }
    observe(element) {
      this.callback([{ target: element, isIntersecting: true, intersectionRatio: 1 }], this)
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }

  window.scrollTo = () => {}
  window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform() {},
    fillRect() {},
    clearRect() {},
  })

  const originalError = window.console.error
  window.console.error = (...args) => {
    errors.push(args.map(String).join(' '))
    originalError(...args)
  }

  window.eval(fs.readFileSync(bundlePath, 'utf8'))

  return {
    window,
    document: window.document,
    // React act() warnings and Recharts' zero-size warning are jsdom artefacts.
    realErrors: () =>
      errors.filter(
        (message) =>
          !message.includes('not wrapped in act') &&
          !message.includes('width(0) and height(0)'),
      ),
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Poll until `predicate` is true or the timeout elapses. */
async function waitFor(predicate, timeout = 20000, interval = 120) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (predicate()) return true
    await wait(interval)
  }
  return false
}

module.exports = { createEnvironment, wait, waitFor }

/**
 * Integration tests: the real application, rendered in jsdom.
 *
 * These cover the wiring the unit tests cannot reach — routing, the protected
 * route guard, board editing, the animation engine painting the DOM, and the
 * comparison workspace producing distinct per-algorithm results.
 *
 *   npm run test:ui
 */
const { bundle } = require('./bundle.cjs')
const { createEnvironment, wait, waitFor } = require('./environment.cjs')

let failures = 0
const check = (name, condition, detail = '') => {
  console.log(`  ${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`)
  if (!condition) failures += 1
}

const click = (window, element) =>
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))

const findByText = (document, selector, text) =>
  [...document.querySelectorAll(selector)].find((element) =>
    element.textContent.trim().toLowerCase().includes(text),
  )

const boardStates = (document) => {
  const grid = document.querySelector('[role="grid"]')
  const counts = {}
  for (const cell of grid.querySelectorAll('.node')) {
    const state = cell.getAttribute('data-state')
    counts[state] = (counts[state] || 0) + 1
  }
  return counts
}

async function testRoutes(bundlePath) {
  console.log('\n== routes render ==')
  const routes = [
    { path: '/', expect: 'Understand Algorithms' },
    { path: '/visualizer', expect: 'Execution state' },
    { path: '/algorithms', expect: 'Breadth-First Search' },
    { path: '/compare', expect: 'Compare algorithms' },
    { path: '/technical', expect: 'Graph representation' },
    { path: '/login', expect: 'Sign in' },
    { path: '/register', expect: 'Create your account' },
    // Protected: an anonymous visitor is redirected to the sign-in screen.
    { path: '/history', expect: 'Sign in' },
    { path: '/analytics', expect: 'Sign in' },
    { path: '/does-not-exist', expect: 'No path to this route' },
  ]

  for (const route of routes) {
    const env = createEnvironment(bundlePath, route.path)
    await wait(1500)
    const text = env.document.getElementById('root').textContent
    check(`${route.path} renders`, text.includes(route.expect))
    check(`${route.path} is error free`, env.realErrors().length === 0, env.realErrors()[0] ?? '')
    env.window.close()
  }
}

async function testVisualizer(bundlePath) {
  console.log('\n== visualizer ==')
  const env = createEnvironment(bundlePath, '/visualizer')
  const { window, document } = env
  await wait(800)

  const initial = boardStates(document)
  check('board renders 27x59 cells', document.querySelectorAll('[role="grid"] .node').length === 1593)
  check('one start and one target', initial.start === 1 && initial.target === 1)

  click(window, findByText(document, 'button', 'generate maze'))
  await wait(300)
  const mazed = boardStates(document)
  check('maze generator paints walls', (mazed.wall || 0) > 200, `walls=${mazed.wall}`)
  check('markers survive generation', mazed.start === 1 && mazed.target === 1)

  click(window, findByText(document, 'button', 'visualize'))

  // Playback is time based, so poll for completion rather than guessing a delay.
  const completed = await waitFor(() =>
    /Complete/.test(document.getElementById('main').textContent),
  )
  check('status reaches Complete', completed)

  const painted = boardStates(document)
  check('search paints visited nodes', (painted.visited || 0) > 50, `visited=${painted.visited}`)
  check('final path is drawn', (painted.path || 0) > 5, `path=${painted.path}`)
  check('walls untouched by playback', (painted.wall || 0) === (mazed.wall || 0))
  check('markers never overwritten', painted.start === 1 && painted.target === 1)

  const text = document.getElementById('main').textContent
  check('stats report an execution time', /[0-9.]+\s?ms/.test(text))

  click(window, document.querySelector('button[aria-label="Reset board"]'))
  await wait(400)
  const reset = boardStates(document)
  check('reset clears the overlay', !reset.visited && !reset.path)
  check('reset clears the walls', !reset.wall)
  check('no console errors', env.realErrors().length === 0, env.realErrors()[0] ?? '')
  window.close()
}

async function testCompare(bundlePath) {
  console.log('\n== compare ==')
  const env = createEnvironment(bundlePath, '/compare')
  const { window, document } = env
  await wait(1500)

  check('empty state before the first run', /No comparison yet/.test(document.body.textContent))
  check(
    'four algorithms preselected',
    document.querySelectorAll('input[type=checkbox]:checked').length === 4,
  )

  click(window, findByText(document, 'button', 'generate'))
  await wait(300)
  click(window, findByText(document, 'button', 'run comparison'))
  await wait(2500)

  const rows = [...document.querySelectorAll('table tbody tr')]
  check('one result row per algorithm', rows.length === 4)

  const values = rows.map((row) => [...row.querySelectorAll('th,td')].map((c) => c.textContent.trim()))
  values.forEach((row) => console.log('        ', row.slice(0, 6).join(' | ')))

  check('metrics are populated', values.every((row) => /\d/.test(row[1]) && /\d/.test(row[2])))
  check(
    'algorithms produce different expansion counts',
    new Set(values.map((row) => row[1])).size > 1,
  )
  check('verdict summary rendered', /Fewest expansions/.test(document.body.textContent))
  check('explored-area previews rendered', document.querySelectorAll('canvas').length === 4)
  check('no console errors', env.realErrors().length === 0, env.realErrors()[0] ?? '')
  window.close()
}

;(async () => {
  const bundlePath = await bundle()
  await testRoutes(bundlePath)
  await testVisualizer(bundlePath)
  await testCompare(bundlePath)

  console.log(`\n${failures === 0 ? 'ALL UI TESTS PASSED' : `${failures} FAILURE(S)`}\n`)
  process.exit(failures === 0 ? 0 : 1)
})()

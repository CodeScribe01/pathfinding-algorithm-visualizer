import { useCallback, useEffect, useRef, useState } from 'react'
import { VISUALIZER_STATUS } from '@/lib/constants'

const EMPTY_STATS = { visited: 0, frontier: 0, pathPainted: 0, progress: 0 }

/**
 * Animation engine for the board.
 *
 * Performance note: painting 2 000+ cells through React state would re-render
 * the whole grid on every frame. Instead the engine writes `data-state`
 * directly on the cell DOM nodes (registered in `cellsRef`) and CSS owns the
 * transition. React state is only touched for the throttled stats readout, so
 * the component tree stays completely still while the search animates.
 *
 * Playback is time-based rather than frame-based: each frame consumes
 * `dt * stepsPerSecond` steps from a budget, so the animation runs at the same
 * speed on a 60 Hz and a 144 Hz display, and speed changes apply mid-run.
 */
export function useVisualizerEngine({ cellsRef, cols, getBaseState, onComplete }) {
  const [status, setStatus] = useState(VISUALIZER_STATUS.IDLE)
  const [liveStats, setLiveStats] = useState(EMPTY_STATS)

  const engineRef = useRef({
    visitedOrder: [],
    path: [],
    cursor: 0,
    pathCursor: 0,
    phase: 'visited',
    stepsPerSecond: 120,
    budget: 0,
    lastTime: 0,
    lastPublish: 0,
    frontier: 0,
    rafId: 0,
    result: null,
  })

  const configRef = useRef({ cols, getBaseState, onComplete })
  useEffect(() => {
    configRef.current = { cols, getBaseState, onComplete }
  }, [cols, getBaseState, onComplete])

  const paint = useCallback(
    (row, col, state) => {
      const element = cellsRef.current.get(row * configRef.current.cols + col)
      // Markers keep their identity for the whole run.
      if (!element || element.dataset.fixed === '1') return
      element.dataset.state = state
    },
    [cellsRef],
  )

  /** Repaint every cell from the board model, wiping any search overlay. */
  const clearOverlay = useCallback(() => {
    const { cols: width, getBaseState: baseState } = configRef.current
    cellsRef.current.forEach((element, index) => {
      if (!element) return
      element.dataset.state = baseState(Math.trunc(index / width), index % width)
    })
  }, [cellsRef])

  const stopLoop = useCallback(() => {
    if (engineRef.current.rafId) cancelAnimationFrame(engineRef.current.rafId)
    engineRef.current.rafId = 0
  }, [])

  const publish = useCallback((force = false, timestamp = 0) => {
    const engine = engineRef.current
    if (!force && timestamp - engine.lastPublish < 80) return
    engine.lastPublish = timestamp
    const total = engine.visitedOrder.length + engine.path.length || 1
    setLiveStats({
      visited: engine.cursor,
      frontier: engine.frontier,
      pathPainted: engine.pathCursor,
      progress: Math.min(1, (engine.cursor + engine.pathCursor) / total),
    })
  }, [])

  const tick = useCallback(
    (timestamp) => {
      const engine = engineRef.current
      if (engine.lastTime === 0) engine.lastTime = timestamp

      // Clamp dt so returning to a backgrounded tab does not fast-forward.
      const delta = Math.min(0.1, (timestamp - engine.lastTime) / 1000)
      engine.lastTime = timestamp
      engine.budget += delta * engine.stepsPerSecond

      // The final path is drawn deliberately slower than the search sweep,
      // unless the user asked for instant playback.
      const instant = engine.stepsPerSecond >= 5000
      const pathStepCost = instant ? 1 : Math.max(1, engine.stepsPerSecond / 55)

      let budget = Math.floor(engine.budget)
      engine.budget -= budget

      while (budget > 0) {
        if (engine.phase === 'visited') {
          if (engine.cursor >= engine.visitedOrder.length) {
            engine.phase = 'path'
            continue
          }
          const step = engine.visitedOrder[engine.cursor]
          engine.cursor += 1
          engine.frontier = step.frontierSize ?? 0
          paint(step.row, step.col, step.side === 1 ? 'visited-alt' : 'visited')
          budget -= 1
        } else {
          if (engine.pathCursor >= engine.path.length) {
            stopLoop()
            publish(true, timestamp)
            setStatus(VISUALIZER_STATUS.DONE)
            configRef.current.onComplete?.(engine.result)
            return
          }
          const node = engine.path[engine.pathCursor]
          engine.pathCursor += 1
          paint(node.row, node.col, 'path')
          budget -= pathStepCost
        }
      }

      publish(false, timestamp)
      engine.rafId = requestAnimationFrame(tick)
    },
    [paint, publish, stopLoop],
  )

  /** Begin animating a completed search result. */
  const play = useCallback(
    (result, stepsPerSecond) => {
      stopLoop()
      clearOverlay()

      const engine = engineRef.current
      engine.visitedOrder = result.visitedOrder
      engine.path = result.path
      engine.result = result
      engine.cursor = 0
      engine.pathCursor = 0
      engine.phase = 'visited'
      engine.budget = 0
      engine.lastTime = 0
      engine.lastPublish = 0
      engine.frontier = 0
      engine.stepsPerSecond = stepsPerSecond

      setLiveStats(EMPTY_STATS)
      setStatus(VISUALIZER_STATUS.RUNNING)
      engine.rafId = requestAnimationFrame(tick)
    },
    [clearOverlay, stopLoop, tick],
  )

  const pause = useCallback(() => {
    if (engineRef.current.rafId === 0) return
    stopLoop()
    setStatus(VISUALIZER_STATUS.PAUSED)
  }, [stopLoop])

  const resume = useCallback(() => {
    const engine = engineRef.current
    if (engine.rafId !== 0) return
    engine.lastTime = 0
    setStatus(VISUALIZER_STATUS.RUNNING)
    engine.rafId = requestAnimationFrame(tick)
  }, [tick])

  /** Abort playback and wipe the overlay back to the plain board. */
  const stop = useCallback(() => {
    stopLoop()
    const engine = engineRef.current
    engine.visitedOrder = []
    engine.path = []
    engine.cursor = 0
    engine.pathCursor = 0
    engine.result = null
    clearOverlay()
    setLiveStats(EMPTY_STATS)
    setStatus(VISUALIZER_STATUS.IDLE)
  }, [clearOverlay, stopLoop])

  const setSpeed = useCallback((stepsPerSecond) => {
    engineRef.current.stepsPerSecond = stepsPerSecond
  }, [])

  const setComputing = useCallback(() => setStatus(VISUALIZER_STATUS.COMPUTING), [])

  useEffect(() => stopLoop, [stopLoop])

  return {
    status,
    liveStats,
    play,
    pause,
    resume,
    stop,
    setSpeed,
    setComputing,
    clearOverlay,
    isAnimating:
      status === VISUALIZER_STATUS.RUNNING ||
      status === VISUALIZER_STATUS.PAUSED ||
      status === VISUALIZER_STATUS.COMPUTING,
  }
}

import { useMemo, useState } from 'react'
import { useAnimator, type Status } from './animation'
import { Button, ControlGroup, Legend, OutputRow, Select, VisualizerLayout } from './controls'

const LABELS = 'ABCDEFGHIJKL'.split('')
const SIZE = 360
const RADIUS = 20

type Edge = [string, string]
type Algorithm = 'bfs' | 'dfs'

interface Frame {
  current: string | null
  visited: string[]
  frontier: string[]
  treeEdges: string[]
  output: string[]
  aux: string[]
  note: string
}

const SAMPLE_NODES = LABELS.slice(0, 8)
const SAMPLE_EDGES: Edge[] = [
  ['A', 'B'], ['A', 'C'], ['A', 'E'], ['B', 'D'], ['C', 'F'], ['D', 'G'], ['E', 'F'], ['F', 'H'], ['G', 'H'],
]

const edgeKey = (a: string, b: string) => [a, b].sort().join('-')

function adjacency(nodes: string[], edges: Edge[]) {
  const map = new Map<string, string[]>(nodes.map((node) => [node, []]))
  for (const [a, b] of edges) {
    map.get(a)?.push(b)
    map.get(b)?.push(a)
  }
  for (const neighbors of map.values()) neighbors.sort()
  return map
}

/** Nodes sit evenly on a circle so any graph the user builds stays readable. */
function circleLayout(nodes: string[]) {
  const positions = new Map<string, { x: number; y: number }>()
  const radius = SIZE / 2 - RADIUS - 14
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2
    positions.set(node, { x: SIZE / 2 + radius * Math.cos(angle), y: SIZE / 2 + radius * Math.sin(angle) })
  })
  return positions
}

function bfsFrames(start: string, adj: Map<string, string[]>): Frame[] {
  const frames: Frame[] = []
  const discovered = new Set([start])
  const visited: string[] = []
  const treeEdges: string[] = []
  const queue = [start]
  const snapshot = (current: string | null, note: string) =>
    frames.push({ current, visited: [...visited], frontier: [...queue], treeEdges: [...treeEdges], output: [...visited], aux: [...queue], note })

  snapshot(null, `Mark ${start} as discovered and enqueue it.`)
  while (queue.length > 0) {
    const node = queue.shift() as string
    visited.push(node)
    snapshot(node, `Dequeue ${node} and visit it.`)
    for (const neighbor of adj.get(node) ?? []) {
      if (discovered.has(neighbor)) continue
      discovered.add(neighbor)
      queue.push(neighbor)
      treeEdges.push(edgeKey(node, neighbor))
      snapshot(node, `${neighbor} is new: mark it discovered and enqueue it.`)
    }
  }
  return frames
}

function dfsFrames(start: string, adj: Map<string, string[]>): Frame[] {
  const frames: Frame[] = []
  const visited: string[] = []
  const treeEdges: string[] = []
  const stack: string[] = []
  const snapshot = (current: string, note: string) =>
    frames.push({ current, visited: [...visited], frontier: [...stack], treeEdges: [...treeEdges], output: [...visited], aux: [...stack], note })

  const explore = (node: string) => {
    stack.push(node)
    visited.push(node)
    snapshot(node, `Visit ${node} and push it on the call stack.`)
    for (const neighbor of adj.get(node) ?? []) {
      if (visited.includes(neighbor)) continue
      treeEdges.push(edgeKey(node, neighbor))
      snapshot(node, `${neighbor} is unvisited: go deeper ${node} → ${neighbor}.`)
      explore(neighbor)
      snapshot(node, `Back at ${node}: check its remaining neighbors.`)
    }
    stack.pop()
    const parent = stack[stack.length - 1]
    if (parent) snapshot(parent, `${node} has no unvisited neighbors left: backtrack to ${parent}.`)
  }
  explore(start)
  return frames
}

export function GraphVisualizer() {
  const [nodes, setNodes] = useState<string[]>(SAMPLE_NODES)
  const [edges, setEdges] = useState<Edge[]>(SAMPLE_EDGES)
  const [start, setStart] = useState('A')
  const [from, setFrom] = useState('A')
  const [to, setTo] = useState('B')
  const [frame, setFrame] = useState<(Frame & { algorithm: Algorithm }) | null>(null)
  const [status, setStatus] = useState<Status>({
    text: 'Click a node to choose where the traversal starts, then run BFS or DFS.',
    tone: 'info',
  })
  const { busy, run } = useAnimator()

  const adj = useMemo(() => adjacency(nodes, edges), [nodes, edges])
  const positions = useMemo(() => circleLayout(nodes), [nodes])
  const fail = (text: string) => setStatus({ text, tone: 'error' })

  function traverse(algorithm: Algorithm) {
    if (!nodes.includes(start)) return fail('Choose a start node first.')
    const frames = algorithm === 'bfs' ? bfsFrames(start, adj) : dfsFrames(start, adj)
    run(async (step) => {
      for (const next of frames) {
        setFrame({ ...next, algorithm })
        setStatus({ text: next.note, tone: 'info', complexity: 'O(V + E)' })
        await step()
      }
      const last = frames[frames.length - 1]
      setFrame({ ...last, current: null, frontier: [], aux: [], algorithm })
      const unreached = nodes.length - last.visited.length
      setStatus({
        text: `${algorithm.toUpperCase()} from ${start} visited ${last.visited.join(' → ')}.${unreached ? ` ${unreached} node${unreached === 1 ? ' is' : 's are'} unreachable from ${start}.` : ''}`,
        tone: 'success',
        complexity: 'O(V + E)',
      })
    })
  }

  function changeGraph(nextNodes: string[], nextEdges: Edge[], text: string) {
    setNodes(nextNodes)
    setEdges(nextEdges)
    setFrame(null)
    setStatus({ text, tone: 'success' })
    if (!nextNodes.includes(start)) setStart(nextNodes[0] ?? '')
    if (!nextNodes.includes(from)) setFrom(nextNodes[0] ?? '')
    if (!nextNodes.includes(to)) setTo(nextNodes[1] ?? nextNodes[0] ?? '')
  }

  function addNode() {
    const label = LABELS.find((candidate) => !nodes.includes(candidate))
    if (!label) return fail(`This playground holds up to ${LABELS.length} nodes.`)
    changeGraph([...nodes, label].sort(), edges, `Added node ${label}. Connect it with an edge so traversals can reach it.`)
  }

  function removeNode() {
    if (!nodes.includes(from)) return fail('Pick the node to remove in the "From" box.')
    changeGraph(
      nodes.filter((node) => node !== from),
      edges.filter(([a, b]) => a !== from && b !== from),
      `Removed node ${from} and every edge touching it.`,
    )
  }

  function addEdge() {
    if (!from || !to || from === to) return fail('Pick two different nodes to connect.')
    if (edges.some(([a, b]) => edgeKey(a, b) === edgeKey(from, to))) return fail(`${from} and ${to} are already connected.`)
    changeGraph(nodes, [...edges, [from, to]], `Added edge ${from} — ${to}.`)
  }

  function removeEdge() {
    const remaining = edges.filter(([a, b]) => edgeKey(a, b) !== edgeKey(from, to))
    if (remaining.length === edges.length) return fail(`There is no edge between ${from} and ${to}.`)
    changeGraph(nodes, remaining, `Removed edge ${from} — ${to}.`)
  }

  function nodeTone(node: string) {
    if (!frame) return node === start ? 'start' : ''
    if (frame.current === node) return 'active'
    if (frame.frontier.includes(node)) return 'new'
    if (frame.visited.includes(node)) return 'visited'
    return ''
  }

  const auxLabel = frame?.algorithm === 'dfs' ? 'Call stack' : 'Queue'

  return (
    <VisualizerLayout
      title="Graph Traversal"
      summary="Breadth-first search explores in rings using a queue; depth-first search dives down one path using a stack (here, recursion) before backtracking."
      status={status}
      controls={
        <>
          <ControlGroup label="Traverse">
            <Select label="Start" value={start} options={nodes} onChange={setStart} />
            <Button variant="primary" disabled={busy || nodes.length === 0} onClick={() => traverse('bfs')}>BFS</Button>
            <Button variant="primary" disabled={busy || nodes.length === 0} onClick={() => traverse('dfs')}>DFS</Button>
          </ControlGroup>
          <ControlGroup label="Edit graph">
            <Select label="From" value={from} options={nodes} onChange={setFrom} />
            <Select label="To" value={to} options={nodes} onChange={setTo} />
            <Button disabled={busy} onClick={addEdge}>Add edge</Button>
            <Button variant="danger" disabled={busy} onClick={removeEdge}>Remove edge</Button>
            <Button disabled={busy} onClick={addNode}>Add node</Button>
            <Button variant="danger" disabled={busy} onClick={removeNode}>Remove “From” node</Button>
          </ControlGroup>
          <ControlGroup label="Create">
            <Button disabled={busy} onClick={() => changeGraph(SAMPLE_NODES, SAMPLE_EDGES, 'Loaded the sample graph.')}>Sample graph</Button>
            <Button disabled={busy} onClick={() => changeGraph(nodes, [], 'Removed all edges. Add your own connections.')}>Clear edges</Button>
          </ControlGroup>
        </>
      }
      footer={
        <>
          {frame && (
            <>
              <OutputRow label="Visit order" items={frame.output} />
              <OutputRow label={auxLabel} items={frame.aux} />
            </>
          )}
          <div className="viz__adjacency">
            <span className="viz__output-label">Adjacency list</span>
            <ul>
              {nodes.map((node) => (
                <li key={node}>
                  <strong>{node}</strong>: {(adj.get(node) ?? []).join(', ') || '—'}
                </li>
              ))}
            </ul>
          </div>
          <Legend
            items={[
              { tone: 'start', label: 'start' },
              { tone: 'active', label: 'current' },
              { tone: 'new', label: frame?.algorithm === 'dfs' ? 'on stack' : 'in queue' },
              { tone: 'visited', label: 'visited' },
            ]}
          />
        </>
      }
    >
      {nodes.length === 0 ? (
        <p className="viz__empty">No nodes yet. Use “Add node” or load the sample graph.</p>
      ) : (
        <svg className="graph-svg graph-svg--square" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Undirected graph with ${nodes.length} nodes and ${edges.length} edges`}>
          {edges.map(([a, b]) => {
            const p = positions.get(a)!
            const q = positions.get(b)!
            const isTree = frame?.treeEdges.includes(edgeKey(a, b))
            return <line key={edgeKey(a, b)} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={`graph-svg__edge${isTree ? ' graph-svg__edge--active' : ''}`} />
          })}
          {nodes.map((node) => {
            const { x, y } = positions.get(node)!
            const tone = nodeTone(node)
            return (
              <g
                key={node}
                className={`graph-svg__node graph-svg__node--clickable${tone ? ` graph-svg__node--${tone}` : ''}`}
                onClick={() => {
                  if (busy) return
                  setStart(node)
                  setFrame(null)
                  setStatus({ text: `Start node set to ${node}.`, tone: 'info' })
                }}
              >
                <circle cx={x} cy={y} r={RADIUS} />
                <text x={x} y={y} dy="0.35em">{node}</text>
              </g>
            )
          })}
        </svg>
      )}
      <p className="viz__caption">
        V = {nodes.length} · E = {edges.length} · undirected · neighbors are explored in alphabetical order
      </p>
    </VisualizerLayout>
  )
}

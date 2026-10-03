import { useMemo, useState } from 'react'
import { newId, parseNumberList, parseValue, randomValues, useAnimator, type Status, type Step } from './animation'
import { Button, ControlGroup, Field, Legend, OutputRow, VisualizerLayout } from './controls'

const MAX_NODES = 15
const SPACING_X = 52
const SPACING_Y = 68
const RADIUS = 19

type Tone = 'active' | 'found' | 'new' | 'removed' | 'moved' | 'visited'
type Traversal = 'inorder' | 'preorder' | 'postorder' | 'level'

interface TreeNode {
  id: number
  value: number
  left: TreeNode | null
  right: TreeNode | null
}

/** One frame of a traversal animation. */
interface Frame {
  current: number
  visited: number[]
  output: number[]
  aux: number[]
  note: string
}

const TRAVERSALS: Record<Traversal, { label: string; aux: string; rule: string }> = {
  inorder: { label: 'In-order', aux: 'Call stack', rule: 'left → node → right (gives sorted order in a BST)' },
  preorder: { label: 'Pre-order', aux: 'Call stack', rule: 'node → left → right (useful for copying a tree)' },
  postorder: { label: 'Post-order', aux: 'Call stack', rule: 'left → right → node (useful for deleting a tree)' },
  level: { label: 'Level-order (BFS)', aux: 'Queue', rule: 'level by level using a queue' },
}

function insertValue(node: TreeNode | null, value: number): TreeNode {
  if (!node) return { id: newId(), value, left: null, right: null }
  if (value < node.value) return { ...node, left: insertValue(node.left, value) }
  return { ...node, right: insertValue(node.right, value) }
}

function removeValue(node: TreeNode | null, value: number): TreeNode | null {
  if (!node) return null
  if (value < node.value) return { ...node, left: removeValue(node.left, value) }
  if (value > node.value) return { ...node, right: removeValue(node.right, value) }
  if (!node.left) return node.right
  if (!node.right) return node.left
  const successor = minNode(node.right)
  return { ...node, value: successor.value, right: removeValue(node.right, successor.value) }
}

function minNode(node: TreeNode): TreeNode {
  return node.left ? minNode(node.left) : node
}

function findNode(node: TreeNode | null, value: number): TreeNode | null {
  if (!node) return null
  if (value === node.value) return node
  return findNode(value < node.value ? node.left : node.right, value)
}

function buildTree(values: number[]) {
  let root: TreeNode | null = null
  for (const value of new Set(values)) root = insertValue(root, value)
  return root
}

function countNodes(node: TreeNode | null): number {
  return node ? 1 + countNodes(node.left) + countNodes(node.right) : 0
}

function height(node: TreeNode | null): number {
  return node ? 1 + Math.max(height(node.left), height(node.right)) : 0
}

/** Places nodes by in-order rank (x) and depth (y), which never overlaps for a binary tree. */
function layoutTree(root: TreeNode | null) {
  const placed: { node: TreeNode; x: number; y: number }[] = []
  const edges: { from: TreeNode; to: TreeNode }[] = []
  let rank = 0
  let maxDepth = 0
  const positions = new Map<number, { x: number; y: number }>()

  function visit(node: TreeNode | null, depth: number) {
    if (!node) return
    visit(node.left, depth + 1)
    const point = { x: (rank + 1) * SPACING_X, y: depth * SPACING_Y + 34 }
    rank++
    maxDepth = Math.max(maxDepth, depth)
    positions.set(node.id, point)
    placed.push({ node, ...point })
    if (node.left) edges.push({ from: node, to: node.left })
    if (node.right) edges.push({ from: node, to: node.right })
    visit(node.right, depth + 1)
  }
  visit(root, 0)

  return {
    placed,
    edges,
    positions,
    width: Math.max((rank + 1) * SPACING_X, 320),
    height: maxDepth * SPACING_Y + 68,
  }
}

function traversalFrames(root: TreeNode | null, order: Traversal): Frame[] {
  const frames: Frame[] = []
  const visited: number[] = []
  const output: number[] = []

  const visit = (node: TreeNode, aux: number[]) => {
    visited.push(node.id)
    output.push(node.value)
    frames.push({ current: node.id, visited: [...visited], output: [...output], aux, note: `Visit ${node.value} → output it.` })
  }

  if (order === 'level') {
    const queue: TreeNode[] = root ? [root] : []
    while (queue.length > 0) {
      const node = queue.shift() as TreeNode
      const children = [node.left, node.right].filter((child): child is TreeNode => child !== null)
      queue.push(...children)
      visit(node, queue.map((item) => item.value))
      if (children.length > 0) {
        frames[frames.length - 1].note += ` Enqueue its children ${children.map((child) => child.value).join(' and ')}.`
      }
    }
    return frames
  }

  const stack: number[] = []
  const walk = (node: TreeNode | null) => {
    if (!node) return
    stack.push(node.value)
    if (order === 'preorder') {
      visit(node, [...stack])
    } else {
      const next = order === 'inorder' ? 'left subtree first' : 'both subtrees first'
      frames.push({ current: node.id, visited: [...visited], output: [...output], aux: [...stack], note: `At ${node.value}: process the ${next}.` })
    }
    walk(node.left)
    if (order === 'inorder') visit(node, [...stack])
    walk(node.right)
    if (order === 'postorder') visit(node, [...stack])
    stack.pop()
  }
  walk(root)
  return frames
}

export function TreeVisualizer() {
  const [root, setRoot] = useState<TreeNode | null>(() => buildTree([50, 30, 70, 20, 40, 60, 80]))
  const [tones, setTones] = useState<Record<number, Tone>>({})
  const [status, setStatus] = useState<Status>({
    text: 'In a binary search tree every left descendant is smaller and every right descendant is larger than its parent.',
    tone: 'info',
  })
  const [traversal, setTraversal] = useState<{ order: Traversal; output: number[]; aux: number[] } | null>(null)
  const [valueText, setValueText] = useState('')
  const [listText, setListText] = useState('')
  const { busy, run } = useAnimator()

  const layout = useMemo(() => layoutTree(root), [root])
  const fail = (text: string) => setStatus({ text, tone: 'error' })

  function readValue() {
    const value = parseValue(valueText)
    if (value === null) fail('Enter a whole number between -999 and 999 in the Value box.')
    return value
  }

  /** Animates the comparison path from the root towards `value`; returns the matching node, if any. */
  async function descend(value: number, step: Step, path: Record<number, Tone>) {
    let node = root
    while (node) {
      path[node.id] = 'active'
      setTones({ ...path })
      if (value === node.value) return node
      const direction = value < node.value ? 'left' : 'right'
      setStatus({ text: `${value} ${value < node.value ? '<' : '>'} ${node.value}, so go ${direction}.`, tone: 'info', complexity: 'O(h)' })
      await step(0.9)
      node = value < node.value ? node.left : node.right
    }
    return null
  }

  function insert(value: number) {
    if (countNodes(root) >= MAX_NODES) return fail(`This playground holds up to ${MAX_NODES} nodes.`)
    setTraversal(null)
    run(async (step) => {
      const path: Record<number, Tone> = {}
      const existing = await descend(value, step, path)
      if (existing) {
        setTones({ ...path, [existing.id]: 'found' })
        setStatus({ text: `${value} is already in the tree. BSTs here keep values unique.`, tone: 'error' })
        return
      }
      const next = insertValue(root, value)
      const added = findNode(next, value) as TreeNode
      setRoot(next)
      setTones({ ...path, [added.id]: 'new' })
      setStatus({
        text: `Reached an empty spot, so ${value} becomes a new leaf. It took ${Object.keys(path).length} comparison${Object.keys(path).length === 1 ? '' : 's'}.`,
        tone: 'success',
        complexity: 'O(h), h = height',
      })
    })
  }

  function search(value: number) {
    setTraversal(null)
    run(async (step) => {
      const path: Record<number, Tone> = {}
      const found = await descend(value, step, path)
      if (found) {
        setTones({ ...path, [found.id]: 'found' })
        setStatus({ text: `Found ${value}! Each comparison discarded a whole subtree.`, tone: 'success', complexity: 'O(h)' })
      } else {
        setStatus({ text: `Hit an empty child: ${value} is not in the tree.`, tone: 'error', complexity: 'O(h)' })
      }
    })
  }

  function remove(value: number) {
    setTraversal(null)
    run(async (step) => {
      const path: Record<number, Tone> = {}
      const target = await descend(value, step, path)
      if (!target) {
        setStatus({ text: `Hit an empty child: ${value} is not in the tree, nothing to delete.`, tone: 'error', complexity: 'O(h)' })
        return
      }
      path[target.id] = 'removed'
      setTones({ ...path })

      if (target.left && target.right) {
        setStatus({ text: `${value} has two children. Find its in-order successor: go right once, then left as far as possible.`, tone: 'info', complexity: 'O(h)' })
        await step()
        let successor = target.right
        while (true) {
          setTones({ ...path, [successor.id]: 'moved' })
          if (!successor.left) break
          await step(0.8)
          successor = successor.left
        }
        setStatus({ text: `Successor is ${successor.value}. Copy it into ${value}'s node, then delete the old ${successor.value} (it has at most one child).`, tone: 'info', complexity: 'O(h)' })
        await step(1.4)
      } else {
        const child = target.left ?? target.right
        setStatus({
          text: child ? `${value} has one child: link its parent straight to ${child.value}.` : `${value} is a leaf: simply detach it.`,
          tone: 'info',
          complexity: 'O(h)',
        })
        await step(1.2)
      }
      setRoot(removeValue(root, value))
      setTones({})
      setStatus({ text: `Deleted ${value}. The BST ordering still holds.`, tone: 'success', complexity: 'O(h)' })
    })
  }

  function traverse(order: Traversal) {
    if (!root) return fail('The tree is empty. Insert some values first.')
    const frames = traversalFrames(root, order)
    run(async (step) => {
      for (const frame of frames) {
        const nextTones: Record<number, Tone> = {}
        for (const id of frame.visited) nextTones[id] = 'visited'
        nextTones[frame.current] = 'active'
        setTones(nextTones)
        setTraversal({ order, output: frame.output, aux: frame.aux })
        setStatus({ text: frame.note, tone: 'info', complexity: 'O(n)' })
        await step()
      }
      const visitedTones: Record<number, Tone> = {}
      for (const id of frames[frames.length - 1].visited) visitedTones[id] = 'visited'
      setTones(visitedTones)
      setTraversal({ order, output: frames[frames.length - 1].output, aux: [] })
      setStatus({ text: `${TRAVERSALS[order].label} done: ${TRAVERSALS[order].rule}.`, tone: 'success', complexity: 'O(n)' })
    })
  }

  function create(values: number[]) {
    const unique = [...new Set(values)]
    if (unique.length > MAX_NODES) return fail(`At most ${MAX_NODES} nodes fit in this playground.`)
    setRoot(buildTree(unique))
    setTones({})
    setTraversal(null)
    setStatus({ text: `Built a BST by inserting ${unique.join(', ') || 'nothing'} in order. Insertion order decides the shape.`, tone: 'success' })
  }

  function handleCreate() {
    const list = parseNumberList(listText)
    if (list) create(list)
    else fail('Enter numbers separated by commas, e.g. 50, 30, 70.')
  }

  const withValue = (action: (value: number) => void) => () => {
    const value = readValue()
    if (value !== null) action(value)
  }

  return (
    <VisualizerLayout
      title="Binary Search Tree"
      summary="Each comparison sends you left or right, so search, insert, and delete cost O(h): O(log n) when balanced, O(n) when the tree degenerates into a line."
      status={status}
      controls={
        <>
          <ControlGroup label="Operations">
            <Field label="Value" value={valueText} onChange={setValueText} placeholder="e.g. 45" />
            <Button variant="primary" disabled={busy} onClick={withValue(insert)}>Insert</Button>
            <Button variant="danger" disabled={busy} onClick={withValue(remove)}>Delete</Button>
            <Button disabled={busy} onClick={withValue(search)}>Search</Button>
          </ControlGroup>
          <ControlGroup label="Traverse">
            {(Object.keys(TRAVERSALS) as Traversal[]).map((order) => (
              <Button key={order} disabled={busy} onClick={() => traverse(order)}>
                {TRAVERSALS[order].label}
              </Button>
            ))}
          </ControlGroup>
          <ControlGroup label="Create">
            <Field label="Insert in order" value={listText} onChange={setListText} placeholder="50, 30, 70, 20" wide />
            <Button disabled={busy} onClick={handleCreate}>Create</Button>
            <Button disabled={busy} onClick={() => create(randomValues(7))}>Random</Button>
            <Button disabled={busy} onClick={() => create([])}>Clear</Button>
          </ControlGroup>
        </>
      }
      footer={
        <>
          {traversal && (
            <>
              <OutputRow label={`${TRAVERSALS[traversal.order].label} output`} items={traversal.output} />
              <OutputRow label={TRAVERSALS[traversal.order].aux} items={traversal.aux} />
            </>
          )}
          <Legend
            items={[
              { tone: 'active', label: 'current / path' },
              { tone: 'visited', label: 'visited' },
              { tone: 'new', label: 'inserted' },
              { tone: 'found', label: 'found' },
              { tone: 'moved', label: 'successor' },
              { tone: 'removed', label: 'deleting' },
            ]}
          />
        </>
      }
    >
      {root ? (
        <svg
          className="graph-svg"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          style={{ maxWidth: layout.width }}
          role="img"
          aria-label={`Binary search tree with ${layout.placed.length} nodes`}
        >
          {layout.edges.map(({ from, to }) => {
            const a = layout.positions.get(from.id)!
            const b = layout.positions.get(to.id)!
            const onPath = tones[from.id] && tones[to.id] && tones[to.id] !== 'visited'
            return <line key={to.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`graph-svg__edge${onPath ? ' graph-svg__edge--active' : ''}`} />
          })}
          {layout.placed.map(({ node, x, y }) => (
            <g key={node.id} className={`graph-svg__node${tones[node.id] ? ` graph-svg__node--${tones[node.id]}` : ''}`}>
              <circle cx={x} cy={y} r={RADIUS} />
              <text x={x} y={y} dy="0.35em">{node.value}</text>
            </g>
          ))}
        </svg>
      ) : (
        <p className="viz__empty">The tree is empty. Insert a value to plant the root.</p>
      )}
      <p className="viz__caption">
        nodes = {layout.placed.length} · height = {height(root)}
      </p>
    </VisualizerLayout>
  )
}

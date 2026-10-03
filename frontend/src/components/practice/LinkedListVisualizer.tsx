import { Fragment, useState } from 'react'
import { newId, parseIndex, parseNumberList, parseValue, randomValues, useAnimator, type Status, type Step } from './animation'
import { Button, ControlGroup, Field, Legend, VisualizerLayout } from './controls'

const MAX_NODES = 10

type Tone = 'active' | 'found' | 'new' | 'removed'

interface ListNode {
  id: number
  value: number
}

const toNodes = (values: number[]): ListNode[] => values.map((value) => ({ id: newId(), value }))

const INITIAL_STATUS: Status = {
  text: 'Each node stores a value and a pointer to the next node. To reach a node you must follow pointers from the head.',
  tone: 'info',
}

export function LinkedListVisualizer() {
  const [nodes, setNodes] = useState<ListNode[]>(() => toNodes([8, 15, 4, 42, 16]))
  const [tones, setTones] = useState<Record<number, Tone>>({})
  // Pointer labels drawn above nodes while an operation runs; null shows only `head`.
  const [pointers, setPointers] = useState<Record<number, string[]> | null>(null)
  // During reversal, how many nodes (from the front) already point backwards.
  const [flipped, setFlipped] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>(INITIAL_STATUS)
  const [valueText, setValueText] = useState('')
  const [indexText, setIndexText] = useState('')
  const [listText, setListText] = useState('')
  const { busy, run } = useAnimator()

  const fail = (text: string) => setStatus({ text, tone: 'error' })

  /** Builds pointer labels from [name, position] pairs; positions outside the list mean null. */
  function labelsAt(list: ListNode[], entries: [string, number][]) {
    const labels: Record<number, string[]> = {}
    for (const [name, position] of entries) {
      const node = list[position]
      if (node) (labels[node.id] ??= []).push(name)
    }
    return labels
  }

  function finish(list: ListNode[], nextTones: Record<number, Tone>, nextStatus: Status) {
    setNodes(list)
    setTones(nextTones)
    setPointers(null)
    setFlipped(null)
    setStatus(nextStatus)
  }

  function readValue() {
    const value = parseValue(valueText)
    if (value === null) fail('Enter a whole number between -999 and 999 in the Value box.')
    return value
  }

  function checkRoom() {
    if (nodes.length < MAX_NODES) return true
    fail(`This playground holds up to ${MAX_NODES} nodes. Delete one first.`)
    return false
  }

  function insertHead(value: number) {
    const node = { id: newId(), value }
    finish([node, ...nodes], { [node.id]: 'new' }, {
      text: `new.next = head; head = new. ${value} is the new head and nothing else moved.`,
      tone: 'success',
      complexity: 'O(1)',
    })
  }

  /** Walks `curr` from the head to `position` (inclusive), animating each hop. */
  async function walkTo(position: number, step: Step, reason: string) {
    for (let i = 0; i <= position; i++) {
      setTones({ [nodes[i].id]: 'active' })
      setPointers(labelsAt(nodes, [['head', 0], ['curr', i]]))
      setStatus({ text: i === 0 ? `curr = head (${reason})` : `curr = curr.next → ${nodes[i].value}`, tone: 'info', complexity: 'O(n)' })
      await step(0.8)
    }
  }

  function insertAt(position: number, value: number) {
    if (position === 0) return insertHead(value)
    run(async (step) => {
      await walkTo(position - 1, step, `stop at node ${position - 1}`)
      const node = { id: newId(), value }
      const list = [...nodes.slice(0, position), node, ...nodes.slice(position)]
      const isTail = position === nodes.length
      setNodes(list)
      setTones({ [nodes[position - 1].id]: 'active', [node.id]: 'new' })
      setPointers(labelsAt(list, [['head', 0], ['curr', position - 1], ['new', position]]))
      setStatus({
        text: isTail ? 'curr.next = new. Linked on at the tail.' : 'new.next = curr.next; curr.next = new. No other node moved.',
        tone: 'info',
        complexity: 'O(n)',
      })
      await step()
      finish(list, { [node.id]: 'new' }, {
        text: `Inserted ${value} at position ${position}. Walking there was O(n); relinking was O(1).`,
        tone: 'success',
        complexity: isTail ? 'O(n), or O(1) with a tail pointer' : 'O(n)',
      })
    })
  }

  function deleteValue(value: number) {
    run(async (step) => {
      for (let i = 0; i < nodes.length; i++) {
        setTones({ [nodes[i].id]: 'active' })
        setPointers(labelsAt(nodes, [['head', 0], ['prev', i - 1], ['curr', i]]))
        setStatus({ text: `Is curr.value (${nodes[i].value}) equal to ${value}?`, tone: 'info', complexity: 'O(n)' })
        await step(0.8)
        if (nodes[i].value !== value) continue

        setTones({ [nodes[i].id]: 'removed' })
        setStatus({
          text: i === 0 ? 'Found it at the head: head = head.next.' : 'Found it: prev.next = curr.next skips over curr.',
          tone: 'info',
          complexity: i === 0 ? 'O(1)' : 'O(n)',
        })
        await step()
        finish(nodes.filter((_, index) => index !== i), {}, {
          text: `Deleted ${value}. The node is unlinked; no other values were shifted.`,
          tone: 'success',
          complexity: i === 0 ? 'O(1)' : 'O(n)',
        })
        return
      }
      finish(nodes, {}, { text: `${value} is not in the list. Reached null.`, tone: 'error', complexity: 'O(n)' })
    })
  }

  function find(value: number) {
    run(async (step) => {
      for (let i = 0; i < nodes.length; i++) {
        setTones({ [nodes[i].id]: 'active' })
        setPointers(labelsAt(nodes, [['head', 0], ['curr', i]]))
        setStatus({ text: `Compare ${nodes[i].value} with ${value}…`, tone: 'info', complexity: 'O(n)' })
        await step(0.8)
        if (nodes[i].value === value) {
          finish(nodes, { [nodes[i].id]: 'found' }, {
            text: `Found ${value} at position ${i} after following ${i} pointer${i === 1 ? '' : 's'}.`,
            tone: 'success',
            complexity: 'O(n)',
          })
          return
        }
      }
      finish(nodes, {}, { text: `${value} is not in the list. Reached null.`, tone: 'error', complexity: 'O(n)' })
    })
  }

  function reverse() {
    if (nodes.length < 2) return fail('Add at least two nodes to see a reversal.')
    run(async (step) => {
      setFlipped(0)
      for (let i = 0; i < nodes.length; i++) {
        const prevText = i === 0 ? 'null' : String(nodes[i - 1].value)
        const nextText = i === nodes.length - 1 ? 'null' : String(nodes[i + 1].value)
        setTones({ [nodes[i].id]: 'active' })
        setPointers(labelsAt(nodes, [['prev', i - 1], ['curr', i], ['next', i + 1]]))
        setStatus({ text: `Save next = curr.next (${nextText}) so we don't lose the rest of the list.`, tone: 'info', complexity: 'O(n)' })
        await step()
        setFlipped(i + 1)
        setStatus({ text: `curr.next = prev: ${nodes[i].value} now points to ${prevText}.`, tone: 'info', complexity: 'O(n)' })
        await step()
        setStatus({ text: 'Advance: prev = curr, curr = next.', tone: 'info', complexity: 'O(n)' })
        setPointers(labelsAt(nodes, [['prev', i], ['curr', i + 1]]))
        await step(0.6)
      }
      const reversed = [...nodes].reverse()
      finish(reversed, { [reversed[0].id]: 'found' }, {
        text: `curr is null, so head = prev (${reversed[0].value}). Reversed in one pass using O(1) extra space.`,
        tone: 'success',
        complexity: 'O(n) time · O(1) space',
      })
    })
  }

  function create(values: number[]) {
    if (values.length > MAX_NODES) return fail(`At most ${MAX_NODES} nodes fit in this playground.`)
    finish(toNodes(values), {}, { text: `Created a list of ${values.length} nodes.`, tone: 'success' })
  }

  function handleInsertHead() {
    const value = readValue()
    if (value !== null && checkRoom()) insertHead(value)
  }

  function handleInsertTail() {
    const value = readValue()
    if (value !== null && checkRoom()) insertAt(nodes.length, value)
  }

  function handleInsertAt() {
    const value = readValue()
    if (value === null || !checkRoom()) return
    const position = parseIndex(indexText)
    if (position === null || position > nodes.length) return fail(`Enter a position between 0 and ${nodes.length}.`)
    insertAt(position, value)
  }

  function handleDelete() {
    const value = readValue()
    if (value !== null) deleteValue(value)
  }

  function handleFind() {
    const value = readValue()
    if (value !== null) find(value)
  }

  function handleCreate() {
    const list = parseNumberList(listText)
    if (list) create(list)
    else fail('Enter numbers separated by commas, e.g. 3, 8, 1.')
  }

  const labels = pointers ?? (nodes.length > 0 ? { [nodes[0].id]: ['head'] } : {})

  function connectorAfter(index: number) {
    const isLast = index === nodes.length - 1
    const pointsForward = flipped === null || index >= flipped
    const nextPointsBack = flipped !== null && index + 1 < flipped
    if (isLast) return pointsForward ? <span className="ll-viz__arrow">→ <em>null</em></span> : null
    if (nextPointsBack) return <span className="ll-viz__arrow ll-viz__arrow--back">←</span>
    if (pointsForward) return <span className="ll-viz__arrow">→</span>
    return <span className="ll-viz__arrow ll-viz__arrow--broken" aria-label="no link" />
  }

  return (
    <VisualizerLayout
      title="Singly Linked List"
      summary="Nodes scattered in memory, chained by next pointers. Insertions only relink pointers, but finding a position means walking from the head."
      status={status}
      controls={
        <>
          <ControlGroup label="Inputs">
            <Field label="Value" value={valueText} onChange={setValueText} placeholder="e.g. 42" />
            <Field label="Position" value={indexText} onChange={setIndexText} placeholder="e.g. 2" />
          </ControlGroup>
          <ControlGroup label="Insert">
            <Button variant="primary" disabled={busy} onClick={handleInsertHead}>At head</Button>
            <Button variant="primary" disabled={busy} onClick={handleInsertTail}>At tail</Button>
            <Button variant="primary" disabled={busy} onClick={handleInsertAt}>At position</Button>
          </ControlGroup>
          <ControlGroup label="Operations">
            <Button variant="danger" disabled={busy} onClick={handleDelete}>Delete value</Button>
            <Button disabled={busy} onClick={handleFind}>Find value</Button>
            <Button disabled={busy} onClick={reverse}>Reverse</Button>
          </ControlGroup>
          <ControlGroup label="Create">
            <Field label="Elements" value={listText} onChange={setListText} placeholder="3, 8, 1, 9" wide />
            <Button disabled={busy} onClick={handleCreate}>Create</Button>
            <Button disabled={busy} onClick={() => create(randomValues(5))}>Random</Button>
            <Button disabled={busy} onClick={() => create([])}>Clear</Button>
          </ControlGroup>
        </>
      }
      footer={
        <Legend
          items={[
            { tone: 'active', label: 'curr' },
            { tone: 'new', label: 'inserted' },
            { tone: 'found', label: 'found / new head' },
            { tone: 'removed', label: 'unlinking' },
          ]}
        />
      }
    >
      <div className="ll-viz">
        {nodes.length === 0 && <span className="ll-viz__empty">head → <em>null</em></span>}
        {flipped !== null && flipped > 0 && <span className="ll-viz__arrow"><em>null</em> ←</span>}
        {nodes.map((node, index) => (
          <Fragment key={node.id}>
            <div className="ll-viz__node">
              <div className="ll-viz__labels">
                {(labels[node.id] ?? []).map((label) => (
                  <span key={label} className={`ll-viz__label ll-viz__label--${label}`}>{label}</span>
                ))}
              </div>
              <div className={`ll-viz__box${tones[node.id] ? ` viz-cell--${tones[node.id]}` : ''}`}>
                <span className="ll-viz__value">{node.value}</span>
                <span className="ll-viz__next">next</span>
              </div>
            </div>
            {connectorAfter(index)}
          </Fragment>
        ))}
      </div>
    </VisualizerLayout>
  )
}

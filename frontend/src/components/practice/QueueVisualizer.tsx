import { useState } from 'react'
import { newId, parseIndex, parseNumberList, parseValue, randomValues, useAnimator, type Status } from './animation'
import { Button, ControlGroup, Field, Legend, OutputRow, VisualizerLayout } from './controls'

const MAX_CAPACITY = 10

type Tone = 'found' | 'new' | 'removed'

interface Item {
  id: number
  value: number
}

/** A circular buffer: `front` is the slot of the oldest element and the queue wraps around the end. */
interface QueueState {
  slots: (Item | null)[]
  front: number
  size: number
}

function buildQueue(values: number[], capacity: number): QueueState {
  const slots: (Item | null)[] = Array.from({ length: capacity }, (_, index) =>
    index < values.length ? { id: newId(), value: values[index] } : null,
  )
  return { slots, front: 0, size: values.length }
}

export function QueueVisualizer() {
  const [queue, setQueue] = useState<QueueState>(() => buildQueue([4, 17, 9], 6))
  const [tones, setTones] = useState<Record<number, Tone>>({})
  const [status, setStatus] = useState<Status>({
    text: 'First In, First Out: elements join at the rear and leave from the front, like a checkout line.',
    tone: 'info',
  })
  const [valueText, setValueText] = useState('')
  const [listText, setListText] = useState('')
  const [capacityText, setCapacityText] = useState('6')
  const { busy, run } = useAnimator()

  const { slots, front, size } = queue
  const capacity = slots.length
  const rear = (front + size - 1 + capacity) % capacity
  const ordered = Array.from({ length: size }, (_, offset) => slots[(front + offset) % capacity] as Item)
  const fail = (text: string) => setStatus({ text, tone: 'error' })

  function enqueue() {
    const value = parseValue(valueText)
    if (value === null) return fail('Enter a whole number between -999 and 999 in the Value box.')
    if (size >= capacity) return fail(`Queue is full! All ${capacity} slots are in use, so ${value} cannot join.`)
    const slot = (front + size) % capacity
    const item = { id: newId(), value }
    const nextSlots = [...slots]
    nextSlots[slot] = item
    setQueue({ slots: nextSlots, front, size: size + 1 })
    setTones({ [item.id]: 'new' })
    const wrapped = size > 0 && slot < front
    setStatus({
      text: `enqueue(${value}): rear = (front + size) mod ${capacity} = ${slot}.${wrapped ? ' The rear wrapped around to reuse a freed slot.' : ''}`,
      tone: 'success',
      complexity: 'O(1)',
    })
  }

  function dequeue() {
    const item = slots[front]
    if (size === 0 || !item) return fail('Queue is empty, so there is nothing to dequeue.')
    run(async (step) => {
      setTones({ [item.id]: 'removed' })
      setStatus({ text: `dequeue() takes ${item.value} from the front (slot ${front}).`, tone: 'info', complexity: 'O(1)' })
      await step()
      const nextSlots = [...slots]
      nextSlots[front] = null
      const nextFront = (front + 1) % capacity
      setQueue({ slots: nextSlots, front: nextFront, size: size - 1 })
      setTones({})
      setStatus({
        text: `dequeue() returned ${item.value}. front = (front + 1) mod ${capacity} = ${nextFront}. Nothing else had to shift.`,
        tone: 'success',
        complexity: 'O(1)',
      })
    })
  }

  function peek() {
    const item = slots[front]
    if (size === 0 || !item) return fail('Queue is empty, so there is no front element.')
    setTones({ [item.id]: 'found' })
    setStatus({ text: `peek() returns ${item.value}, the element waiting longest.`, tone: 'success', complexity: 'O(1)' })
  }

  function create(values: number[]) {
    const nextCapacity = parseIndex(capacityText)
    if (nextCapacity === null || nextCapacity < 1 || nextCapacity > MAX_CAPACITY) {
      return fail(`Capacity must be between 1 and ${MAX_CAPACITY}.`)
    }
    if (values.length > nextCapacity) return fail(`${values.length} elements will not fit in a queue of capacity ${nextCapacity}.`)
    setQueue(buildQueue(values, nextCapacity))
    setTones({})
    setStatus({
      text: values.length ? `Created a queue of capacity ${nextCapacity}; ${values[0]} is at the front.` : `Created an empty queue of capacity ${nextCapacity}.`,
      tone: 'success',
    })
  }

  function handleCreate() {
    const list = parseNumberList(listText)
    if (list) create(list)
    else fail('Enter numbers separated by commas, e.g. 3, 8, 1. Leave it blank for an empty queue.')
  }

  return (
    <VisualizerLayout
      title="Queue (circular buffer)"
      summary="Front and rear indices chase each other around a fixed array, so both enqueue and dequeue are O(1) and freed slots get reused."
      status={status}
      controls={
        <>
          <ControlGroup label="Operations">
            <Field label="Value" value={valueText} onChange={setValueText} placeholder="e.g. 42" />
            <Button variant="primary" disabled={busy} onClick={enqueue}>Enqueue</Button>
            <Button variant="danger" disabled={busy} onClick={dequeue}>Dequeue</Button>
            <Button disabled={busy} onClick={peek}>Peek front</Button>
          </ControlGroup>
          <ControlGroup label="Create">
            <Field label="Elements (front → rear)" value={listText} onChange={setListText} placeholder="3, 8, 1" wide />
            <Field label="Capacity" value={capacityText} onChange={setCapacityText} placeholder="1–10" />
            <Button disabled={busy} onClick={handleCreate}>Create</Button>
            <Button disabled={busy} onClick={() => create(randomValues(Math.min(4, Number(capacityText) || 4)))}>Random</Button>
            <Button disabled={busy} onClick={() => create([])}>Clear</Button>
          </ControlGroup>
        </>
      }
      footer={
        <>
          <OutputRow label="Front → rear" items={ordered.map((item) => item.value)} />
          <Legend items={[{ tone: 'new', label: 'enqueued' }, { tone: 'found', label: 'peeked' }, { tone: 'removed', label: 'dequeuing' }]} />
        </>
      }
    >
      <div className="array-viz">
        {slots.map((item, index) => {
          const tone = item ? tones[item.id] : undefined
          return (
            <div key={index} className="array-viz__slot">
              <span className="queue-viz__marker">{size > 0 && index === front ? 'front' : ''}</span>
              <div className={`viz-cell${item ? '' : ' viz-cell--unused'}${tone ? ` viz-cell--${tone}` : ''}`}>{item?.value ?? ''}</div>
              <span className="array-viz__index">{index}</span>
              <span className="queue-viz__marker queue-viz__marker--rear">{size > 0 && index === rear ? 'rear' : ''}</span>
            </div>
          )
        })}
      </div>
      <p className="viz__caption">
        front = {front} · rear = {size > 0 ? rear : '—'} · size = {size} · capacity = {capacity}
      </p>
    </VisualizerLayout>
  )
}

import { useState } from 'react'
import { newId, parseIndex, parseNumberList, parseValue, randomValues, useAnimator, type Status } from './animation'
import { Button, ControlGroup, Field, Legend, VisualizerLayout } from './controls'

const MAX_CAPACITY = 10

type Tone = 'found' | 'new' | 'removed'

interface Item {
  id: number
  value: number
}

const toItems = (values: number[]): Item[] => values.map((value) => ({ id: newId(), value }))

export function StackVisualizer() {
  const [capacity, setCapacity] = useState(6)
  const [items, setItems] = useState<Item[]>(() => toItems([5, 12, 9]))
  const [tones, setTones] = useState<Record<number, Tone>>({})
  const [status, setStatus] = useState<Status>({
    text: 'Last In, First Out: you can only push onto, peek at, or pop from the top.',
    tone: 'info',
  })
  const [valueText, setValueText] = useState('')
  const [listText, setListText] = useState('')
  const [capacityText, setCapacityText] = useState('6')
  const { busy, run } = useAnimator()

  const fail = (text: string) => setStatus({ text, tone: 'error' })
  const top = items[items.length - 1]

  function push() {
    const value = parseValue(valueText)
    if (value === null) return fail('Enter a whole number between -999 and 999 in the Value box.')
    if (items.length >= capacity) return fail(`Stack overflow! All ${capacity} slots are in use, so ${value} cannot be pushed.`)
    const item = { id: newId(), value }
    setItems([...items, item])
    setTones({ [item.id]: 'new' })
    setStatus({ text: `push(${value}): top moves up to index ${items.length}.`, tone: 'success', complexity: 'O(1)' })
  }

  function pop() {
    if (!top) return fail('Stack underflow! The stack is empty, so there is nothing to pop.')
    run(async (step) => {
      setTones({ [top.id]: 'removed' })
      setStatus({ text: `pop() removes the top element, ${top.value}.`, tone: 'info', complexity: 'O(1)' })
      await step()
      setItems(items.slice(0, -1))
      setTones({})
      setStatus({ text: `pop() returned ${top.value}. ${items.length - 1} element${items.length === 2 ? '' : 's'} left.`, tone: 'success', complexity: 'O(1)' })
    })
  }

  function peek() {
    if (!top) return fail('The stack is empty, so there is no top element.')
    setTones({ [top.id]: 'found' })
    setStatus({ text: `peek() returns ${top.value} without removing it.`, tone: 'success', complexity: 'O(1)' })
  }

  function create(values: number[]) {
    const size = parseIndex(capacityText)
    if (size === null || size < 1 || size > MAX_CAPACITY) return fail(`Capacity must be between 1 and ${MAX_CAPACITY}.`)
    if (values.length > size) return fail(`${values.length} elements will not fit in a stack of capacity ${size}.`)
    setCapacity(size)
    setItems(toItems(values))
    setTones({})
    setStatus({
      text: values.length ? `Created a stack of capacity ${size}; ${values.at(-1)} (the last value) is on top.` : `Created an empty stack of capacity ${size}.`,
      tone: 'success',
    })
  }

  function handleCreate() {
    const list = parseNumberList(listText)
    if (list) create(list)
    else fail('Enter numbers separated by commas, e.g. 3, 8, 1. Leave it blank for an empty stack.')
  }

  return (
    <VisualizerLayout
      title="Stack"
      summary="Think of a pile of plates: the last one placed is the first one taken. Used for undo, call stacks, and matching brackets."
      status={status}
      controls={
        <>
          <ControlGroup label="Operations">
            <Field label="Value" value={valueText} onChange={setValueText} placeholder="e.g. 42" />
            <Button variant="primary" disabled={busy} onClick={push}>Push</Button>
            <Button variant="danger" disabled={busy} onClick={pop}>Pop</Button>
            <Button disabled={busy} onClick={peek}>Peek</Button>
          </ControlGroup>
          <ControlGroup label="Create">
            <Field label="Elements (bottom → top)" value={listText} onChange={setListText} placeholder="3, 8, 1" wide />
            <Field label="Capacity" value={capacityText} onChange={setCapacityText} placeholder="1–10" />
            <Button disabled={busy} onClick={handleCreate}>Create</Button>
            <Button disabled={busy} onClick={() => create(randomValues(Math.min(4, Number(capacityText) || 4)))}>Random</Button>
            <Button disabled={busy} onClick={() => create([])}>Clear</Button>
          </ControlGroup>
        </>
      }
      footer={<Legend items={[{ tone: 'new', label: 'pushed' }, { tone: 'found', label: 'peeked' }, { tone: 'removed', label: 'popping' }]} />}
    >
      <div className="stack-viz">
        <div className="stack-viz__column" style={{ gridTemplateRows: `repeat(${capacity}, 40px)` }}>
          {Array.from({ length: capacity }, (_, slot) => {
            const index = capacity - 1 - slot
            const item = items[index]
            const tone = item ? tones[item.id] : undefined
            return (
              <div key={index} className="stack-viz__row">
                <span className="stack-viz__index">{index}</span>
                <div className={`viz-cell stack-viz__cell${item ? '' : ' viz-cell--unused'}${tone ? ` viz-cell--${tone}` : ''}`}>
                  {item?.value ?? ''}
                </div>
                <span className="stack-viz__pointer">{item && item === top ? '← top' : ''}</span>
              </div>
            )
          })}
        </div>
      </div>
      <p className="viz__caption">
        size = {items.length} · capacity = {capacity} · top = {items.length - 1}
        {items.length === 0 && ' (empty)'}
      </p>
    </VisualizerLayout>
  )
}

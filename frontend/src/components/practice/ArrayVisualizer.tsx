import { useState } from 'react'
import { parseIndex, parseNumberList, parseValue, randomValues, useAnimator, type Status } from './animation'
import { Button, ControlGroup, Field, Legend, VisualizerLayout } from './controls'

const CAPACITY = 12

type Tone = 'active' | 'found' | 'new' | 'removed' | 'moved'

const INITIAL_STATUS: Status = {
  text: 'Pick an operation. Array elements sit side by side in memory, so any index is reachable in one step.',
  tone: 'info',
}

export function ArrayVisualizer() {
  // `null` marks an empty slot while elements are being shifted during an insert or delete.
  const [cells, setCells] = useState<(number | null)[]>([12, 45, 7, 23, 56, 89])
  const [tones, setTones] = useState<Record<number, Tone>>({})
  const [status, setStatus] = useState<Status>(INITIAL_STATUS)
  const [valueText, setValueText] = useState('')
  const [indexText, setIndexText] = useState('')
  const [listText, setListText] = useState('')
  const { busy, run } = useAnimator()

  const values = cells.filter((cell): cell is number => cell !== null)
  const fail = (text: string) => setStatus({ text, tone: 'error' })

  function readValue() {
    const value = parseValue(valueText)
    if (value === null) fail('Enter a whole number between -999 and 999 in the Value box.')
    return value
  }

  function readIndex(max: number) {
    const index = parseIndex(indexText)
    if (index === null || index > max) {
      fail(max < 0 ? 'The array is empty.' : `Enter an index between 0 and ${max}.`)
      return null
    }
    return index
  }

  function insertAt(index: number, value: number) {
    if (values.length >= CAPACITY) return fail(`The array is full (capacity ${CAPACITY}). Delete something first.`)
    run(async (step) => {
      const work: (number | null)[] = [...values, null]
      setStatus({ text: `Inserting ${value} at index ${index}: make room by shifting elements right.`, tone: 'info', complexity: 'O(n)' })
      for (let i = work.length - 1; i > index; i--) {
        work[i] = work[i - 1]
        work[i - 1] = null
        setCells([...work])
        setTones({ [i]: 'moved' })
        setStatus({ text: `Shift arr[${i - 1}] → arr[${i}]`, tone: 'info', complexity: 'O(n)' })
        await step(0.8)
      }
      work[index] = value
      setCells([...work])
      setTones({ [index]: 'new' })
      const shifted = values.length - index
      setStatus({
        text: `Wrote ${value} into arr[${index}]. ${shifted} element${shifted === 1 ? '' : 's'} had to move.`,
        tone: 'success',
        complexity: index === values.length ? 'O(1) at the end' : 'O(n)',
      })
      await step()
      setTones({})
    })
  }

  function deleteAt(index: number) {
    run(async (step) => {
      const work: (number | null)[] = [...values]
      const removed = work[index]
      setTones({ [index]: 'removed' })
      setStatus({ text: `Removing arr[${index}] = ${removed}.`, tone: 'info', complexity: 'O(n)' })
      await step()
      work[index] = null
      setCells([...work])
      setTones({})
      for (let i = index; i < work.length - 1; i++) {
        work[i] = work[i + 1]
        work[i + 1] = null
        setCells([...work])
        setTones({ [i]: 'moved' })
        setStatus({ text: `Shift arr[${i + 1}] → arr[${i}] to close the gap.`, tone: 'info', complexity: 'O(n)' })
        await step(0.8)
      }
      work.pop()
      setCells(work)
      setTones({})
      setStatus({ text: `Deleted ${removed}. The array now has ${work.length} elements.`, tone: 'success', complexity: 'O(n)' })
    })
  }

  function access(index: number) {
    setTones({ [index]: 'found' })
    setStatus({
      text: `arr[${index}] = ${values[index]}. The address is base + ${index} × elementSize, so no scanning is needed.`,
      tone: 'success',
      complexity: 'O(1)',
    })
  }

  function update(index: number, value: number) {
    const next = [...values]
    const old = next[index]
    next[index] = value
    setCells(next)
    setTones({ [index]: 'new' })
    setStatus({ text: `arr[${index}] changed from ${old} to ${value}.`, tone: 'success', complexity: 'O(1)' })
  }

  function search(value: number) {
    run(async (step) => {
      for (let i = 0; i < values.length; i++) {
        setTones({ [i]: 'active' })
        setStatus({ text: `Compare arr[${i}] = ${values[i]} with ${value}…`, tone: 'info', complexity: 'O(n)' })
        await step(0.8)
        if (values[i] === value) {
          setTones({ [i]: 'found' })
          setStatus({ text: `Found ${value} at index ${i} after ${i + 1} comparison${i === 0 ? '' : 's'}.`, tone: 'success', complexity: 'O(n)' })
          return
        }
      }
      setTones({})
      setStatus({ text: `${value} is not in the array. Checked all ${values.length} elements.`, tone: 'error', complexity: 'O(n)' })
    })
  }

  function create(next: number[]) {
    if (next.length > CAPACITY) return fail(`At most ${CAPACITY} elements fit in this array.`)
    setCells(next)
    setTones({})
    setStatus({ text: `Created an array of ${next.length} elements.`, tone: 'success' })
  }

  function handleInsert() {
    const value = readValue()
    const index = value === null ? null : readIndex(values.length)
    if (value !== null && index !== null) insertAt(index, value)
  }

  function handleAppend() {
    const value = readValue()
    if (value !== null) insertAt(values.length, value)
  }

  function handleDelete() {
    const index = readIndex(values.length - 1)
    if (index !== null) deleteAt(index)
  }

  function handleAccess() {
    const index = readIndex(values.length - 1)
    if (index !== null) access(index)
  }

  function handleUpdate() {
    const value = readValue()
    const index = value === null ? null : readIndex(values.length - 1)
    if (value !== null && index !== null) update(index, value)
  }

  function handleSearch() {
    const value = readValue()
    if (value !== null) search(value)
  }

  function handleCreate() {
    const list = parseNumberList(listText)
    if (list) create(list)
    else fail('Enter numbers separated by commas, e.g. 3, 8, 1.')
  }

  return (
    <VisualizerLayout
      title="Array"
      summary="A fixed-capacity block of contiguous slots. Reading by index is instant; inserting or deleting in the middle shifts everything after it."
      status={status}
      controls={
        <>
          <ControlGroup label="Inputs">
            <Field label="Value" value={valueText} onChange={setValueText} placeholder="e.g. 42" />
            <Field label="Index" value={indexText} onChange={setIndexText} placeholder="e.g. 2" />
          </ControlGroup>
          <ControlGroup label="Operations">
            <Button variant="primary" disabled={busy} onClick={handleInsert}>
              Insert at index
            </Button>
            <Button disabled={busy} onClick={handleAppend}>
              Append
            </Button>
            <Button variant="danger" disabled={busy} onClick={handleDelete}>
              Delete at index
            </Button>
            <Button disabled={busy} onClick={handleAccess}>
              Access arr[i]
            </Button>
            <Button disabled={busy} onClick={handleUpdate}>
              Update arr[i]
            </Button>
            <Button disabled={busy} onClick={handleSearch}>
              Search value
            </Button>
          </ControlGroup>
          <ControlGroup label="Create">
            <Field label="Elements" value={listText} onChange={setListText} placeholder="3, 8, 1, 9" wide />
            <Button disabled={busy} onClick={handleCreate}>
              Create
            </Button>
            <Button disabled={busy} onClick={() => create(randomValues(6 + Math.floor(Math.random() * 4)))}>
              Random
            </Button>
            <Button disabled={busy} onClick={() => create([])}>
              Clear
            </Button>
          </ControlGroup>
        </>
      }
      footer={
        <Legend
          items={[
            { tone: 'active', label: 'comparing' },
            { tone: 'moved', label: 'shifted' },
            { tone: 'new', label: 'written' },
            { tone: 'found', label: 'accessed / found' },
            { tone: 'removed', label: 'removing' },
          ]}
        />
      }
    >
      <div className="array-viz">
        {Array.from({ length: CAPACITY }, (_, index) => {
          const cell = cells[index]
          const used = index < cells.length
          const tone = tones[index]
          return (
            <div key={index} className="array-viz__slot">
              <div
                className={[
                  'viz-cell',
                  used ? '' : 'viz-cell--unused',
                  used && cell === null ? 'viz-cell--empty' : '',
                  tone ? `viz-cell--${tone}` : '',
                ].join(' ')}
              >
                {cell ?? ''}
              </div>
              <span className="array-viz__index">{index}</span>
            </div>
          )
        })}
      </div>
      <p className="viz__caption">
        length = {values.length} · capacity = {CAPACITY}
      </p>
    </VisualizerLayout>
  )
}

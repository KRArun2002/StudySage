import type { ReactNode } from 'react'
import type { Status } from './animation'

interface VisualizerLayoutProps {
  title: string
  summary: string
  controls: ReactNode
  status: Status
  children: ReactNode
  /** Extra panels under the stage, e.g. traversal output or an adjacency list. */
  footer?: ReactNode
}

export function VisualizerLayout({ title, summary, controls, status, children, footer }: VisualizerLayoutProps) {
  return (
    <section className="viz">
      <header className="viz__header">
        <h3 className="viz__title">{title}</h3>
        <p className="viz__summary">{summary}</p>
      </header>
      <div className="viz__controls">{controls}</div>
      <div className="viz__stage">{children}</div>
      <p className={`viz__status viz__status--${status.tone}`} aria-live="polite">
        <span>{status.text}</span>
        {status.complexity && <span className="viz__complexity">{status.complexity}</span>}
      </p>
      {footer}
    </section>
  )
}

export function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="viz__group">
      <span className="viz__group-label">{label}</span>
      <div className="viz__group-body">{children}</div>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  wide?: boolean
}

export function Field({ label, value, onChange, placeholder, wide }: FieldProps) {
  return (
    <label className="viz__field">
      <span>{label}</span>
      <input
        className={`viz__input${wide ? ' viz__input--wide' : ''}`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

interface ButtonProps {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'danger' | 'ghost'
}

export function Button({ children, onClick, disabled, variant = 'ghost' }: ButtonProps) {
  return (
    <button type="button" className={`viz__btn viz__btn--${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

interface SelectProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

export function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <label className="viz__field">
      <span>{label}</span>
      <select className="viz__input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function OutputRow({ label, items }: { label: string; items: (string | number)[] }) {
  return (
    <div className="viz__output">
      <span className="viz__output-label">{label}</span>
      <div className="viz__output-items">
        {items.length === 0 ? (
          <span className="viz__output-empty">empty</span>
        ) : (
          items.map((item, index) => (
            <span key={index} className="viz__chip">
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  )
}

export function Legend({ items }: { items: { tone: string; label: string }[] }) {
  return (
    <ul className="viz__legend">
      {items.map((item) => (
        <li key={item.tone}>
          <span className={`viz__swatch viz__swatch--${item.tone}`} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

import './CourseTabs.css'

export interface CourseTab {
  key: string
  label: string
  /** Topic tabs come first; tool tabs (practice, visualizer, resources) follow after a divider. */
  group: 'topic' | 'tool'
  badge?: string
}

interface CourseTabsProps {
  tabs: CourseTab[]
  activeKey: string | undefined
  onSelect: (key: string) => void
}

export function CourseTabs({ tabs, activeKey, onSelect }: CourseTabsProps) {
  return (
    <div className="course-tabs" role="tablist" aria-label="Course sections">
      {tabs.map((tab, index) => (
        <div key={tab.key} className="course-tabs__slot">
          {index > 0 && tab.group !== tabs[index - 1].group && <span className="course-tabs__divider" aria-hidden />}
          <button
            type="button"
            role="tab"
            aria-selected={tab.key === activeKey}
            className={`course-tabs__tab${tab.key === activeKey ? ' course-tabs__tab--active' : ''}`}
            onClick={() => onSelect(tab.key)}
          >
            {tab.label}
            {tab.badge && <span className="course-tabs__badge">{tab.badge}</span>}
          </button>
        </div>
      ))}
    </div>
  )
}

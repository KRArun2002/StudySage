import type { Resource, ResourceType } from '../api/types'
import './ResourceSidebar.css'

const TYPE_LABELS: Record<ResourceType, string> = {
  youtube_video: 'Video',
  youtube_playlist: 'Playlist',
  document: 'Document',
  external_link: 'Link',
}

export type SelectedKey = string | 'interactive'

interface ResourceSidebarProps {
  resources: Resource[]
  selectedKey: SelectedKey
  onSelect: (key: SelectedKey) => void
}

export function ResourceSidebar({ resources, selectedKey, onSelect }: ResourceSidebarProps) {
  return (
    <nav className="resource-sidebar">
      <h3 className="resource-sidebar__heading">Resources</h3>
      {resources.length === 0 && <p className="resource-sidebar__empty">No resources added yet.</p>}
      <ul className="resource-sidebar__list">
        {resources.map((resource) => (
          <li key={resource.id}>
            <button
              type="button"
              className={`resource-sidebar__item${selectedKey === resource.id ? ' resource-sidebar__item--active' : ''}`}
              onClick={() => onSelect(resource.id)}
            >
              <span className="resource-sidebar__badge">{TYPE_LABELS[resource.type]}</span>
              <span className="resource-sidebar__item-title">{resource.title}</span>
            </button>
          </li>
        ))}
      </ul>

      <h3 className="resource-sidebar__heading resource-sidebar__heading--spaced">Practice</h3>
      <ul className="resource-sidebar__list">
        <li>
          <button
            type="button"
            className={`resource-sidebar__item${selectedKey === 'interactive' ? ' resource-sidebar__item--active' : ''}`}
            onClick={() => onSelect('interactive')}
          >
            <span className="resource-sidebar__badge">Interactive</span>
            <span className="resource-sidebar__item-title">Interactive Exercise</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

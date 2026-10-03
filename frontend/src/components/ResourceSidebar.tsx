import type { Resource, ResourceType } from '../api/types'
import './ResourceSidebar.css'

const TYPE_LABELS: Record<ResourceType, string> = {
  youtube_video: 'Video',
  youtube_playlist: 'Playlist',
  document: 'Document',
  external_link: 'Link',
  study_guide: 'Notes',
}

interface ResourceSidebarProps {
  resources: Resource[]
  selectedId: string
  onSelect: (resourceId: string) => void
}

export function ResourceSidebar({ resources, selectedId, onSelect }: ResourceSidebarProps) {
  return (
    <nav className="resource-sidebar">
      <h3 className="resource-sidebar__heading">Resources</h3>
      {resources.length === 0 && <p className="resource-sidebar__empty">No resources added yet.</p>}
      <ul className="resource-sidebar__list">
        {resources.map((resource) => (
          <li key={resource.id}>
            <button
              type="button"
              className={`resource-sidebar__item${selectedId === resource.id ? ' resource-sidebar__item--active' : ''}`}
              onClick={() => onSelect(resource.id)}
            >
              <span className="resource-sidebar__badge">{TYPE_LABELS[resource.type]}</span>
              <span className="resource-sidebar__item-title">{resource.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

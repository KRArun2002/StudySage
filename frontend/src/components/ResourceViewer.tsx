import type { Resource } from '../api/types'
import { youtubePlaylistEmbedUrl, youtubeVideoEmbedUrl } from '../utils/youtube'
import './ResourceViewer.css'

interface ResourceViewerProps {
  resource: Resource
}

export function ResourceViewer({ resource }: ResourceViewerProps) {
  return (
    <div className="resource-viewer">
      <div className="resource-viewer__header">
        <h2 className="resource-viewer__title">{resource.title}</h2>
        {resource.description && <p className="resource-viewer__description">{resource.description}</p>}
      </div>
      <div className="resource-viewer__stage">{renderStage(resource)}</div>
    </div>
  )
}

function renderStage(resource: Resource) {
  switch (resource.type) {
    case 'youtube_video':
      return (
        <iframe
          key={resource.id}
          className="resource-viewer__frame"
          src={youtubeVideoEmbedUrl(resource.videoId)}
          title={resource.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    case 'youtube_playlist':
      return (
        <iframe
          key={resource.id}
          className="resource-viewer__frame"
          src={youtubePlaylistEmbedUrl(resource.playlistId)}
          title={resource.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    case 'document':
      return (
        <>
          <iframe key={resource.id} className="resource-viewer__frame" src={resource.url} title={resource.title} />
          <a className="resource-viewer__fallback-link" href={resource.url} target="_blank" rel="noreferrer">
            Open document in a new tab ↗
          </a>
        </>
      )
    case 'external_link':
      return (
        <>
          <iframe key={resource.id} className="resource-viewer__frame" src={resource.url} title={resource.title} />
          <p className="resource-viewer__fallback-note">
            Some sites block embedding.{' '}
            <a href={resource.url} target="_blank" rel="noreferrer">
              Open in a new tab ↗
            </a>{' '}
            if nothing appears above.
          </p>
        </>
      )
  }
}

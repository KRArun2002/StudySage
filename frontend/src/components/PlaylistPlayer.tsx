import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import type { PlaylistRef } from '../api/types'
import { useFetch } from '../hooks/useFetch'
import { youtubePlaylistEmbedUrl, youtubeVideoEmbedUrl } from '../utils/youtube'
import './PlaylistPlayer.css'

interface PlaylistPlayerProps {
  playlist: PlaylistRef
}

export function PlaylistPlayer({ playlist }: PlaylistPlayerProps) {
  const { data, error, loading } = useFetch(() => api.getPlaylistVideos(playlist.playlistId), [playlist.playlistId])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  const activeItemRef = useRef<HTMLButtonElement>(null)

  // Keep the selected video visible inside the panel without scrolling the page itself.
  useEffect(() => {
    const list = listRef.current
    const item = activeItemRef.current
    if (!list || !item) return
    if (item.offsetTop < list.scrollTop) {
      list.scrollTop = item.offsetTop
    } else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight
    }
  }, [selectedIndex, data])

  const playlistUrl = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlist.playlistId)}`
  const videos = data?.videos ?? []
  const current = videos[selectedIndex]

  // If the video list can't be loaded, YouTube's own playlist embed still lets students watch.
  if (error || (data && videos.length === 0)) {
    return (
      <div className="playlist-player playlist-player--fallback">
        <div className="playlist-player__screen">
          <iframe
            className="playlist-player__frame"
            src={youtubePlaylistEmbedUrl(playlist.playlistId)}
            title={playlist.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="playlist-player__note">
          Couldn't load the video list, so the whole playlist is embedded instead.{' '}
          <a href={playlistUrl} target="_blank" rel="noreferrer">
            Open on YouTube ↗
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="playlist-player">
      <div className="playlist-player__main">
        <div className="playlist-player__screen">
          {current ? (
            <iframe
              key={current.videoId}
              className="playlist-player__frame"
              src={`${youtubeVideoEmbedUrl(current.videoId)}?rel=0`}
              title={current.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="playlist-player__placeholder">{loading ? 'Loading playlist…' : null}</div>
          )}
        </div>
        {current && (
          <div className="playlist-player__now-playing">
            <h3 className="playlist-player__video-title">{current.title}</h3>
            <div className="playlist-player__nav">
              <button type="button" disabled={selectedIndex === 0} onClick={() => setSelectedIndex(selectedIndex - 1)}>
                ← Previous
              </button>
              <button
                type="button"
                disabled={selectedIndex === videos.length - 1}
                onClick={() => setSelectedIndex(selectedIndex + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="playlist-player__panel" aria-label={`${playlist.title} videos`}>
        <div className="playlist-player__panel-header">
          <span className="playlist-player__panel-title">{playlist.title}</span>
          <span className="playlist-player__panel-meta">
            {loading ? 'Loading…' : `${selectedIndex + 1} / ${videos.length}${data?.isComplete ? '' : '+'}`}
          </span>
        </div>
        <ol ref={listRef} className="playlist-player__list">
          {loading &&
            Array.from({ length: 5 }, (_, index) => <li key={index} className="playlist-player__skeleton" aria-hidden />)}
          {videos.map((video, index) => (
            <li key={`${video.videoId}-${index}`}>
              <button
                type="button"
                ref={index === selectedIndex ? activeItemRef : undefined}
                className={`playlist-player__item${index === selectedIndex ? ' playlist-player__item--active' : ''}`}
                aria-current={index === selectedIndex}
                onClick={() => setSelectedIndex(index)}
              >
                <span className="playlist-player__index">{index === selectedIndex ? '▶' : index + 1}</span>
                <img className="playlist-player__thumb" src={video.thumbnailUrl} alt="" loading="lazy" />
                <span className="playlist-player__item-title">{video.title}</span>
              </button>
            </li>
          ))}
        </ol>
        {data && (
          <a className="playlist-player__more" href={playlistUrl} target="_blank" rel="noreferrer">
            {data.isComplete ? 'Open playlist on YouTube ↗' : `Showing the first ${videos.length} videos · See all on YouTube ↗`}
          </a>
        )}
      </aside>
    </div>
  )
}

export function youtubeVideoEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

export function youtubePlaylistEmbedUrl(playlistId: string): string {
  return `https://www.youtube.com/embed/videoseries?list=${playlistId}`
}

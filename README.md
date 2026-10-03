# StudySage

## Editing course content

All course content lives in `backend/Data/content.json`. Restart the backend after editing it; the file is read once at startup, and mistakes such as duplicate ids stop it from starting with an error naming the problem.

### Topic tabs, playlists and practice problems

Each course can have `subtopics`. Every subtopic becomes a tab on the course page (e.g. **Arrays**, **Linked Lists**) with its own YouTube playlists and LeetCode problems:

```json
"subtopics": [
  {
    "id": "arrays",
    "title": "Arrays",
    "description": "Optional one-line summary shown under the tab title.",
    "playlists": [
      { "id": "arrays-neso", "title": "Arrays in C (Neso Academy)", "playlistId": "PLBlnK6fEyqRhU6vNrQ-6ndkcbM7D7q-U8" }
    ],
    "problems": [
      { "id": "two-sum", "title": "Two Sum", "difficulty": "Easy", "url": "https://leetcode.com/problems/two-sum/" }
    ]
  }
]
```

- **Adding a topic:** add another object to `subtopics`. Its `id` must be unique within the course and must not be `leetcode`, `visualizer` or `resources` (those are the built-in tabs).
- **Playlists:** `playlistId` is the part of a YouTube link after `list=`. When a topic has more than one playlist, students can switch between them. The playlist must be Public or Unlisted.
- **Problems:** use the LeetCode slug (the part of the URL after `/problems/`) as the `id`. Students' solved checkmarks are stored by this id, so the same problem in two courses shares its progress. `difficulty` must be `Easy`, `Medium` or `Hard`.

The **LeetCode Practice** tab appears automatically when any topic has problems, and the **Resources** tab when the course has `resources` (documents, links, single videos).

### Showing every video in long playlists

Without configuration, the backend reads playlists from YouTube's public feed, which only lists the first 15 videos (a "See all on YouTube" link covers the rest). To list full playlists, create a [YouTube Data API v3 key](https://console.cloud.google.com/apis/library/youtube.googleapis.com) and give it to the backend without committing it:

```bash
export YouTube__ApiKey="your-key"
```

#!/usr/bin/env python3
"""Fill imageUrl and imageCredit for courses in backend/Data/content.json from Openverse.

Usage:  python3 scripts/fetch-openverse-images.py

Only commercially usable, openly licensed photographs are used. Courses that
already have an imageUrl are skipped, so the script can be re-run to fill gaps.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

CONTENT_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "Data", "content.json")
SEARCH_URL = "https://api.openverse.org/v1/images/"
USER_AGENT = "StudySage/1.0 (course image fetcher)"
PHOTO_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")
REQUEST_DELAY_SECONDS = 3


def search(query):
    params = urllib.parse.urlencode({
        "q": query,
        "category": "photograph",
        "license_type": "commercial",
        "page_size": 10,
    })
    request = urllib.request.Request(f"{SEARCH_URL}?{params}", headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request) as response:
        return json.load(response).get("results", [])


def is_reachable(url):
    request = urllib.request.Request(url, method="HEAD", headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status == 200
    except (urllib.error.URLError, OSError):
        return False


def pick_photo(results):
    for result in results:
        url = result.get("url") or ""
        if url.lower().split("?")[0].endswith(PHOTO_EXTENSIONS) and is_reachable(url):
            return result
    return None


def license_label(license_code):
    labels = {"cc0": "CC0", "pdm": "Public domain"}
    return labels.get(license_code, f"CC {license_code.upper()}")


def save(content):
    with open(CONTENT_PATH, "w", encoding="utf-8") as f:
        json.dump(content, f, indent=2, ensure_ascii=False)
        f.write("\n")


def fill_course(course, topic_title):
    photo = None
    for query in (course["title"], topic_title):
        photo = pick_photo(search(query))
        if photo is not None:
            break
        time.sleep(REQUEST_DELAY_SECONDS)
    if photo is None:
        print(f"  no suitable photo for: {course['title']}")
        return

    course["imageUrl"] = photo["url"]
    course["imageCredit"] = {
        "name": photo.get("creator") or "Unknown photographer",
        "url": photo.get("foreign_landing_url") or photo.get("url"),
        "license": license_label(photo["license"]),
    }


def main():
    with open(CONTENT_PATH, encoding="utf-8") as f:
        content = json.load(f)

    for topic in content["topics"]:
        for course in topic["courses"]:
            if course.get("imageUrl"):
                continue
            print(f"Fetching photo for {course['id']}")
            try:
                fill_course(course, topic["title"])
            except urllib.error.HTTPError as error:
                save(content)
                sys.exit(f"Openverse returned HTTP {error.code} for {course['id']}. Progress saved; re-run later.")
            save(content)
            time.sleep(REQUEST_DELAY_SECONDS)

    print("Done.")


if __name__ == "__main__":
    main()

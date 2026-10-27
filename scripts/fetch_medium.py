
import json
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

# Medium RSS source
RSS_URL = "https://medium.com/feed/@ravzzy"

# Output destination
ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = ROOT / "data" / "medium-articles.json"

# RSS content namespace
CONTENT_NS = "{http://purl.org/rss/1.0/modules/content/}"


def get_text(element, tag):
    child = element.find(tag)

    if child is None:
        return ""

    return "".join(child.itertext()).strip()


def fetch_medium_articles():
    print("Fetching Medium RSS feed...")

    request = urllib.request.Request(
        RSS_URL,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/rss+xml, application/xml, text/xml"
        }
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        if response.status != 200:
            raise RuntimeError(
                f"Medium returned HTTP {response.status}"
            )

        xml_data = response.read()

    root = ET.fromstring(xml_data)

    articles = []

    for item in root.findall("./channel/item"):
        description = get_text(item, "description")
        content = get_text(item, CONTENT_NS + "encoded")

        articles.append({
            "title": get_text(item, "title"),
            "link": get_text(item, "link"),
            "pubDate": get_text(item, "pubDate"),
            "description": description,
            "content": content or description
        })

    if not articles:
        raise RuntimeError(
            "No articles were returned by Medium."
        )

    data = {
        "status": "ok",
        "items": articles
    }

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    OUTPUT_FILE.write_text(
        json.dumps(
            data,
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )

    print(f"Successfully retrieved {len(articles)} articles.")
    print(f"JSON saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    fetch_medium_articles()

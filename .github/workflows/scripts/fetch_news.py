#!/usr/bin/env python3
import json, re, hashlib
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path
import feedparser

JST = timezone(timedelta(hours=9))
OUT = Path(__file__).resolve().parents[1] / "data" / "news.json"

FEEDS = [
    ("NHK 経済", "https://www3.nhk.or.jp/rss/news/cat5.xml", "報道"),
    ("日本銀行", "https://www.boj.or.jp/rss/whatsnew.xml", "一次情報"),
    ("日本銀行 統計", "https://www.boj.or.jp/rss/statistics.xml", "一次情報"),
    ("金融庁", "https://www.fsa.go.jp/fsaNewsListAll_rss2.xml", "一次情報"),
    ("経済産業省", "https://www.meti.go.jp/ml_index_release_atom.xml", "一次情報"),
    ("内閣府", "https://www.cao.go.jp/rss/news.rdf", "一次情報"),
    ("総務省統計局", "https://www.stat.go.jp/whatsnew/news.rdf", "一次情報"),
]

CATEGORY_WORDS = {
    "商社": ["商社", "三菱商事", "三井物産", "伊藤忠", "住友商事", "丸紅", "豊田通商", "双日", "資源", "LNG", "原油"],
    "銀行・金利": ["銀行", "日銀", "金利", "利上げ", "利下げ", "金融政策", "融資", "預金", "住宅ローン", "三菱UFJ", "三井住友", "みずほ"],
    "証券・市場": ["証券", "株価", "日経平均", "TOPIX", "上場", "IPO", "為替", "円相場", "国債", "株式", "市場"],
    "企業戦略": ["M&A", "買収", "合併", "統合", "事業再編", "売却", "提携", "人員削減", "経営", "決算", "業績"],
    "メーカー": ["自動車", "半導体", "電機", "化学", "食品", "製薬", "工場", "生産", "設備投資", "サプライチェーン"],
    "IT・通信": ["IT", "AI", "通信", "生成AI", "データセンター", "半導体", "ソフトバンク", "KDDI", "NTT", "楽天"],
    "政策・統計": ["GDP", "景気", "物価", "雇用", "統計", "経済対策", "予算", "金融庁", "経済産業省", "内閣府", "消費者物価"],
}

IMPORTANT_HIGH = ["利上げ", "利下げ", "金融政策", "買収", "合併", "経営統合", "事業売却", "行政処分", "業務停止", "下方修正", "上方修正", "人員削減", "破産", "倒産"]
IMPORTANT_MID = ["決算", "業績", "提携", "設備投資", "新規事業", "海外進出", "株価", "為替", "物価", "雇用", "GDP"]

def clean(text):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", text or "")).strip()

def parse_date(entry):
    for key in ("published_parsed", "updated_parsed"):
        value = entry.get(key)
        if value:
            return datetime(*value[:6], tzinfo=timezone.utc).astimezone(JST)
    for key in ("published", "updated"):
        value = entry.get(key)
        if value:
            try:
                dt = parsedate_to_datetime(value)
                if dt.tzinfo is None: dt = dt.replace(tzinfo=JST)
                return dt.astimezone(JST)
            except Exception:
                pass
    return datetime.now(JST)

def categories(title, summary, source_kind):
    text = f"{title} {summary}"
    found = [name for name, words in CATEGORY_WORDS.items() if any(w.lower() in text.lower() for w in words)]
    if source_kind == "一次情報" and "政策・統計" not in found:
        found.append("政策・統計")
    return found or ["その他"]

def importance(text):
    if any(w.lower() in text.lower() for w in IMPORTANT_HIGH): return 3
    if any(w.lower() in text.lower() for w in IMPORTANT_MID): return 2
    return 1

def main():
    items, seen = [], set()
    cutoff = datetime.now(JST) - timedelta(days=7)
    errors = []
    for source, url, source_kind in FEEDS:
        feed = feedparser.parse(url, request_headers={"User-Agent": "KeioCareerNews/1.0 personal research"})
        if getattr(feed, "bozo", False) and not feed.entries:
            errors.append(source)
            continue
        count = 0
        for entry in feed.entries:
            title = clean(entry.get("title"))
            link = entry.get("link", "").strip()
            if not title or not link: continue
            published = parse_date(entry)
            if published < cutoff: continue
            key = re.sub(r"\W", "", title.lower())[:80]
            if key in seen: continue
            seen.add(key)
            summary = clean(entry.get("summary", ""))[:240]
            text = f"{title} {summary}"
            items.append({
                "id": hashlib.sha1(f"{title}|{link}".encode()).hexdigest()[:12],
                "title": title,
                "url": link,
                "source": source,
                "sourceType": source_kind,
                "published": published.isoformat(timespec="minutes"),
                "categories": categories(title, summary, source_kind),
                "importance": importance(text),
            })
            count += 1
            if count >= 20: break
    items.sort(key=lambda x: (x["importance"], x["published"]), reverse=True)
    items = items[:100]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "updatedAt": datetime.now(JST).isoformat(timespec="minutes"),
        "count": len(items),
        "errors": errors,
        "items": items,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(items)} items to {OUT}")

if __name__ == "__main__":
    main()

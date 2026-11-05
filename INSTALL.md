# 経済ニュース欄の導入

## 1. ZIP内をリポジトリ直下へアップロード
隠しフォルダ `.github` を含め、次の構造を維持してください。

- `.github/workflows/update_news.yml`
- `scripts/fetch_news.py`
- `data/news.json`
- `news.js`

## 2. index.htmlへ1行追加
`</body>` の直前へ追加します。

```html
<script src="news.js?v=1"></script>
```

`news.js` がサイト下部、footer直前にニュース欄を自動挿入します。

## 3. GitHub Actionsを初回実行
GitHubの Actions → Update economic news → Run workflow を実行します。
通常1～2分で `data/news.json` が更新されます。

## 4. 定期更新
毎時07分と37分、約30分間隔で自動更新します。GitHub Actionsの混雑により遅れる場合があります。

## 情報源
NHK経済、日本銀行、日本銀行統計、金融庁、経済産業省、内閣府、総務省統計局。
Yahoo!ニュースは、GitHub Pagesが公開状態になり得るため初期設定から除外しています。

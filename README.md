# 文学部の就職先データ可視化サイト

## 公開方法（GitHub Pages）
1. GitHubで新しいリポジトリを作成します。
2. このフォルダ内の `index.html`、`styles.css`、`data.js`、`app.js` をリポジトリ直下へアップロードします。
3. リポジトリの **Settings → Pages** を開きます。
4. **Build and deployment** の Source を **Deploy from a branch** にします。
5. Branchを **main**、フォルダを **/(root)** にして Save します。
6. 数分後、Pages欄に公開URLが表示されます。

## ローカル確認
`index.html` をブラウザーで開くだけでも表示できます。ローカルサーバーを使う場合は、このフォルダで `python -m http.server 8000` を実行し、`http://localhost:8000` を開きます。

## データ更新
`data.js` の `INDUSTRIES` を編集すると、円グラフと棒グラフの両方に反映されます。

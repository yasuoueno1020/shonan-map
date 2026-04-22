湘南観光マップ サイト構成一式

■ 収録内容
- index.html
- css/style.css
- js/app.js
- data/stores.json
- images/stores/  … 店舗画像を置くフォルダ
- images/qr/      … QRコード画像を置くフォルダ

■ 特徴
- data/stores.json を読む構成
- 店舗件数が増えても HTML を直接編集しない運用
- カテゴリ絞り込み
- エリア絞り込み
- キーワード検索
- 1ページ20件のページ分割
- 仮マップ表示
- QRコード別ファイル参照

■ 今の stores.json
- 店舗数: 2 件

■ 使い方
1. このフォルダ構成のままWebサーバーに置く
2. data/stores.json を差し替える
3. images/stores/ に店舗画像を置く
4. images/qr/ にQRコード画像を置く

■ 画像命名のおすすめ
- 店舗画像: 0001_main.jpg
- サムネイル: 0001_thumb.jpg
- QR画像: 0001.png

■ 注意
- ブラウザでローカルファイルとして直接開くと fetch 制限で JSON 読み込みが失敗することがあります
- その場合はローカルサーバーで開いてください
  例: Python がある場合
  python -m http.server 8000

  その後、ブラウザで
  http://localhost:8000/shonan_map_site/
  を開きます

■ 今後の拡張候補
- Leaflet または Google Maps の本格導入
- ピンのクラスタリング
- 現在地検索
- 画像遅延読み込み
- API化

# 🏓 ピックルボール 紅白対抗戦 スケジュール生成ツール

ピックルボールダブルスの紅白対抗戦スケジュールを自動生成するWebアプリです。  
選手名・性別・コート数・試合数を設定するだけで、公平なスケジュールを瞬時に生成します。

## 🌐 デモ

**👉 [https://yoshiki1011.github.io/pickleball-schedule/](https://yoshiki1011.github.io/pickleball-schedule/)**

## ✨ 主な機能

- **自動スケジュール生成** — 全員が均等に出場・休みを取れるスケジュールを200回リトライで最適化
- **性別対応** — 同性対戦・ミックス対戦・自動（混合）モードに対応
- **パートナー制限** — 同じ人と組む回数を最大N回に制限
- **検証タブ** — 生成後に出場回数・パートナー回数・重複対戦・連続休みを自動チェック
- **スコア集計** — 試合結果を入力してチーム勝敗を集計
- **Excel出力** — スケジュールをExcel（.xlsx）でダウンロード
- **URL/QRコード共有** — 設定をURLやQRコードで共有
- **スマホ対応** — レスポンシブデザインでスマホからも使いやすい
- **設定の自動保存** — localStorageで選手名・設定を自動保存

## 📋 対応フォーマット

| 項目 | 内容 |
|------|------|
| 人数 | 紅組・白組それぞれ2人以上（同数） |
| コート数 | 1〜10面 |
| 試合数 | 1〜30試合 |
| 対戦モード | 制限なし / 同性対戦 / ミックス対戦 / 自動（混合） |

## 🚀 使い方

1. **選手を設定** — 紅組・白組の選手名と性別を入力
2. **基本設定** — コート数・試合数・同一ペア最大回数を設定
3. **対戦モードを選択** — 制限なし / 同性 / ミックス / 自動
4. **「🎯 スケジュール生成」をクリック**
5. 生成されたスケジュールを確認・印刷・Excel出力

## 💻 ローカルで動かす

サーバー不要。HTMLファイルをブラウザで開くだけで動作します。

```bash
git clone https://github.com/Yoshiki1011/pickleball-schedule.git
cd pickleball-schedule
open index_v2_gender.html  # macOS
# または
start index_v2_gender.html  # Windows
```

## 🛠 技術スタック

- **フロントエンド**: HTML / CSS / Vanilla JavaScript（フレームワーク不使用）
- **Excel出力**: [ExcelJS](https://github.com/exceljs/exceljs)（CDN）
- **QRコード**: [qrcode.js](https://github.com/soldair/node-qrcode)（CDN）
- **ホスティング**: GitHub Pages

## 📊 アルゴリズム

- **休みスケジュール**: 各選手の休み回数が均等になるよう貪欲法で割り当て
- **パートナー割り当て**: バックトラッキング + 20回試行でパートナー多様性を最大化
- **コート割り当て**: 全順列を評価し、対戦相手の偏りを最小化
- **最適化**: 200回リトライし、重複対戦・対戦相手偏りが最小の解を採用

## 📝 ライセンス

[MIT License](LICENSE) — 自由に使用・改変・再配布できます。

## 🤝 コントリビューション

バグ報告・機能提案・プルリクエスト歓迎です！

1. このリポジトリをFork
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをPush (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

---

Made with ❤️ for the pickleball community 🏓

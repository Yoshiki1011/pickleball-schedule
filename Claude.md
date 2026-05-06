# Pickleball Schedule Generator - Claude 作業ログ

このファイルはClaude（AI）が行った変更のバージョン履歴を記録します。

---

## バージョン履歴

### v1.5.3 (2026-05-06)
**修正内容：**
- 英語モード（🇺🇸 English）に切り替えたとき、統計バーの「対戦タイプ」ラベルが日本語のまま表示されていた問題を修正
- `renderStats()` 内のハードコードされた `'対戦タイプ'` を `t.statMatchType` に変更
- i18n に `statMatchType` キーを追加（`ja: '対戦タイプ'`、`en: 'Match Type'`）

**変更ファイル：**
- `index_v2_gender.html`

---

### v1.5.2 (それ以前)
- 性別対応スケジュール生成機能（同性対戦・ミックス対戦・自動モード）
- 多言語対応（日本語 / English）
- スコア入力・集計タブ
- 検証タブ
- QRコード共有
- URL共有
- Excel ダウンロード
- localStorage による設定保存

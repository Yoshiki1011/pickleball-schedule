# Pickleball Schedule Generator - Claude 作業ログ

このファイルはClaude（AI）が行った変更のバージョン履歴を記録します。

---

## バージョン履歴

### v1.5.4 (2026-05-06)
**修正内容：**
- 英語モード（🇺🇸 English）に切り替えたとき、多数の箇所で日本語が残っていた問題を全面修正
- i18n辞書（`ja` / `en`）に以下のキーを追加：
  - UI固定テキスト：`loadingText`, `panelStats`, `panelSchedule`, `validationDefault`
  - モード説明文：`modeNoteAny/Same/Mixed/Auto`
  - `validate()` の全エラー・警告・成功メッセージ（`errTeamSize`, `warnSameAdjust` 等）
  - `generate()` のエラーメッセージ（`errGenerateAuto`, `errGenerateGeneral`）
  - `renderVerifyTab()` の全ラベル（`verifyPlayCount`, `verifyNoDup` 等）
  - `shareURL()` のアラート・プロンプト文
  - QRコード生成テキスト（`qrGenerating`, `qrGenError`, `qrLibError`）
  - Excel出力（タイトル・サブタイトル・ヘッダー・ファイル名・エラー）
  - `removePlayer()` の最低人数アラート
- `setLang()` に `loading-text`, `panel-stats-header`, `panel-schedule-header` の更新処理を追加
- `selectMode()` のモード説明文を i18n 対応
- バージョンを `v1.5.4` に更新

**変更ファイル：**
- `index_v2_gender.html`

---

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

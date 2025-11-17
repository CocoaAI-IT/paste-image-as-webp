# リリース手順（ローカルビルド版）

ビルド済みファイルを使ってGitHubリリースを手動で作成する手順です。

## 前提条件

既にビルドが完了していること：
```bash
npm install
npm run build
```

以下のファイルが生成されていることを確認：
- `main.js`
- `manifest.json`
- `styles.css`

## リリース作成手順

### 方法1: GitHubのWebインターフェース（推奨）

1. **GitHubリポジトリページにアクセス**
   - https://github.com/CocoaAI-IT/obsidian_exteition

2. **Releasesページに移動**
   - 右サイドバーの「Releases」をクリック
   - または直接 https://github.com/CocoaAI-IT/obsidian_exteition/releases にアクセス

3. **新しいリリースを作成**
   - 「Draft a new release」ボタンをクリック

4. **リリース情報を入力**
   - **Tag version**: `1.0.1`
   - **Release title**: `v1.0.1 - Security fixes and improvements`
   - **Description**:
   ```markdown
   ## Security Enhancements

   - ✅ Path traversal prevention
   - ✅ DoS attack protection with image size limits
   - ✅ Filename sanitization
   - ✅ Loop limit for duplicate files
   - ✅ Safe error messaging

   ## New Features

   - Configurable security settings in UI
   - Maximum image size setting (default: 4096×4096)
   - Maximum file size setting (default: 10MB)
   - Comprehensive security documentation

   ## Installation

   Download `main.js`, `manifest.json`, and `styles.css` below and place them in:
   `.obsidian/plugins/paste-image-as-webp/`

   See [README.md](https://github.com/CocoaAI-IT/obsidian_exteition/blob/main/README.md) for detailed installation instructions.
   ```

5. **ファイルを添付**
   - ローカルの以下のファイルをドラッグ&ドロップ：
     - `main.js`
     - `manifest.json`
     - `styles.css`

6. **リリースを公開**
   - 「Publish release」ボタンをクリック

### 方法2: GitHub CLI（ghコマンド）

```bash
# リリースを作成してファイルを添付
gh release create 1.0.1 \
  --title "v1.0.1 - Security fixes and improvements" \
  --notes "Security enhancements and new configurable settings. See README for details." \
  main.js manifest.json styles.css
```

**注意**: `gh`コマンドを使用するには、GitHub CLIがインストールされている必要があります。

## リリース後の確認

1. リリースページで3つのファイルがダウンロード可能か確認
2. READMEのリンクが正しく機能するか確認
3. テストインストールを実行

## トラブルシューティング

### ファイルが見つからない
```bash
# ビルドを再実行
npm run build

# ファイルの存在確認
ls -l main.js manifest.json styles.css
```

### リリースの編集
作成後も「Edit release」から編集可能です。

## 次回以降の自動化

GitHub Actionsワークフローが設定されているため、次回からは：
```bash
git tag -a 1.0.2 -m "Release message"
git push origin 1.0.2
```
でタグをプッシュすると自動的にリリースが作成されます（403エラーが解決されている場合）。

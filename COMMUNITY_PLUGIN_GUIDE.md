# Obsidianコミュニティプラグインとして公開する手順

このプラグインをObsidianのコミュニティプラグインとして公開するためのガイドです。

## 前提条件

1. GitHubリポジトリが公開されていること
2. プラグインが正しく動作することをテストしていること
3. GitHubアカウントがあること

## 公開手順

### 1. 初回リリースの作成

#### 方法A: GitHubのWebインターフェースから

1. ローカルでビルド
   ```bash
   npm install
   npm run build
   ```

2. GitHubリポジトリページで「Releases」→「Create a new release」をクリック

3. タグを作成（例: `1.0.0`）

4. 以下のファイルを添付:
   - `main.js`
   - `manifest.json`
   - `styles.css`

5. リリースノートを記入して「Publish release」

#### 方法B: コマンドラインから（推奨）

```bash
# ビルド
npm install
npm run build

# タグを作成してプッシュ（GitHub Actionsが自動でリリースを作成）
git tag -a 1.0.0 -m "Initial release"
git push origin 1.0.0
```

GitHub Actionsが自動的にビルドしてリリースを作成します。
作成されたドラフトリリースを確認して公開してください。

### 2. Obsidianコミュニティプラグインに申請

1. [obsidian-releases](https://github.com/obsidianmd/obsidian-releases) リポジトリをフォーク

2. `community-plugins.json` に以下を追加:
   ```json
   {
     "id": "paste-image-as-webp",
     "name": "Paste Image as WebP",
     "author": "CocoaAI-IT",
     "description": "Automatically converts pasted images to WebP format with configurable filenames",
     "repo": "CocoaAI-IT/obsidian_exteition"
   }
   ```

3. プルリクエストを作成

4. レビュー待ち（通常1〜2週間）

### 3. 承認後

承認されると、ユーザーはObsidianの設定画面から直接インストールできるようになります:
- Obsidian設定 → コミュニティプラグイン → 「閲覧」 → 「Paste Image as WebP」で検索

## 更新版のリリース

新しいバージョンをリリースする場合:

```bash
# package.jsonのバージョンを更新
npm version patch  # または minor, major

# ビルド
npm run build

# タグをプッシュ
git push origin --tags
```

GitHub Actionsが自動的に新しいリリースを作成します。

## 注意事項

### 必須ファイル

リリースには必ず以下のファイルを含めてください:
- `main.js` - ビルド済みプラグイン
- `manifest.json` - プラグインメタデータ
- `styles.css` - スタイルシート（オプションですが推奨）

### バージョン管理

- `manifest.json`のバージョンと`package.json`のバージョンを一致させる
- セマンティックバージョニング（major.minor.patch）に従う
- `versions.json`にObsidianの最小バージョンを記録

### リリースノート

各リリースには以下を含めることを推奨:
- 新機能
- バグ修正
- 破壊的変更
- アップグレード方法（必要な場合）

## トラブルシューティング

### GitHub Actionsが失敗する場合

1. ビルドログを確認
2. ローカルで `npm run build` が成功するか確認
3. Node.jsのバージョンを確認（`.github/workflows/release.yml`）

### コミュニティプラグイン申請が却下される場合

よくある理由:
- プラグインが正しく動作しない
- コードに重大なセキュリティ問題がある
- 既存のプラグインと重複している
- ドキュメントが不十分

## 参考リンク

- [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Community Plugins Repository](https://github.com/obsidianmd/obsidian-releases)

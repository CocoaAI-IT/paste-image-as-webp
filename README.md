# Paste Image as WebP - Obsidian Plugin

Obsidianでクリップボードから画像をペーストする際に、自動的にWebP形式に変換して保存するプラグインです。

## 機能

- クリップボードから画像をペーストすると自動的にWebP形式に変換
- ファイル名を2つの形式から選択可能：
  - **固定名**: `image.webp` などの固定ファイル名
  - **タイムスタンプ**: `20231116143025.webp` などの日時ベース
- WebP品質の調整可能（0.1〜1.0）
- 保存先フォルダのカスタマイズ
- エディタに `![[ファイル名.webp]]` 形式で自動挿入
- 同名ファイルが存在する場合は自動的に連番を追加

## インストール

### Obsidianコミュニティプラグインから（推奨）

**準備中**: このプラグインは現在、Obsidianコミュニティプラグインへの登録申請準備中です。

承認後は以下の手順で簡単にインストールできます：

1. Obsidianの設定を開く
2. 「コミュニティプラグイン」→「閲覧」をクリック
3. 「Paste Image as WebP」を検索
4. 「インストール」をクリック
5. インストール後、「有効化」をクリック

### GitHubリリースから手動インストール（現在利用可能）

コミュニティプラグイン承認前に使用したい場合：

1. [最新リリース](https://github.com/CocoaAI-IT/obsidian_exteition/releases)から以下をダウンロード:
   - `main.js`
   - `manifest.json`
   - `styles.css`

2. Obsidianのプラグインフォルダに`paste-image-as-webp`フォルダを作成:
   - Windows: `%appdata%\Obsidian\<your-vault>\.obsidian\plugins\paste-image-as-webp\`
   - macOS: `~/Library/Application Support/obsidian/<your-vault>/.obsidian/plugins/paste-image-as-webp/`
   - Linux: `~/.config/obsidian/<your-vault>/.obsidian/plugins/paste-image-as-webp/`

3. ダウンロードした3つのファイルをこのフォルダに配置

4. Obsidianを再起動し、設定からプラグインを有効化

### 開発者向け

プラグインの開発やカスタマイズをしたい場合：

```bash
# リポジトリをクローン
git clone https://github.com/CocoaAI-IT/obsidian_exteition.git
cd obsidian_exteition

# 依存関係のインストール
npm install

# 開発モード（ファイル変更を監視）
npm run dev

# プロダクションビルド
npm run build
```

詳細は [COMMUNITY_PLUGIN_GUIDE.md](COMMUNITY_PLUGIN_GUIDE.md) を参照してください。

## 使い方

1. Obsidianの設定から「コミュニティプラグイン」を開く
2. 「Paste Image as WebP」プラグインを有効化
3. プラグイン設定で以下をカスタマイズ：
   - **ファイル名形式**: 固定名またはタイムスタンプ
   - **固定ファイル名**: 固定名を選択した場合の名前（デフォルト: `image`）
   - **タイムスタンプフォーマット**: タイムスタンプの形式（デフォルト: `YYYYMMDDHHmmss`）
   - **保存先フォルダ**: 画像の保存先（デフォルト: `attachments`）
   - **WebP品質**: 画像品質（デフォルト: 0.85）

4. クリップボードに画像をコピーして、Obsidianのエディタでペースト（Ctrl+V / Cmd+V）

## 設定項目

### ファイル名形式

#### 固定名（Fixed name）
- 同じファイル名で保存（例: `image.webp`）
- 同名ファイルがある場合は自動的に `image-1.webp`, `image-2.webp` のように連番追加

#### タイムスタンプ（Timestamp）
- 日時をベースにしたファイル名
- フォーマット指定可能：
  - `YYYY`: 年（4桁）
  - `MM`: 月（2桁）
  - `DD`: 日（2桁）
  - `HH`: 時（2桁、24時間形式）
  - `mm`: 分（2桁）
  - `ss`: 秒（2桁）
- デフォルト: `YYYYMMDDHHmmss` → `20231116143025.webp`
- カスタム例:
  - `YYYY-MM-DD_HHmmss` → `2023-11-16_143025.webp`
  - `YYYYMMDD_HH-mm-ss` → `20231116_14-30-25.webp`

### 保存先フォルダ
- Vaultルートからの相対パス
- フォルダが存在しない場合は自動作成

### WebP品質
- 0.1〜1.0の範囲で指定
- 1.0が最高品質（ファイルサイズ大）
- 0.85がバランスの取れたデフォルト値

### セキュリティ設定
- **最大画像サイズ**: 画像の最大ピクセル数（幅×高さ）
  - デフォルト: 16,777,216（4096×4096）
  - DoS攻撃防止のため
- **最大ファイルサイズ**: アップロード可能な最大ファイルサイズ（MB）
  - デフォルト: 10MB
  - リソース消費を制限

詳細は [SECURITY.md](SECURITY.md) を参照してください。

## WebP形式のメリット

- **ファイルサイズ削減**: PNG/JPEGと比較して20-50%小さいファイルサイズ
- **品質保持**: 高い圧縮率でも視覚的な品質を維持
- **透過対応**: PNGのようなアルファチャンネル（透過）をサポート
- **Vaultの軽量化**: 多くの画像を使用するVaultのサイズを大幅に削減

## トラブルシューティング

### 画像がペーストされない
- プラグインが有効になっているか確認
- クリップボードに画像データが含まれているか確認
- コンソール（Ctrl+Shift+I）でエラーを確認

### 保存先フォルダが見つからない
- 設定で指定したフォルダパスが正しいか確認
- プラグインは自動的にフォルダを作成しますが、親フォルダが存在する必要があります

## ライセンス

MIT License

## 開発者

CocoaAI-IT

## 貢献

バグ報告や機能要望は GitHub Issues でお願いします。

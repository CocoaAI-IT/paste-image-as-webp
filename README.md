# Paste Image as WebP

Convert images pasted from the clipboard into WebP format automatically when inserting them into your notes. Supports customizable file names, WebP compression quality, save destinations, and automatic embedding in the editor.

## Features

- Automatically converts clipboard images to WebP on paste
- Two filename modes:
  - **Fixed name**: e.g. `image.webp`
  - **Timestamp**: e.g. `20231116143025.webp`
- Adjustable WebP quality (0.1–1.0)
- Configurable save folder (vault root, same folder as current note, or a custom path)
- Inserts `![[filename.webp]]` at the cursor automatically
- Duplicate filenames are resolved by appending a numeric suffix
- Built-in size limits to guard against malicious or oversized images

## Installation

### From the Community Plugins directory (recommended once approved)

1. Open **Settings → Community plugins → Browse**.
2. Search for `Paste Image as WebP`.
3. Click **Install**, then **Enable**.

### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/CocoaAI-IT/paste-image-as-webp/releases).
2. Create a folder `paste-image-as-webp` inside `<your-vault>/.obsidian/plugins/`.
3. Copy the three files into that folder.
4. Restart Obsidian and enable the plugin from **Settings → Community plugins**.

## Usage

1. Enable the plugin in **Settings → Community plugins**.
2. Open the plugin settings to configure:
   - **Filename format**: fixed name or timestamp.
   - **Fixed filename** (when fixed mode is selected).
   - **Timestamp format** (when timestamp mode is selected).
   - **Image folder location**: vault root, same folder as the current note, or a custom path.
   - **Image folder name** or **custom folder path**.
   - **Image quality (WebP)**: 0.1–1.0.
3. Copy an image to the clipboard and paste (Ctrl+V / Cmd+V) into the editor.

### Timestamp tokens

`YYYY` year, `MM` month, `DD` day, `HH` hour (24h), `mm` minute, `ss` second.

Examples:

- `YYYYMMDDHHmmss` → `20231116143025.webp`
- `YYYY-MM-DD_HHmmss` → `2023-11-16_143025.webp`

### Security settings

- **Maximum image size**: maximum total pixels (width × height). Default `16777216` (4096 × 4096).
- **Maximum file size (MB)**: maximum input file size in megabytes. Default `10`.

These limits prevent malicious images from consuming excessive resources during decoding. See [SECURITY.md](SECURITY.md) for details.

## Network and file system use

This plugin does **not** make any network requests and does **not** read or write files outside the current vault. All image conversion is performed locally in the browser/Electron renderer using the `<canvas>` `toBlob('image/webp', …)` API.

## Development

```bash
git clone https://github.com/CocoaAI-IT/paste-image-as-webp.git
cd paste-image-as-webp
npm install
npm run dev      # watch mode
npm run build    # production build
```

## License

[MIT](LICENSE)

## Author

CocoaAI-IT

---

## 日本語

クリップボードからペーストした画像を自動的に WebP 形式に変換して Obsidian の Vault に保存するプラグインです。ファイル名・品質・保存先をカスタマイズでき、エディタには `![[ファイル名.webp]]` 形式で自動挿入されます。

### 主な機能

- クリップボードから画像をペーストすると自動的に WebP に変換
- ファイル名形式: 固定名 / タイムスタンプ
- WebP 品質を 0.1〜1.0 で調整可能
- 保存先: Vault ルート / 現在のノートと同じフォルダ / カスタムパス
- 同名ファイルは自動で連番付与
- 画像サイズ・ファイルサイズの上限設定（DoS 対策）

### 使い方

1. 設定 → コミュニティプラグイン から **Paste Image as WebP** を有効化
2. プラグイン設定でファイル名形式・保存先・品質などを設定
3. 画像をコピーしてエディタに Ctrl+V / Cmd+V でペースト

### ネットワーク・ファイルシステム

このプラグインは外部通信を一切行わず、Vault 外のファイルにアクセスすることもありません。画像変換は `<canvas>` の `toBlob('image/webp', …)` API を使って端末内で完結します。

### ライセンス

[MIT](LICENSE)

import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

interface PasteImageAsWebPSettings {
	filenameFormat: 'fixed' | 'timestamp';
	fixedFilename: string;
	timestampFormat: string;
	imageFolder: string;
	webpQuality: number;
	maxImageSize: number; // Maximum pixels (width * height)
	maxFileSizeMB: number; // Maximum file size in MB
}

const DEFAULT_SETTINGS: PasteImageAsWebPSettings = {
	filenameFormat: 'timestamp',
	fixedFilename: 'image',
	timestampFormat: 'YYYYMMDDHHmmss',
	imageFolder: 'attachments',
	webpQuality: 0.85,
	maxImageSize: 16777216, // 4096 * 4096
	maxFileSizeMB: 10
}

// Security constants
const MAX_FILENAME_LENGTH = 255;
const MAX_DUPLICATE_ATTEMPTS = 1000;
const UNSAFE_PATH_CHARS = /[<>:"|?*\x00-\x1f]/g;
const PATH_TRAVERSAL_PATTERN = /\.\.|[\/\\]/g;

export default class PasteImageAsWebPPlugin extends Plugin {
	settings: PasteImageAsWebPSettings;

	async onload() {
		await this.loadSettings();

		// クリップボードからの画像ペーストをインターセプト
		this.registerEvent(
			this.app.workspace.on('editor-paste', this.handlePaste.bind(this))
		);

		// 設定タブを追加
		this.addSettingTab(new PasteImageAsWebPSettingTab(this.app, this));

		console.log('Paste Image as WebP plugin loaded');
	}

	onunload() {
		console.log('Paste Image as WebP plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Sanitizes a filename to remove dangerous characters
	 */
	private sanitizeFilename(filename: string): string {
		// Remove path traversal attempts and unsafe characters
		let sanitized = filename
			.replace(PATH_TRAVERSAL_PATTERN, '')
			.replace(UNSAFE_PATH_CHARS, '_')
			.replace(/\0/g, ''); // Remove null bytes

		// Trim whitespace and dots from edges
		sanitized = sanitized.trim().replace(/^\.+|\.+$/g, '');

		// Ensure filename is not empty
		if (!sanitized) {
			sanitized = 'image';
		}

		// Limit filename length
		if (sanitized.length > MAX_FILENAME_LENGTH) {
			sanitized = sanitized.substring(0, MAX_FILENAME_LENGTH);
		}

		return sanitized;
	}

	/**
	 * Validates and sanitizes a folder path
	 */
	private sanitizeFolderPath(path: string): string {
		// Remove path traversal attempts
		let sanitized = path
			.replace(/\.\./g, '')
			.replace(/\0/g, '') // Remove null bytes
			.replace(/^[\/\\]+/, '') // Remove leading slashes
			.replace(/[\/\\]+$/, ''); // Remove trailing slashes

		// Normalize slashes to forward slashes
		sanitized = sanitized.replace(/\\/g, '/');

		// Remove unsafe characters
		sanitized = sanitized.replace(UNSAFE_PATH_CHARS, '_');

		// Ensure path is not empty
		if (!sanitized) {
			sanitized = 'attachments';
		}

		// Prevent absolute paths
		if (sanitized.startsWith('/') || sanitized.match(/^[a-zA-Z]:/)) {
			sanitized = 'attachments';
		}

		return sanitized;
	}

	/**
	 * Validates image file size
	 */
	private validateFileSize(file: File): void {
		const maxBytes = this.settings.maxFileSizeMB * 1024 * 1024;
		if (file.size > maxBytes) {
			throw new Error(`Image file size exceeds ${this.settings.maxFileSizeMB}MB limit`);
		}
	}

	/**
	 * Validates image dimensions
	 */
	private validateImageDimensions(width: number, height: number): void {
		const totalPixels = width * height;
		if (totalPixels > this.settings.maxImageSize) {
			throw new Error(`Image dimensions exceed maximum allowed size`);
		}

		// Additional sanity checks
		if (width <= 0 || height <= 0 || width > 16384 || height > 16384) {
			throw new Error(`Invalid image dimensions`);
		}
	}

	private async handlePaste(evt: ClipboardEvent, editor: Editor, view: MarkdownView) {
		// クリップボードからファイルを取得
		const files = evt.clipboardData?.files;
		if (!files || files.length === 0) {
			return; // 画像がない場合は通常のペースト処理
		}

		// 画像ファイルをフィルタ
		const imageFiles = Array.from(files).filter(file =>
			file.type.startsWith('image/')
		);

		if (imageFiles.length === 0) {
			return; // 画像がない場合は通常のペースト処理
		}

		// デフォルトのペースト動作を防ぐ
		evt.preventDefault();

		// 各画像を処理
		for (const file of imageFiles) {
			await this.processImage(file, editor, view);
		}
	}

	private async processImage(file: File, editor: Editor, view: MarkdownView) {
		try {
			// Validate file size
			this.validateFileSize(file);

			// 画像をWebPに変換
			const webpBlob = await this.convertToWebP(file);

			// ファイル名を生成
			const filename = this.generateFilename();

			// 保存先パスを生成
			const filepath = await this.saveImage(webpBlob, filename, view);

			// エディタに挿入
			this.insertImageLink(editor, filepath);

			new Notice(`Image saved as ${filename}`);
		} catch (error) {
			console.error('Error processing image:', error);
			// Use generic error message to avoid information leakage
			const userMessage = this.getSafeErrorMessage(error);
			new Notice(userMessage);
		}
	}

	/**
	 * Returns a safe error message for user display
	 */
	private getSafeErrorMessage(error: any): string {
		const errorMsg = error?.message || '';

		// Allow specific known error messages
		if (errorMsg.includes('exceeds') ||
		    errorMsg.includes('dimensions') ||
		    errorMsg.includes('Invalid')) {
			return errorMsg;
		}

		// Generic error for unknown issues
		return 'Failed to process image. Please check the image format and size.';
	}

	private async convertToWebP(file: File): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			const reader = new FileReader();

			reader.onload = (e) => {
				img.onload = () => {
					try {
						// Validate image dimensions
						this.validateImageDimensions(img.width, img.height);

						// Canvasを作成
						const canvas = document.createElement('canvas');
						canvas.width = img.width;
						canvas.height = img.height;

						// 画像を描画
						const ctx = canvas.getContext('2d');
						if (!ctx) {
							reject(new Error('Failed to get canvas context'));
							return;
						}
						ctx.drawImage(img, 0, 0);

						// WebPに変換
						canvas.toBlob(
							(blob) => {
								if (blob) {
									resolve(blob);
								} else {
									reject(new Error('Failed to convert to WebP'));
								}
							},
							'image/webp',
							this.settings.webpQuality
						);
					} catch (error) {
						reject(error);
					}
				};

				img.onerror = () => {
					reject(new Error('Failed to load image'));
				};

				img.src = e.target?.result as string;
			};

			reader.onerror = () => {
				reject(new Error('Failed to read file'));
			};

			reader.readAsDataURL(file);
		});
	}

	private generateFilename(): string {
		let baseFilename: string;

		if (this.settings.filenameFormat === 'fixed') {
			baseFilename = this.sanitizeFilename(this.settings.fixedFilename);
		} else {
			// タイムスタンプフォーマット
			const now = new Date();
			const format = this.sanitizeFilename(this.settings.timestampFormat);

			let filename = format
				.replace('YYYY', now.getFullYear().toString())
				.replace('MM', (now.getMonth() + 1).toString().padStart(2, '0'))
				.replace('DD', now.getDate().toString().padStart(2, '0'))
				.replace('HH', now.getHours().toString().padStart(2, '0'))
				.replace('mm', now.getMinutes().toString().padStart(2, '0'))
				.replace('ss', now.getSeconds().toString().padStart(2, '0'));

			baseFilename = this.sanitizeFilename(filename);
		}

		return `${baseFilename}.webp`;
	}

	private async saveImage(blob: Blob, filename: string, view: MarkdownView): Promise<string> {
		// Sanitize folder path
		const folder = this.sanitizeFolderPath(this.settings.imageFolder);

		// フォルダが存在しない場合は作成
		const folderExists = await this.app.vault.adapter.exists(folder);
		if (!folderExists) {
			await this.app.vault.createFolder(folder);
		}

		// ファイルパスを生成（重複チェック付き）
		let filepath = `${folder}/${filename}`;
		let counter = 1;

		// 同名ファイルが存在する場合は番号を追加（上限付き）
		while (await this.app.vault.adapter.exists(filepath)) {
			if (counter >= MAX_DUPLICATE_ATTEMPTS) {
				throw new Error('Too many duplicate files. Please use a different filename format.');
			}

			const nameWithoutExt = filename.replace('.webp', '');
			filepath = `${folder}/${nameWithoutExt}-${counter}.webp`;
			counter++;
		}

		// ArrayBufferに変換
		const arrayBuffer = await blob.arrayBuffer();

		// ファイルを保存
		await this.app.vault.createBinary(filepath, arrayBuffer);

		return filepath;
	}

	private insertImageLink(editor: Editor, filepath: string) {
		// カーソル位置に画像リンクを挿入
		const cursor = editor.getCursor();
		const imageMarkdown = `![[${filepath}]]`;

		editor.replaceRange(imageMarkdown, cursor);

		// カーソルを画像リンクの後ろに移動
		const newCursor = {
			line: cursor.line,
			ch: cursor.ch + imageMarkdown.length
		};
		editor.setCursor(newCursor);
	}
}

class PasteImageAsWebPSettingTab extends PluginSettingTab {
	plugin: PasteImageAsWebPPlugin;

	constructor(app: App, plugin: PasteImageAsWebPPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Paste Image as WebP Settings'});

		// ファイル名形式
		new Setting(containerEl)
			.setName('Filename format')
			.setDesc('Choose how to name the saved images')
			.addDropdown(dropdown => dropdown
				.addOption('fixed', 'Fixed name')
				.addOption('timestamp', 'Timestamp')
				.setValue(this.plugin.settings.filenameFormat)
				.onChange(async (value: 'fixed' | 'timestamp') => {
					this.plugin.settings.filenameFormat = value;
					await this.plugin.saveSettings();
					this.display(); // 再描画
				}));

		// 固定ファイル名（固定名の場合のみ表示）
		if (this.plugin.settings.filenameFormat === 'fixed') {
			new Setting(containerEl)
				.setName('Fixed filename')
				.setDesc('Filename to use (without extension)')
				.addText(text => text
					.setPlaceholder('image')
					.setValue(this.plugin.settings.fixedFilename)
					.onChange(async (value) => {
						this.plugin.settings.fixedFilename = value || 'image';
						await this.plugin.saveSettings();
					}));
		}

		// タイムスタンプフォーマット（タイムスタンプの場合のみ表示）
		if (this.plugin.settings.filenameFormat === 'timestamp') {
			new Setting(containerEl)
				.setName('Timestamp format')
				.setDesc('Format: YYYY (year), MM (month), DD (day), HH (hour), mm (minute), ss (second)')
				.addText(text => text
					.setPlaceholder('YYYYMMDDHHmmss')
					.setValue(this.plugin.settings.timestampFormat)
					.onChange(async (value) => {
						this.plugin.settings.timestampFormat = value || 'YYYYMMDDHHmmss';
						await this.plugin.saveSettings();
					}));

			// サンプル表示
			const sampleFilename = this.generateSampleFilename();
			containerEl.createEl('div', {
				text: `Sample: ${sampleFilename}`,
				cls: 'setting-item-description'
			});
		}

		// 保存先フォルダ
		new Setting(containerEl)
			.setName('Image folder')
			.setDesc('Folder to save images (relative to vault root)')
			.addText(text => text
				.setPlaceholder('attachments')
				.setValue(this.plugin.settings.imageFolder)
				.onChange(async (value) => {
					this.plugin.settings.imageFolder = value || 'attachments';
					await this.plugin.saveSettings();
				}));

		// WebP品質
		new Setting(containerEl)
			.setName('WebP quality')
			.setDesc('Image quality (0.0 - 1.0, higher is better quality)')
			.addSlider(slider => slider
				.setLimits(0.1, 1.0, 0.05)
				.setValue(this.plugin.settings.webpQuality)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.webpQuality = value;
					await this.plugin.saveSettings();
				}));

		// Security settings header
		containerEl.createEl('h3', {text: 'Security Settings'});

		// 最大画像サイズ
		new Setting(containerEl)
			.setName('Maximum image size')
			.setDesc('Maximum total pixels (width × height). Default: 16777216 (4096×4096)')
			.addText(text => text
				.setPlaceholder('16777216')
				.setValue(this.plugin.settings.maxImageSize.toString())
				.onChange(async (value) => {
					const numValue = parseInt(value);
					if (!isNaN(numValue) && numValue > 0) {
						this.plugin.settings.maxImageSize = numValue;
						await this.plugin.saveSettings();
					}
				}));

		// 最大ファイルサイズ
		new Setting(containerEl)
			.setName('Maximum file size (MB)')
			.setDesc('Maximum file size in megabytes. Default: 10MB')
			.addText(text => text
				.setPlaceholder('10')
				.setValue(this.plugin.settings.maxFileSizeMB.toString())
				.onChange(async (value) => {
					const numValue = parseFloat(value);
					if (!isNaN(numValue) && numValue > 0) {
						this.plugin.settings.maxFileSizeMB = numValue;
						await this.plugin.saveSettings();
					}
				}));

		// Security notice
		containerEl.createEl('div', {
			text: 'Security settings help prevent malicious images from consuming excessive resources.',
			cls: 'setting-item-description'
		});
	}

	private generateSampleFilename(): string {
		const now = new Date();
		const format = this.plugin.settings.timestampFormat;

		let filename = format
			.replace('YYYY', now.getFullYear().toString())
			.replace('MM', (now.getMonth() + 1).toString().padStart(2, '0'))
			.replace('DD', now.getDate().toString().padStart(2, '0'))
			.replace('HH', now.getHours().toString().padStart(2, '0'))
			.replace('mm', now.getMinutes().toString().padStart(2, '0'))
			.replace('ss', now.getSeconds().toString().padStart(2, '0'));

		return `${filename}.webp`;
	}
}

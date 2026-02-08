import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
    console.log('Markdown Snapshot PDF extension is now active!');

    let convertToPdf = vscode.commands.registerCommand('markdownSnapshotPdf.convertToPdf', async (uri?: vscode.Uri, uris?: vscode.Uri[]) => {
        await handleMultipleFiles(context, false, uri, uris);
    });

    let convertToPdfOnePage = vscode.commands.registerCommand('markdownSnapshotPdf.convertToPdfOnePage', async (uri?: vscode.Uri, uris?: vscode.Uri[]) => {
        await handleMultipleFiles(context, true, uri, uris);
    });

    context.subscriptions.push(convertToPdf);
    context.subscriptions.push(convertToPdfOnePage);
}

async function handleMultipleFiles(context: vscode.ExtensionContext, onePage: boolean, uri?: vscode.Uri, uris?: vscode.Uri[]) {
    if (uris && uris.length > 1) {
        // 複数ファイル選択時
        const markdownFiles = uris.filter(u => u.fsPath.endsWith('.md'));
        
        if (markdownFiles.length === 0) {
            vscode.window.showErrorMessage('No Markdown files selected');
            return;
        }

        vscode.window.showInformationMessage(`Converting ${markdownFiles.length} files to PDF...`);
        
        // 並列数を4に制限して順次処理
        const results = await processFilesWithLimit(context, onePage, markdownFiles, 4);
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const errorCount = results.filter(r => r.status === 'rejected').length;
        
        if (errorCount === 0) {
            vscode.window.showInformationMessage(`Successfully converted ${successCount} files to PDF`);
        } else {
            vscode.window.showWarningMessage(`Converted ${successCount} files, ${errorCount} failed`);
        }
    } else {
        // 単一ファイル処理
        await convertMarkdownToPdf(context, onePage, uri, false, 0);
    }
}

// 並列数を制限して処理（完了したものから順次次を開始）
async function processFilesWithLimit(
    context: vscode.ExtensionContext,
    onePage: boolean,
    files: vscode.Uri[],
    limit: number
): Promise<PromiseSettledResult<void>[]> {
    const results: PromiseSettledResult<void>[] = new Array(files.length);
    let nextIndex = 0;
    let activeCount = 0;
    
    return new Promise((resolve) => {
        const startNext = () => {
            while (activeCount < limit && nextIndex < files.length) {
                const currentIndex = nextIndex++;
                activeCount++;
                
                convertMarkdownToPdf(context, onePage, files[currentIndex], true, currentIndex)
                    .then(() => {
                        results[currentIndex] = { status: 'fulfilled', value: undefined };
                    })
                    .catch((error) => {
                        console.error(`Failed to convert ${files[currentIndex].fsPath}:`, error);
                        results[currentIndex] = { status: 'rejected', reason: error };
                    })
                    .finally(() => {
                        activeCount--;
                        if (nextIndex < files.length) {
                            startNext();
                        } else if (activeCount === 0) {
                            resolve(results);
                        }
                    });
            }
        };
        
        startNext();
    });
}

async function convertMarkdownToPdf(context: vscode.ExtensionContext, onePage: boolean = false, uri?: vscode.Uri, suppressMessage: boolean = false, processIndex: number = 0) {
    let filePath: string;
    
    // エクスプローラーから右クリックされた場合はuriを使用
    if (uri) {
        filePath = uri.fsPath;
    } else {
        // コマンドパレットから実行された場合はアクティブエディタを使用
        const activeEditor = vscode.window.activeTextEditor;
        
        if (!activeEditor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = activeEditor.document;
        
        if (document.languageId !== 'markdown') {
            vscode.window.showErrorMessage('Current file is not a Markdown file');
            return;
        }

        await document.save();
        filePath = document.fileName;
    }
    
    // ファイルがMarkdownかチェック
    if (!filePath.endsWith('.md')) {
        vscode.window.showErrorMessage('Selected file is not a Markdown file');
        return;
    }
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, '.md');
    const outputPath = path.join(fileDir, `${fileName}.pdf`);

    try {
        if (!suppressMessage) {
            vscode.window.showInformationMessage(onePage ? 'Converting to PDF (1 page)...' : 'Converting to PDF...');
        }

        // First, try to ensure Puppeteer is properly set up
        await ensurePuppeteerSetup(context);

        // Use local md-to-pdf library
        const mdToPdf = require(path.join(context.extensionPath, 'index.js'));
        
        // Configure options for one-page PDF with unique identifier
        const config = onePage ? {
            dest: outputPath,
            onePage: true,
            processIndex: processIndex  // 並列処理用の識別子
        } : {
            dest: outputPath,
            processIndex: processIndex  // 並列処理用の識別子
        };
        
        const result = await mdToPdf(filePath, config);

        if (!suppressMessage) {
            vscode.window.showInformationMessage(`PDF conversion completed: ${path.basename(result.filename)}`);
        }

    } catch (error: any) {
        console.error('Conversion error:', error);
        
        if (!suppressMessage) {
            // Check if it's a Puppeteer setup required error
            if (error.message && error.message.includes('PUPPETEER_SETUP_REQUIRED')) {
                const action = await vscode.window.showInformationMessage(
                    'First time setup required: Chromium browser needs to be downloaded for PDF conversion.\n\nThis is a one-time setup and will take a few minutes.',
                    'Download Now',
                    'Cancel'
                );
                
                if (action === 'Download Now') {
                    await setupPuppeteerAutomatically(context);
                    vscode.window.showInformationMessage('✓ Setup completed! Please try PDF conversion again.');
                }
            } else if (error.message && error.message.includes('Could not find expected browser')) {
                const action = await vscode.window.showErrorMessage(
                    'Chromium browser not found.\n\nThis usually happens after extension updates or system changes.',
                    'Run Setup',
                    'Cancel'
                );
                
                if (action === 'Run Setup') {
                    await setupPuppeteerAutomatically(context);
                }
            } else {
                vscode.window.showErrorMessage(`PDF conversion failed: ${error.message}`);
            }
        }
        
        // Re-throw error for batch processing to handle
        throw error;
    }
}

async function ensurePuppeteerSetup(context: vscode.ExtensionContext): Promise<void> {
    try {
        const puppeteer = require('puppeteer');
        const executablePath = puppeteer.executablePath();
        console.log('Puppeteer executable path:', executablePath);
    } catch (error: any) {
        console.warn('Puppeteer setup check failed:', error.message);
        
        // Auto-setup for first time users
        const action = await vscode.window.showInformationMessage(
            'First time setup required: Chromium browser needs to be downloaded for PDF conversion.\n\nThis is a one-time setup and will take a few minutes.',
            'Download Now',
            'Cancel'
        );
        
        if (action === 'Download Now') {
            await setupPuppeteerAutomatically(context);
        } else {
            throw new Error('PDF conversion requires Chromium browser.\n\nPlease run the setup by:\n1. Opening Command Palette (Ctrl+Shift+P)\n2. Running "Markdown Snapshot PDF: Convert to PDF"\n3. Selecting "Download Now" when prompted');
        }
    }
}

async function setupPuppeteerAutomatically(context: vscode.ExtensionContext): Promise<void> {
    try {
        vscode.window.showInformationMessage('Downloading Chromium browser... This may take a few minutes.');
        
        const extensionPath = context.extensionPath;
        
        // Check if npm is available
        try {
            await execAsync('npm --version', { cwd: extensionPath });
        } catch (npmError) {
            const platform = process.platform;
            let installInstructions = '';
            
            if (platform === 'linux') {
                installInstructions = 'Ubuntu/Debian: sudo apt install npm\nFedora/RHEL: sudo dnf install npm';
            } else if (platform === 'darwin') {
                installInstructions = 'Install via Homebrew: brew install node';
            } else if (platform === 'win32') {
                installInstructions = 'Download from: https://nodejs.org/';
            }
            
            throw new Error(`npm is required but not installed.\n\n${installInstructions}\n\nAfter installation, reload VSCode window (Ctrl+Shift+P → "Developer: Reload Window")`);
        }
        
        // Try to install Chromium via Puppeteer
        try {
            await execAsync('npx puppeteer browsers install chrome', { cwd: extensionPath });
            vscode.window.showInformationMessage('✓ Chromium setup completed successfully! You can now convert Markdown to PDF.');
        } catch (chromiumError) {
            // Fallback to npm install puppeteer
            await execAsync('npm install puppeteer --no-save', { cwd: extensionPath });
            vscode.window.showInformationMessage('✓ Puppeteer setup completed! Please try PDF conversion again.');
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Setup failed: ${error.message}`);
        throw error;
    }
}

export function deactivate() {}

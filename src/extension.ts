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
        
        // 並列処理で全ファイルを変換（競合回避済み）
        const results = await Promise.allSettled(
            markdownFiles.map((fileUri, index) => convertMarkdownToPdf(context, onePage, fileUri, true, index))
        );
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const errorCount = results.filter(r => r.status === 'rejected').length;
        
        // エラーログ出力
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Failed to convert ${markdownFiles[index].fsPath}:`, result.reason);
            }
        });
        
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
        
        // Check if it's a Puppeteer setup required error
        if (error.message && error.message.includes('PUPPETEER_SETUP_REQUIRED')) {
            const action = await vscode.window.showInformationMessage(
                'First time setup: Download Chromium browser for PDF conversion?',
                'Yes, Download',
                'Cancel'
            );
            
            if (action === 'Yes, Download') {
                await setupPuppeteerAutomatically(context);
                // Retry conversion after setup
                vscode.window.showInformationMessage('Setup completed. Please try PDF conversion again.');
            }
        } else if (error.message && error.message.includes('Could not find expected browser')) {
            const action = await vscode.window.showErrorMessage(
                'Chromium browser not found. Would you like to run Puppeteer setup?',
                'Run Setup',
                'Cancel'
            );
            
            if (action === 'Run Setup') {
                await setupPuppeteerAutomatically(context);
            }
        } else {
            if (!suppressMessage) {
                vscode.window.showErrorMessage(`PDF conversion failed: ${error.message}`);
            }
        }
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
            'First time setup: Download Chromium browser for PDF conversion?',
            'Yes, Download',
            'Cancel'
        );
        
        if (action === 'Yes, Download') {
            await setupPuppeteerAutomatically(context);
        } else {
            throw new Error('PDF conversion requires Chromium browser. Setup was cancelled.');
        }
    }
}

async function setupPuppeteerAutomatically(context: vscode.ExtensionContext): Promise<void> {
    try {
        vscode.window.showInformationMessage('Downloading Chromium browser...');
        
        const extensionPath = context.extensionPath;
        
        // Check if npm is available
        try {
            await execAsync('npm --version', { cwd: extensionPath });
        } catch (npmError) {
            throw new Error('npm is required but not installed. Please install npm first:\nUbuntu: sudo apt install npm\nThen reload VSCode.');
        }
        
        // Try to install Chromium via Puppeteer
        try {
            await execAsync('npx puppeteer browsers install chrome', { cwd: extensionPath });
            vscode.window.showInformationMessage('Chromium setup completed successfully!');
        } catch (chromiumError) {
            // Fallback to npm install puppeteer
            await execAsync('npm install puppeteer --no-save', { cwd: extensionPath });
            vscode.window.showInformationMessage('Puppeteer setup completed. Please try PDF conversion again.');
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Setup failed: ${error.message}`);
        throw error;
    }
}

export function deactivate() {}

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
        
        // Check if it's a Puppeteer/Chromium error
        if (error.message && error.message.includes('Could not find expected browser')) {
            const action = await vscode.window.showErrorMessage(
                'Chromium browser not found. Would you like to run Puppeteer setup?',
                'Run Setup',
                'Cancel'
            );
            
            if (action === 'Run Setup') {
                await setupPuppeteerManually(context);
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
        // Try to get the executable path to check if Chromium is available
        const executablePath = puppeteer.executablePath();
        console.log('Puppeteer executable path:', executablePath);
    } catch (error: any) {
        console.warn('Puppeteer setup check failed:', error.message);
        throw new Error('Could not find expected browser (chrome) locally. Run `npm install` to download the correct Chromium revision (1022525).');
    }
}

async function setupPuppeteerManually(context: vscode.ExtensionContext): Promise<void> {
    try {
        vscode.window.showInformationMessage('Setting up Puppeteer...');
        
        const extensionPath = context.extensionPath;
        await execAsync('npm install puppeteer --no-save', { cwd: extensionPath });
        
        vscode.window.showInformationMessage('Puppeteer setup completed. Please try PDF conversion again.');
    } catch (error: any) {
        vscode.window.showErrorMessage(`Puppeteer setup failed: ${error.message}`);
    }
}

export function deactivate() {}

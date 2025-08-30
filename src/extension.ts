import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
    console.log('Markdown Snapshot PDF extension is now active!');

    let convertToPdf = vscode.commands.registerCommand('markdownSnapshotPdf.convertToPdf', async () => {
        await convertMarkdownToPdf(context);
    });

    let convertToPdfOnePage = vscode.commands.registerCommand('markdownSnapshotPdf.convertToPdfOnePage', async () => {
        await convertMarkdownToPdf(context, true);
    });

    context.subscriptions.push(convertToPdf);
    context.subscriptions.push(convertToPdfOnePage);
}

async function convertMarkdownToPdf(context: vscode.ExtensionContext, onePage: boolean = false) {
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
    
    const filePath = document.fileName;
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, '.md');
    const outputPath = path.join(fileDir, `${fileName}.pdf`);

    try {
        vscode.window.showInformationMessage(onePage ? 'Converting to PDF (1 page)...' : 'Converting to PDF...');

        // First, try to ensure Puppeteer is properly set up
        await ensurePuppeteerSetup(context);

        // Use local md-to-pdf library
        const mdToPdf = require(path.join(context.extensionPath, 'index.js'));
        
        // Configure options for one-page PDF
        const config = onePage ? {
            dest: outputPath,
            onePage: true
        } : {
            dest: outputPath
        };
        
        const result = await mdToPdf(filePath, config);

        vscode.window.showInformationMessage(`PDF conversion completed: ${path.basename(result.filename)}`);

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
            vscode.window.showErrorMessage(`PDF conversion failed: ${error.message}`);
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

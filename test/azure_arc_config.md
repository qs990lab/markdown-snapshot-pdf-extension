## 4. Configuration de l'agent Azure Arc avec Gateway

### Configuration lors d'une nouvelle installation

#### Windows (PowerShell)

```powershell
<#
SYNOPSIS
Installation de l'agent Azure Arc avec Azure Arc Gateway et proxy
#>
$proxyUrl = "http://10.0.1.100:3128"  # Optional : Local Proxy (onPremise)

# 📥 Télécharger l'agent Arc
Write-Host "📥 Téléchargement de l'agent Azure Arc..." -ForegroundColor Yellow
$agentUrl = "https://aka.ms/AzureConnectedMachineAgent"
$installerPath = "$env:TEMP\AzureConnectedMachineAgent.msi"
Invoke-WebRequest -Uri $agentUrl -OutFile $installerPath -UseBasicParsing

# 📦 Installer l'agent Arc
Write-Host "📦 Installation de l'agent Azure Arc..." -ForegroundColor Yellow
msiexec.exe /i $installerPath /quiet /norestart

# Attendre la fin de l'installation
Start-Sleep -Seconds 30
```

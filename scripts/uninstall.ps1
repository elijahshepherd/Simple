<#
.SYNOPSIS
    Simple Programming Language - Windows Uninstaller
.DESCRIPTION
    Removes Simple Programming Language from the system
.USAGE
    irm https://raw.githubusercontent.com/elijahshepherd/Simple/main/scripts/uninstall.ps1 | iex
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$APP_NAME = "Simple Programming Language"
$GITHUB_REPO = "elijahshepherd/Simple"
$INSTALL_DIR = Join-Path $env:LOCALAPPDATA "Simple"
$BIN_DIR = Join-Path $INSTALL_DIR "bin"
$START_MENU_DIR = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Simple Programming Language"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "SUCCESS" { "Green" }
        "WARN"    { "Yellow" }
        "ERROR"   { "Red" }
        default   { "Cyan" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Confirm uninstall
Add-Type -AssemblyName System.Windows.Forms
$result = [System.Windows.Forms.MessageBox]::Show(
    "Are you sure you want to uninstall $APP_NAME?",
    "Uninstall $APP_NAME",
    [System.Windows.Forms.MessageBoxButtons]::YesNo,
    [System.Windows.Forms.MessageBoxIcon]::Question
)

if ($result -ne "Yes") {
    Write-Log "Uninstall cancelled"
    exit 0
}

# Show progress
$form = New-Object System.Windows.Forms.Form
$form.Text = "Uninstalling $APP_NAME"
$form.Size = New-Object System.Drawing.Size(400, 150)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.ControlBox = $false
$form.BackColor = [System.Drawing.Color]::White

$label = New-Object System.Windows.Forms.Label
$label.Text = "Removing $APP_NAME..."
$label.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$label.AutoSize = $true
$label.Location = New-Object System.Drawing.Point(20, 40)
$form.Controls.Add($label)

$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Style = "Marquee"
$progressBar.MarqueeAnimationSpeed = 30
$progressBar.Size = New-Object System.Drawing.Size(360, 25)
$progressBar.Location = New-Object System.Drawing.Point(20, 70)
$form.Controls.Add($progressBar)

$form.Show()
$form.Refresh()

# Remove from PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -like "*$BIN_DIR*") {
    $newPath = $currentPath -replace ";?$BIN_DIR;?", ";"
    $newPath = $newPath -replace "^;", ""
    $newPath = $newPath -replace ";$", ""
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")

    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class NativeMethods {
    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
}
"@
    [NativeMethods]::SendMessageTimeout([IntPtr]0xFFFF, 0x001A, [UIntPtr]::Zero, "Environment", 0x0002, 5000, [ref]0) | Out-Null
    Write-Log "Removed from PATH"
}

# Remove files
Remove-Item -Path $INSTALL_DIR -Recurse -Force -ErrorAction SilentlyContinue
Write-Log "Removed installation directory"

# Remove Start Menu shortcuts
Remove-Item -Path $START_MENU_DIR -Recurse -Force -ErrorAction SilentlyContinue
Write-Log "Removed Start Menu shortcuts"

# Remove registry entries
Remove-Item -Path "HKCU:\Software\Simple" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple" -Recurse -Force -ErrorAction SilentlyContinue
Write-Log "Removed registry entries"

$form.Close()
$form.Dispose()

[System.Windows.Forms.MessageBox]::Show("$APP_NAME has been uninstalled.", "Uninstall Complete",
    [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)

Write-Log "Uninstall complete!" "SUCCESS"
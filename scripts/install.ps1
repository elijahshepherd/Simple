<#
.SYNOPSIS
    Simple Programming Language - Windows One-Line Installer
.DESCRIPTION
    Downloads and installs Simple Programming Language to %LOCALAPPDATA%\Simple
    Adds to user PATH and creates Start Menu shortcuts
.USAGE
    irm https://raw.githubusercontent.com/elijahshepherd/Simple/main/scripts/install.ps1 | iex
    powershell -c "irm https://raw.githubusercontent.com/elijahshepherd/Simple/main/scripts/install.ps1 | iex"
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$APP_NAME = "Simple Programming Language"
$GITHUB_REPO = "elijahshepherd/Simple"
$VERSION = "1.5.0"
$INSTALL_DIR = Join-Path $env:LOCALAPPDATA "Simple"
$BIN_DIR = Join-Path $INSTALL_DIR "bin"
$EXAMPLES_DIR = Join-Path $INSTALL_DIR "examples"
$EXE_NAME = "simple.exe"
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

function Detect-Platform {
    Write-Log "Detecting platform..."
    $os = [System.Runtime.InteropServices.RuntimeInformation]::OSDescription
    $arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture

    if ($os -like "*Windows*") {
        $PLATFORM = "windows"
    } else {
        Write-Log "Unsupported OS: $os" "ERROR"
        exit 1
    }

    if ($arch -eq "X64") { $ARCH = "x64" }
    elseif ($arch -eq "Arm64") { $ARCH = "arm64" }
    else { $ARCH = "x64" }

    Write-Log "Platform: $PLATFORM-$ARCH"
}

function Get-LatestVersion {
    Write-Log "Fetching latest version from GitHub..."
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$GITHUB_REPO/releases/latest" -ErrorAction Stop
        $tag = $response.tag_name
        if ($tag -match '^v?(.+)$') {
            $VERSION = $matches[1]
            Write-Log "Latest version: $VERSION"
        }
    } catch {
        Write-Log "Could not fetch latest version, using fallback: $VERSION" "WARN"
    }
}

function Download-Binary {
    $url = "https://github.com/$GITHUB_REPO/releases/download/v$VERSION/simple-$PLATFORM-$ARCH.exe"
    $tempPath = Join-Path $env:TEMP "simple-$VERSION-$PLATFORM-$ARCH.exe"

    Write-Log "Downloading Simple $VERSION for $PLATFORM-$ARCH..."
    Write-Log "URL: $url"

    try {
        Invoke-WebRequest -Uri $url -OutFile $tempPath -ErrorAction Stop
        Write-Log "Download complete"
        return $tempPath
    } catch {
        Write-Log "Failed to download from $url" "ERROR"
        Write-Log "Check releases at: https://github.com/$GITHUB_REPO/releases" "ERROR"
        exit 1
    }
}

function Install-Simple {
    param([string]$BinaryPath)

    Write-Log "Installing to $BIN_DIR..."

    # Create directories
    New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
    New-Item -ItemType Directory -Path $BIN_DIR -Force | Out-Null
    New-Item -ItemType Directory -Path $EXAMPLES_DIR -Force | Out-Null
    New-Item -ItemType Directory -Path $START_MENU_DIR -Force | Out-Null

    # Copy executable
    Copy-Item -Path $BinaryPath -Destination (Join-Path $BIN_DIR $EXE_NAME) -Force
    Write-Log "Executable installed"

    # Add to user PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($currentPath -notlike "*$BIN_DIR*") {
        $newPath = "$currentPath;$BIN_DIR"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        Write-Log "Added $BIN_DIR to user PATH"

        # Broadcast environment change
        Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class NativeMethods {
    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
}
"@
        [NativeMethods]::SendMessageTimeout([IntPtr]0xFFFF, 0x001A, [UIntPtr]::Zero, "Environment", 0x0002, 5000, [ref]0) | Out-Null
    } else {
        Write-Log "Already in PATH"
    }

    # Create Start Menu shortcuts
    $shell = New-Object -ComObject WScript.Shell

    $shortcut = $shell.CreateShortcut(Join-Path $START_MENU_DIR "Simple.lnk")
    $shortcut.TargetPath = Join-Path $BIN_DIR $EXE_NAME
    $shortcut.WorkingDirectory = $BIN_DIR
    $shortcut.Description = "Simple Programming Language"
    $shortcut.Save()

    $shortcut = $shell.CreateShortcut(Join-Path $START_MENU_DIR "Uninstall.lnk")
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-ExecutionPolicy Bypass -Command `"irm https://raw.githubusercontent.com/elijahshepherd/Simple/main/scripts/uninstall.ps1 | iex`""
    $shortcut.WorkingDirectory = $INSTALL_DIR
    $shortcut.Description = "Uninstall Simple Programming Language"
    $shortcut.Save()

    $shortcut = $shell.CreateShortcut(Join-Path $START_MENU_DIR "Documentation.lnk")
    $shortcut.TargetPath = "https://github.com/$GITHUB_REPO"
    $shortcut.Description = "Simple Programming Language Documentation"
    $shortcut.Save()

    Write-Log "Start Menu shortcuts created"

    # Register uninstaller in Windows Apps & Features
    $regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple"
    New-Item -Path $regPath -Force | Out-Null
    Set-ItemProperty -Path $regPath -Name "DisplayName" -Value $APP_NAME
    Set-ItemProperty -Path $regPath -Name "DisplayVersion" -Value $VERSION
    Set-ItemProperty -Path $regPath -Name "Publisher" -Value "Elijah Shepherd"
    Set-ItemProperty -Path $regPath -Name "URLInfoAbout" -Value "https://github.com/$GITHUB_REPO"
    Set-ItemProperty -Path $regPath -Name "UninstallString" -Value "powershell.exe -ExecutionPolicy Bypass -Command `"irm https://raw.githubusercontent.com/elijahshepherd/Simple/main/scripts/uninstall.ps1 | iex`""
    Set-ItemProperty -Path $regPath -Name "NoModify" -Value 1 -Type DWord
    Set-ItemProperty -Path $regPath -Name "NoRepair" -Value 1 -Type DWord

    Write-Log "Registered in Apps & Features"
}

function Verify-Installation {
    if (Get-Command $EXE_NAME -ErrorAction SilentlyContinue) {
        Write-Log "Simple installed successfully!" "SUCCESS"
        Write-Log "Run 'simple --help' to get started"
        Write-Log "Try: simple run-example hello"
    } else {
        Write-Log "Installation complete but 'simple' not found in current session." "WARN"
        Write-Log "Open a NEW terminal window or run: \$env:PATH = [Environment]::GetEnvironmentVariable('PATH','User')" "WARN"
        Write-Log "Then try: simple --help"
    }
}

# Main
Write-Host "╔══════════════════════════════════════════════════════════════╗"
Write-Host "║     Simple Programming Language Installer v$VERSION          ║"
Write-Host "║     https://github.com/$GITHUB_REPO                        ║"
Write-Host "╚══════════════════════════════════════════════════════════════╝"
Write-Host ""

Detect-Platform
Get-LatestVersion
$binaryPath = Download-Binary
Install-Simple -BinaryPath $binaryPath
Verify-Installation

# Cleanup
Remove-Item -Path $binaryPath -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Log "Installation complete!" "SUCCESS"
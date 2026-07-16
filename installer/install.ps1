<# 
.SYNOPSIS
    Simple Programming Language - Windows Installer with GUI
.DESCRIPTION
    A self-contained PowerShell installer that shows a welcome screen,
    installs Simple to %LOCALAPPDATA%\Simple, adds to PATH, and creates shortcuts.
#>

# Prevent running in restricted environments
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Add required assemblies for Windows Forms
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Configuration
$APP_NAME = "Simple Programming Language"
$VERSION = "1.5.0"
$PUBLISHER = "Elijah Shepherd"
$GITHUB_URL = "https://github.com/elijahshepherd/Simple"
$INSTALL_DIR = Join-Path $env:LOCALAPPDATA "Simple"
$BIN_DIR = Join-Path $INSTALL_DIR "bin"
$EXAMPLES_DIR = Join-Path $INSTALL_DIR "examples"
$EXE_NAME = "simple.exe"
$UNINSTALL_EXE = "uninstall.exe"
$START_MENU_DIR = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Simple Programming Language"

# Get the directory where this script is running (for bundled exe)
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $SCRIPT_DIR) { $SCRIPT_DIR = $PSScriptRoot }
if (-not $SCRIPT_DIR) { $SCRIPT_DIR = (Get-Location).Path }

# Source files (bundled with installer)
$SOURCE_EXE = Join-Path $SCRIPT_DIR $EXE_NAME
$SOURCE_EXAMPLES = Join-Path $SCRIPT_DIR "examples"

# Check if source exe exists
if (-not (Test-Path $SOURCE_EXE)) {
    # Try to find it in the same directory as the script
    $possiblePaths = @(
        Join-Path $PSScriptRoot $EXE_NAME,
        Join-Path (Get-Location).Path $EXE_NAME,
        ".\$EXE_NAME"
    )
    foreach ($p in $possiblePaths) {
        if (Test-Path $p) {
            $SOURCE_EXE = $p
            break
        }
    }
}

# ============================================================================
# GUI FUNCTIONS
# ============================================================================

function Show-WelcomeScreen {
    param(
        [string]$Message = "Welcome to the Simple Programming Language installer!`n`nThis will install Simple v$VERSION to your computer.`n`nClick Next to continue."
    )
    
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "$APP_NAME Installer"
    $form.Size = New-Object System.Drawing.Size(500, 380)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.BackColor = [System.Drawing.Color]::White
    
    # Icon (use system icon)
    $form.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($env:SystemRoot + "\System32\shell32.dll")
    
    # Header panel
    $headerPanel = New-Object System.Windows.Forms.Panel
    $headerPanel.Dock = "Top"
    $headerPanel.Height = 80
    $headerPanel.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 215)
    
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = "$APP_NAME"
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
    $titleLabel.ForeColor = [System.Drawing.Color]::White
    $titleLabel.AutoSize = $true
    $titleLabel.Location = New-Object System.Drawing.Point(20, 15)
    
    $subtitleLabel = New-Object System.Windows.Forms.Label
    $subtitleLabel.Text = "Version $VERSION - Beginner-friendly programming language"
    $subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(200, 230, 255)
    $subtitleLabel.AutoSize = $true
    $subtitleLabel.Location = New-Object System.Drawing.Point(20, 50)
    
    $headerPanel.Controls.Add($titleLabel)
    $headerPanel.Controls.Add($subtitleLabel)
    $form.Controls.Add($headerPanel)
    
    # Content panel
    $contentPanel = New-Object System.Windows.Forms.Panel
    $contentPanel.Dock = "Fill"
    $contentPanel.Padding = New-Object System.Windows.Forms.Padding(20)
    
    $messageLabel = New-Object System.Windows.Forms.Label
    $messageLabel.Text = $Message
    $messageLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $messageLabel.ForeColor = [System.Drawing.Color]::FromArgb(51, 51, 51)
    $messageLabel.AutoSize = $false
    $messageLabel.Size = New-Object System.Drawing.Size(440, 150)
    $messageLabel.Location = New-Object System.Drawing.Point(0, 0)
    
    $featuresLabel = New-Object System.Windows.Forms.Label
    $featuresLabel.Text = "What you'll get:"
    $featuresLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $featuresLabel.ForeColor = [System.Drawing.Color]::FromArgb(0, 120, 215)
    $featuresLabel.AutoSize = $true
    $featuresLabel.Location = New-Object System.Drawing.Point(0, 160)
    
    $featuresList = New-Object System.Windows.Forms.Label
    $featuresList.Text = "✓  `simple` command available everywhere (added to PATH)`n✓  Run `.spml` files with: simple run file.spml`n✓  Built-in examples: simple run-example hello`n✓  Create new projects: simple new myproject`n✓  Colorful console output, variables, loops, functions`n✓  File I/O, random, time, math, text operations`n✓  Cross-platform: Windows, macOS, Linux"
    $featuresList.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $featuresList.ForeColor = [System.Drawing.Color]::FromArgb(68, 68, 68)
    $featuresList.AutoSize = $false
    $featuresList.Size = New-Object System.Drawing.Size(440, 130)
    $featuresList.Location = New-Object System.Drawing.Point(0, 185)
    
    $contentPanel.Controls.Add($messageLabel)
    $contentPanel.Controls.Add($featuresLabel)
    $contentPanel.Controls.Add($featuresList)
    $form.Controls.Add($contentPanel)
    
    # Footer panel
    $footerPanel = New-Object System.Windows.Forms.Panel
    $footerPanel.Dock = "Bottom"
    $footerPanel.Height = 60
    $footerPanel.BackColor = [System.Drawing.Color]::FromArgb(240, 240, 240)
    $footerPanel.BorderStyle = "FixedSingle"
    
    $nextButton = New-Object System.Windows.Forms.Button
    $nextButton.Text = "Install"
    $nextButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $nextButton.Size = New-Object System.Drawing.Size(100, 35)
    $nextButton.Location = New-Object System.Drawing.Point(370, 12)
    $nextButton.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 215)
    $nextButton.ForeColor = [System.Drawing.Color]::White
    $nextButton.FlatStyle = "Flat"
    $nextButton.FlatAppearance.BorderSize = 0
    $nextButton.Cursor = "Hand"
    $nextButton.DialogResult = "OK"
    
    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Text = "Cancel"
    $cancelButton.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $cancelButton.Size = New-Object System.Drawing.Size(100, 35)
    $cancelButton.Location = New-Object System.Drawing.Point(260, 12)
    $cancelButton.FlatStyle = "Flat"
    $cancelButton.FlatAppearance.BorderSize = 1
    $cancelButton.Cursor = "Hand"
    $cancelButton.DialogResult = "Cancel"
    
    $footerPanel.Controls.Add($nextButton)
    $footerPanel.Controls.Add($cancelButton)
    $form.Controls.Add($footerPanel)
    
    $form.AcceptButton = $nextButton
    $form.CancelButton = $cancelButton
    
    $result = $form.ShowDialog()
    return $result -eq "OK"
}

function Show-ProgressScreen {
    param(
        [string]$Status = "Installing..."
    )
    
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "$APP_NAME - Installing"
    $form.Size = New-Object System.Drawing.Size(500, 250)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.ControlBox = $false
    $form.BackColor = [System.Drawing.Color]::White
    
    # Header
    $headerPanel = New-Object System.Windows.Forms.Panel
    $headerPanel.Dock = "Top"
    $headerPanel.Height = 60
    $headerPanel.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 215)
    
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = "Installing $APP_NAME"
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $titleLabel.ForeColor = [System.Drawing.Color]::White
    $titleLabel.AutoSize = $true
    $titleLabel.Location = New-Object System.Drawing.Point(20, 15)
    $headerPanel.Controls.Add($titleLabel)
    $form.Controls.Add($headerPanel)
    
    # Progress
    $progressLabel = New-Object System.Windows.Forms.Label
    $progressLabel.Text = $Status
    $progressLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $progressLabel.ForeColor = [System.Drawing.Color]::FromArgb(51, 51, 51)
    $progressLabel.AutoSize = $false
    $progressLabel.Size = New-Object System.Drawing.Size(440, 30)
    $progressLabel.Location = New-Object System.Drawing.Point(30, 80)
    $form.Controls.Add($progressLabel)
    
    $progressBar = New-Object System.Windows.Forms.ProgressBar
    $progressBar.Style = "Marquee"
    $progressBar.MarqueeAnimationSpeed = 30
    $progressBar.Size = New-Object System.Drawing.Size(400, 25)
    $progressBar.Location = New-Object System.Drawing.Point(30, 120)
    $form.Controls.Add($progressBar)
    
    $detailLabel = New-Object System.Windows.Forms.Label
    $detailLabel.Text = "Please wait..."
    $detailLabel.Font = New-Object System.Drawing.Font("Segoe UI", 8)
    $detailLabel.ForeColor = [System.Drawing.Color]::Gray
    $detailLabel.AutoSize = $false
    $detailLabel.Size = New-Object System.Drawing.Size(440, 20)
    $detailLabel.Location = New-Object System.Drawing.Point(30, 155)
    $form.Controls.Add($detailLabel)
    
    $form.Show()
    $form.Refresh()
    
    return @{ Form = $form; Label = $progressLabel; Detail = $detailLabel }
}

function Update-ProgressScreen {
    param(
        [Parameter(Mandatory=$true)]$Screen,
        [string]$Status,
        [string]$Detail
    )
    $Screen.Label.Text = $Status
    $Screen.Detail.Text = $Detail
    $Screen.Form.Refresh()
    [System.Windows.Forms.Application]::DoEvents()
}

function Close-ProgressScreen {
    param([Parameter(Mandatory=$true)]$Screen)
    $Screen.Form.Close()
    $Screen.Form.Dispose()
}

function Show-FinishScreen {
    param(
        [string]$Message = "$APP_NAME has been successfully installed!`n`nYou can now open a new terminal and run:`n  simple run-example hello`n`nClick Finish to launch Simple and see the welcome message."
    )
    
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "$APP_NAME - Installation Complete"
    $form.Size = New-Object System.Drawing.Size(500, 380)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.BackColor = [System.Drawing.Color]::White
    
    # Header
    $headerPanel = New-Object System.Windows.Forms.Panel
    $headerPanel.Dock = "Top"
    $headerPanel.Height = 80
    $headerPanel.BackColor = [System.Drawing.Color]::FromArgb(0, 160, 80)
    
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = "✓  Installation Complete!"
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
    $titleLabel.ForeColor = [System.Drawing.Color]::White
    $titleLabel.AutoSize = $true
    $titleLabel.Location = New-Object System.Drawing.Point(20, 20)
    $headerPanel.Controls.Add($titleLabel)
    $form.Controls.Add($headerPanel)
    
    # Content
    $contentPanel = New-Object System.Windows.Forms.Panel
    $contentPanel.Dock = "Fill"
    $contentPanel.Padding = New-Object System.Windows.Forms.Padding(20)
    
    $messageLabel = New-Object System.Windows.Forms.Label
    $messageLabel.Text = $Message
    $messageLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $messageLabel.ForeColor = [System.Drawing.Color]::FromArgb(51, 51, 51)
    $messageLabel.AutoSize = $false
    $messageLabel.Size = New-Object System.Drawing.Size(440, 200)
    $messageLabel.Location = New-Object System.Drawing.Point(0, 0)
    $contentPanel.Controls.Add($messageLabel)
    $form.Controls.Add($contentPanel)
    
    # Footer
    $footerPanel = New-Object System.Windows.Forms.Panel
    $footerPanel.Dock = "Bottom"
    $footerPanel.Height = 60
    $footerPanel.BackColor = [System.Drawing.Color]::FromArgb(240, 240, 240)
    $footerPanel.BorderStyle = "FixedSingle"
    
    $launchCheck = New-Object System.Windows.Forms.CheckBox
    $launchCheck.Text = "Launch Simple now"
    $launchCheck.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $launchCheck.ForeColor = [System.Drawing.Color]::FromArgb(51, 51, 51)
    $launchCheck.AutoSize = $true
    $launchCheck.Location = New-Object System.Drawing.Point(20, 15)
    $launchCheck.Checked = $true
    $footerPanel.Controls.Add($launchCheck)
    
    $finishButton = New-Object System.Windows.Forms.Button
    $finishButton.Text = "Finish"
    $finishButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $finishButton.Size = New-Object System.Drawing.Size(100, 35)
    $finishButton.Location = New-Object System.Drawing.Point(370, 12)
    $finishButton.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 215)
    $finishButton.ForeColor = [System.Drawing.Color]::White
    $finishButton.FlatStyle = "Flat"
    $finishButton.FlatAppearance.BorderSize = 0
    $finishButton.Cursor = "Hand"
    $finishButton.DialogResult = "OK"
    $footerPanel.Controls.Add($finishButton)
    
    $form.Controls.Add($footerPanel)
    $form.AcceptButton = $finishButton
    
    $result = $form.ShowDialog()
    return @{ Launch = $launchCheck.Checked; Result = $result }
}

function Show-ErrorScreen {
    param([string]$Message)
    
    [System.Windows.Forms.MessageBox]::Show($Message, "Installation Error", 
        [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
}

# ============================================================================
# INSTALLATION FUNCTIONS
# ============================================================================

function Install-Simple {
    $progress = Show-ProgressScreen -Status "Preparing installation..."
    
    try {
        # Create directories
        Update-ProgressScreen $progress "Creating directories..." "Creating $INSTALL_DIR"
        if (-not (Test-Path $INSTALL_DIR)) { New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null }
        if (-not (Test-Path $BIN_DIR)) { New-Item -ItemType Directory -Path $BIN_DIR -Force | Out-Null }
        if (-not (Test-Path $EXAMPLES_DIR)) { New-Item -ItemType Directory -Path $EXAMPLES_DIR -Force | Out-Null }
        if (-not (Test-Path $START_MENU_DIR)) { New-Item -ItemType Directory -Path $START_MENU_DIR -Force | Out-Null }
        
        # Copy executable
        Update-ProgressScreen $progress "Installing Simple executable..." "Copying $EXE_NAME to $BIN_DIR"
        if (-not (Test-Path $SOURCE_EXE)) {
            throw "Source executable not found at: $SOURCE_EXE"
        }
        Copy-Item -Path $SOURCE_EXE -Destination (Join-Path $BIN_DIR $EXE_NAME) -Force
        
        # Copy examples
        Update-ProgressScreen $progress "Installing examples..." "Copying example programs to $EXAMPLES_DIR"
        if (Test-Path $SOURCE_EXAMPLES) {
            Copy-Item -Path (Join-Path $SOURCE_EXAMPLES "*.spml") -Destination $EXAMPLES_DIR -Force
        } else {
            # Try to find examples in common locations
            $possibleExampleDirs = @(
                Join-Path $SCRIPT_DIR "examples",
                Join-Path $PSScriptRoot "examples",
                Join-Path (Get-Location).Path "examples"
            )
            foreach ($dir in $possibleExampleDirs) {
                if (Test-Path $dir) {
                    Copy-Item -Path (Join-Path $dir "*.spml") -Destination $EXAMPLES_DIR -Force
                    break
                }
            }
        }
        
        # Create uninstaller
        Update-ProgressScreen $progress "Creating uninstaller..." "Writing uninstall script to $INSTALL_DIR"
        $uninstallScript = @"
<# 
.SYNOPSIS
    Uninstaller for Simple Programming Language
#>
`$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Windows.Forms

`$INSTALL_DIR = "$INSTALL_DIR"
`$BIN_DIR = "`$INSTALL_DIR\bin"
`$START_MENU_DIR = "$START_MENU_DIR"

# Confirm uninstall
`$result = [System.Windows.Forms.MessageBox]::Show(
    "Are you sure you want to uninstall $APP_NAME?",
    "Uninstall $APP_NAME",
    [System.Windows.Forms.MessageBoxButtons]::YesNo,
    [System.Windows.Forms.MessageBoxIcon]::Question
)

if (`$result -ne "Yes") { exit }

# Show progress
`$form = New-Object System.Windows.Forms.Form
`$form.Text = "Uninstalling $APP_NAME"
`$form.Size = New-Object System.Drawing.Size(400, 150)
``form.StartPosition = "CenterScreen"
`$form.FormBorderStyle = "FixedDialog"
`$form.ControlBox = `$false
`$form.BackColor = [System.Drawing.Color]::White

`$label = New-Object System.Windows.Forms.Label
`$label.Text = "Removing $APP_NAME..."
`$label.Font = New-Object System.Drawing.Font("Segoe UI", 10)
`$label.AutoSize = `$true
`$label.Location = New-Object System.Drawing.Point(20, 40)
`$form.Controls.Add(`$label)

`$progressBar = New-Object System.Windows.Forms.ProgressBar
`$progressBar.Style = "Marquee"
`$progressBar.MarqueeAnimationSpeed = 30
`$progressBar.Size = New-Object System.Drawing.Size(360, 25)
`$progressBar.Location = New-Object System.Drawing.Point(20, 70)
`$form.Controls.Add(`$progressBar)

`$form.Show()
`$form.Refresh()

# Remove from PATH
`$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if (`$currentPath -like "*`$BIN_DIR*") {
    `$newPath = `$currentPath -replace ";?`$BIN_DIR;?", ";"
    `$newPath = `$newPath -replace "^;", ""
    `$newPath = `$newPath -replace ";$", ""
    [Environment]::SetEnvironmentVariable("PATH", `$newPath, "User")
    # Broadcast change
    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class NativeMethods {
    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
}
"@
    [NativeMethods]::SendMessageTimeout([IntPtr]0xFFFF, 0x001A, [UIntPtr]::Zero, "Environment", 0x0002, 5000, [ref]0) | Out-Null
}

# Remove files and directories
Remove-Item -Path `$INSTALL_DIR -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path `$START_MENU_DIR -Recurse -Force -ErrorAction SilentlyContinue

# Remove registry keys
Remove-Item -Path "HKCU:\Software\Simple" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple" -Recurse -Force -ErrorAction SilentlyContinue

`$form.Close()
`$form.Dispose()

[System.Windows.Forms.MessageBox]::Show("$APP_NAME has been uninstalled.", "Uninstall Complete", 
    [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
"@
        Set-Content -Path (Join-Path $INSTALL_DIR $UNINSTALL_EXE) -Value $uninstallScript -Encoding UTF8
        
        # Add to PATH (User scope)
        Update-ProgressScreen $progress "Adding to PATH..." "Updating user PATH environment variable"
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        if ($currentPath -notlike "*$BIN_DIR*") {
            $newPath = "$currentPath;$BIN_DIR"
            [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
            
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
        }
        
        # Create Start Menu shortcuts
        Update-ProgressScreen $progress "Creating shortcuts..." "Adding Start Menu entries"
        $shell = New-Object -ComObject WScript.Shell
        
        # Main shortcut
        $shortcut = $shell.CreateShortcut(Join-Path $START_MENU_DIR "Simple.lnk")
        $shortcut.TargetPath = Join-Path $BIN_DIR $EXE_NAME
        $shortcut.WorkingDirectory = $BIN_DIR
        $shortcut.Description = "Simple Programming Language"
        $shortcut.Save()
        
        # Uninstall shortcut
        $shortcut = $shell.CreateShortcut(Join-Path $START_MENU_DIR "Uninstall.lnk")
        $shortcut.TargetPath = "powershell.exe"
        $shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$(Join-Path $INSTALL_DIR $UNINSTALL_EXE)`""
        $shortcut.WorkingDirectory = $INSTALL_DIR
        $shortcut.Description = "Uninstall Simple Programming Language"
        $shortcut.Save()
        
        # Documentation shortcut
        $shortcut = $shell.CreateShortcut(Join-Path $START_MENU_DIR "Documentation.lnk")
        $shortcut.TargetPath = $GITHUB_URL
        $shortcut.Description = "Simple Programming Language Documentation"
        $shortcut.Save()
        
        # Write registry for uninstall info
        Update-ProgressScreen $progress "Registering application..." "Writing uninstall registry keys"
        $regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple"
        New-Item -Path $regPath -Force | Out-Null
        Set-ItemProperty -Path $regPath -Name "DisplayName" -Value $APP_NAME
        Set-ItemProperty -Path $regPath -Name "DisplayVersion" -Value $VERSION
        Set-ItemProperty -Path $regPath -Name "Publisher" -Value $PUBLISHER
        Set-ItemProperty -Path $regPath -Name "URLInfoAbout" -Value $GITHUB_URL
        Set-ItemProperty -Path $regPath -Name "UninstallString" -Value "powershell.exe -ExecutionPolicy Bypass -File `"`$(Join-Path $INSTALL_DIR $UNINSTALL_EXE)`""
        Set-ItemProperty -Path $regPath -Name "NoModify" -Value 1 -Type DWord
        Set-ItemProperty -Path $regPath -Name "NoRepair" -Value 1 -Type DWord
        
        # Also write our own registry key
        $ourRegPath = "HKCU:\Software\Simple"
        New-Item -Path $ourRegPath -Force | Out-Null
        Set-ItemProperty -Path $ourRegPath -Name "InstallDir" -Value $INSTALL_DIR
        Set-ItemProperty -Path $ourRegPath -Name "Version" -Value $VERSION
        
        Close-ProgressScreen $progress
        return $true
    }
    catch {
        Close-ProgressScreen $progress
        Show-ErrorScreen "Installation failed: $_"
        return $false
    }
}

# ============================================================================
# MAIN INSTALLER LOGIC
# ============================================================================

# Check for admin (not required but good to know)
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# Show welcome screen
if (-not (Show-WelcomeScreen)) {
    exit 0
}

# Run installation
$success = Install-Simple

if ($success) {
    # Show finish screen
    $finishResult = Show-FinishScreen
    if ($finishResult.Launch) {
        # Launch Simple with a demo
        Start-Process -FilePath (Join-Path $BIN_DIR $EXE_NAME) -ArgumentList "run-example hello" -WorkingDirectory $BIN_DIR -NoNewWindow
    }
} else {
    exit 1
}

exit 0
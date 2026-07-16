; Simple Programming Language - Windows Installer
; Creates a standalone installer with welcome screen and PATH installation

!include "MUI2.nsh"
!include "LogicLib.nsh"

; Application details
Name "Simple Programming Language"
OutFile "simple-installer.exe"
InstallDir "$LOCALAPPDATA\Simple"
InstallDirRegKey HKCU "Software\Simple" ""
ShowInstDetails show
RequestExecutionLevel user

; Version
!define VERSION "1.5.0"
!define PUBLISHER "Elijah Shepherd"
!define WEBSITE "https://github.com/elijahshepherd/Simple"

; Modern UI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

; Welcome page
!insertmacro MUI_PAGE_WELCOME
; Directory page
!insertmacro MUI_PAGE_DIRECTORY
; Install page
!insertmacro MUI_PAGE_INSTFILES
; Finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\simple.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch Simple Programming Language"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Language files
!insertmacro MUI_LANGUAGE "English"

; Reserved files
ReserveFile "${NSISDIR}\Plugins\x86-ansi\System.dll"
ReserveFile "${NSISDIR}\Plugins\x86-ansi\EnvVarUpdate.nsh"

Section "MainSection" SEC01
    ; Set output path
    SetOutPath "$INSTDIR"

    ; Copy the Simple executable
    File "..\simple.exe"

    ; Create bin folder and move exe there
    CreateDirectory "$INSTDIR\bin"
    CopyFiles "$INSTDIR\simple.exe" "$INSTDIR\bin\simple.exe"
    Delete "$INSTDIR\simple.exe"

    ; Create examples folder and copy examples
    CreateDirectory "$INSTDIR\examples"
    File /r "..\examples\*.spml"

    ; Create uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"

    ; Add to PATH (user scope)
    ; Read current PATH
    System::Call 'kernel32::GetEnvironmentVariable(t "PATH", t .r0, i 8192) i.r1'
    Pop $R0
    StrCpy $R1 $R0

    ; Check if already in PATH
    StrStr $R0 "$INSTDIR\bin" "" +2 0
    StrCmp $R1 "" 0 +2
    ; Not in PATH, add it
    System::Call 'kernel32::SetEnvironmentVariable(t "PATH", t "$R0;$INSTDIR\bin")'

    ; Also update registry for persistence
    ReadRegStr $R0 HKCU "Environment" "PATH"
    StrStr $R0 "$INSTDIR\bin" "" +2 0
    StrCmp $R0 "" 0 +2
    WriteRegStr HKCU "Environment" "PATH" "$R0;$INSTDIR\bin"

    ; Notify system of environment change
    SendMessage ${HWND_BROADCAST} ${WM_SETTINGCHANGE} 0 "STR:Environment" /TIMEOUT=5000

    ; Write registry keys for uninstall info
    WriteRegStr HKCU "Software\Simple" "" "$INSTDIR"
    WriteRegStr HKCU "Software\Simple" "Version" "${VERSION}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple" "DisplayName" "Simple Programming Language"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple" "DisplayVersion" "${VERSION}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple" "Publisher" "${PUBLISHER}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple" "URLInfoAbout" "${WEBSITE}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple" "NoModify" "1"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple" "NoRepair" "1"

    ; Create Start Menu shortcuts
    CreateDirectory "$SMPROGRAMS\Simple Programming Language"
    CreateShortCut "$SMPROGRAMS\Simple Programming Language\Simple.lnk" "$INSTDIR\bin\simple.exe" "" "$INSTDIR\bin\simple.exe" 0
    CreateShortCut "$SMPROGRAMS\Simple Programming Language\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
    CreateShortCut "$SMPROGRAMS\Simple Programming Language\Documentation.lnk" "${WEBSITE}" "" "" 0

SectionEnd

Section "Uninstall"
    ; Remove PATH entry
    ReadRegStr $R0 HKCU "Environment" "PATH"
    StrReplace $R0 "$R0" "$INSTDIR\bin;" ""
    StrReplace $R0 "$R0" ";$INSTDIR\bin" ""
    StrReplace $R0 "$R0" "$INSTDIR\bin" ""
    WriteRegStr HKCU "Environment" "PATH" $R0
    SendMessage ${HWND_BROADCAST} ${WM_SETTINGCHANGE} 0 "STR:Environment" /TIMEOUT=5000

    ; Remove registry keys
    DeleteRegKey HKCU "Software\Simple"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Simple"

    ; Remove Start Menu shortcuts
    Delete "$SMPROGRAMS\Simple Programming Language\Simple.lnk"
    Delete "$SMPROGRAMS\Simple Programming Language\Uninstall.lnk"
    Delete "$SMPROGRAMS\Simple Programming Language\Documentation.lnk"
    RMDir "$SMPROGRAMS\Simple Programming Language"

    ; Remove installed files
    Delete "$INSTDIR\bin\simple.exe"
    RMDir "$INSTDIR\bin"
    Delete /r "$INSTDIR\examples"
    Delete "$INSTDIR\uninstall.exe"
    RMDir "$INSTDIR"

SectionEnd

; Custom welcome page with image
; Using default NSIS bitmap for now

; Custom finish page
Function .onInit
    ; Check if already installed
    ReadRegStr $R0 HKCU "Software\Simple" ""
    StrCmp $R0 "" 0 showAlreadyInstalled
    Goto doneCheck

    showAlreadyInstalled:
    MessageBox MB_YESNO|MB_ICONQUESTION "Simple Programming Language is already installed at:$R0$\n$\nDo you want to reinstall/upgrade?" IDYES doneCheck
    Abort

    doneCheck:
FunctionEnd

; Show welcome message on first run
Function .onGUIInit
    ; This runs when the installer GUI initializes
FunctionEnd
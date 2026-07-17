# Simple - Changelog

## Version 1.5.0 - 2026-07-16

### Added
- Standalone Windows executable - run simple directly from anywhere after installing
- Windows installer with GUI - welcome screen, automatic PATH installation, Start Menu shortcuts
- Proper language installation - works like Python/Node.js: install once, use simple command everywhere
- Built-in examples included - all examples bundled in the installer
- Uninstaller - clean removal via Windows Apps & Features
- Version updated to 1.5.0

### Improved
- Single-file executable (no Node.js runtime needed)
- Auto-installs to user PATH for immediate simple command access
- Start Menu integration with shortcuts
- Professional installer experience

### Changed
- Distribution model: from npm package to standalone installer
- Executable name: simple.exe (installed to %LOCALAPPDATA%\Simple\bin\)
- Examples now bundled with installer at %LOCALAPPDATA%\Simple\examples\

### Fixed
- No longer requires Node.js installation
- Works on clean Windows machines without any dependencies

## Version 1.0.0 - 2026-07-16

### Added
- Init: Simple language interpreter with natural English syntax
- Added token lexer for multi-word keywords (greater than or equal, less than or equal)
- Added parser with precedence climbing for expressions
- Added interpreter with list/dict/array property access (.contains, .indexOf, .length)
- Added GitHub release automation for Windows binary downloads
- Added .github/workflows/release.yml for automatic releases

### Improved
- List/dict property access performance (.contains, .indexOf, .length)

### Changed
- Multi-word keyword syntax (greater than or equal, less than or equal)

### Fixed
- Parser comparison operators
- Negative column value errors

### Removed
- None
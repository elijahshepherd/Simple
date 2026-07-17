#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const releaseDir = 'docs/release';
const files = fs.readdirSync('docs/release')
  .filter(f => f.endsWith('.md'))
  .sort((a, b) => {
    const va = a.replace('.md', '').split('.').map(Number);
    const vb = b.replace('.md', '').split('.').map(Number);
    for (let i = 0; i < Math.max(va.length, vb.length); i++) {
      const na = va[i] || 0;
      const nb = vb[i] || 0;
      if (na !== nb) return nb - na;
    }
    return 0;
  });

let allVersions = [];

for (const file of files) {
  const content = fs.readFileSync(path.join('docs/release', file), 'utf8');
  const version = file.replace('.md', '');

  const dateMatch = content.match(/Date:\s*([^\n]+)/i);
  const date = dateMatch ? dateMatch[1].trim() : '';

  const sections = [];
  const lines = content.split('\n');
  let currentSection = '';
  let currentItems = [];

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      if (currentSection || currentItems.length) {
        sections.push({ title: currentSection, items: currentItems });
      }
      currentSection = sectionMatch[1];
      currentItems = [];
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      currentItems.push(line.substring(2).trim());
    }
  }
  if (currentSection || currentItems.length) {
    sections.push({ title: currentSection, items: currentItems });
  }

  allVersions.push({ version, date, sections });
}

// Generate HTML
let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple - Installation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #fafafa;
      --fg: #1a1a1a;
      --fg-muted: #666;
      --fg-subtle: #888;
      --card-bg: #fff;
      --border: #e5e5e5;
      --shadow: rgba(0,0,0,0.04);
      --accent: #1a1a1a;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0a0a0a;
        --fg: #fafafa;
        --fg-muted: #aaa;
        --fg-subtle: #666;
        --card-bg: #141414;
        --border: #2a2a2a;
        --shadow: rgba(0,0,0,0.3);
        --accent: #fafafa;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--bg);
      color: var(--fg);
      line-height: 1.6;
      min-height: 100vh;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    /* Warning banner */
    .warning {
      background: var(--accent);
      color: var(--bg);
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 32px;
      text-align: center;
    }
    .warning h2 { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
    .warning p { font-size: 0.95rem; opacity: 0.9; max-width: 700px; margin: 0 auto; }
    .warning code { background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; }
    .warning .btn {
      display: inline-block;
      margin-top: 16px;
      background: var(--bg);
      color: var(--accent);
      padding: 14px 32px;
      border-radius: 100px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      transition: transform 0.15s, box-shadow 0.15s;
      border: none;
      cursor: pointer;
    }
    .warning .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,255,255,0.3); }
    
    header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 2.5rem; margin-bottom: 8px; }
    h1 { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; }
    .subtitle { color: var(--fg-muted); font-size: 1.1rem; font-weight: 400; }
    
    /* Platform install methods */
    .platforms {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin: 32px 0 40px;
    }
    .platform-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
      cursor: pointer;
    }
    .platform-card:hover { 
      border-color: var(--fg-muted); 
      box-shadow: 0 8px 32px var(--shadow);
      transform: translateY(-2px);
    }
    .platform-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }
    .platform-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .platform-icon svg { width: 28px; height: 28px; fill: var(--bg); }
    .platform-name { font-size: 1.25rem; font-weight: 700; }
    .platform-desc { color: var(--fg-muted); font-size: 0.9rem; margin-bottom: 20px; }
    
    .install-section {
      border-top: 1px solid var(--border);
      padding-top: 16px;
    }
    .install-label { font-size: 0.75rem; text-transform: ; letter-spacing: 0.08em; color: var(--fg-subtle); margin-bottom: 8px; }
    .code-block {
      position: relative;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 12px;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 0.85rem;
      overflow-x: auto;
    }
    .code-block code { color: var(--fg); font-family: inherit; }
    .copy-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--accent);
      color: var(--bg);
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 600;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .code-block:hover .copy-btn { opacity: 1; }
    .copy-btn.copied { background: #10b981; opacity: 1; }
    
    .uninstall-label { font-size: 0.75rem; text-transform: ; letter-spacing: 0.08em; color: var(--fg-subtle); margin: 16px 0 8px; }
    
    footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      text-align: center;
      color: var(--fg-subtle);
      font-size: 0.85rem;
    }
    footer a { color: var(--fg-muted); text-decoration: none; }
    footer a:hover { text-decoration: underline; }
    
    .download-btn {
      display: inline-block;
      background: var(--accent);
      color: var(--bg);
      padding: 14px 28px;
      border-radius: 100px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      transition: transform 0.15s, box-shadow 0.15s;
      border: none;
      cursor: pointer;
    }
    .warning .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,255,255,0.3); }
    
    .download-section { text-align: center; margin: 24px 0 40px; }
    
    @media (max-width: 600px) {
      .container { padding: 24px 16px; }
      h1 { font-size: 1.8rem; }
      .version-header { flex-direction: column; align-items: flex-start; gap: 4px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Warning banner -->
    <div class="warning">
      <h2>Important: Standalone Windows Executable</h2>
      <p>Simple is a <strong>standalone Windows executable</strong> that installs itself. No Node.js, Python, or any runtime required.
      <p>Download <code>simple.exe</code>, run it, click <strong>Install</strong>, then open a <strong>new terminal</strong> to use <code>simple</code> commands.
      <a href="simple.exe" class="btn" download>Download simple.exe</a>
    </div>
    
    <header>
      <div class="logo">Simple</div>
      <h1>Installation</h1>
      <p class="subtitle">Install Simple on your platform</p>
    </header>
    
    <!-- Platform install methods -->
    <div class="platforms">
      <!-- Windows -->
      <article class="platform-card">
        <div class="platform-header">
          <div class="platform-name">Windows</div>
          <div class="platform-desc">Standalone installer with auto PATH setup</div>
        </div>
        <div class="install-section">
          <div class="install-label">Install</div>
          <div class="code-block">
            <button class="copy-btn" onclick="copy(this, 'irm https://elijahshepherd.github.io/Simple/simple.exe -OutFile simple.exe; .\\simple.exe')">Copy</button>
            <code>irm https://elijahshepherd.github.io/Simple/simple.exe -OutFile simple.exe; .\\simple.exe</code>
          </div>
          <div class="uninstall-label">Uninstall</div>
          <div class="code-block">
            <button class="copy-btn" onclick="copy(this, 'rm -r ~\\AppData\\Local\\Simple; [Environment]::SetEnvironmentVariable(\"PATH\", ($env:PATH -replace \";?\" + [Environment]::GetFolderPath(\"LocalApplicationData\") + \"\\\\Simple\\\\bin\") -replace \";$\", \"\"), \"User\")')">Copy</button>
            <code>rm -r ~\\AppData\\Local\\Simple; [Environment]::SetEnvironmentVariable("PATH", ($env:PATH -replace ";?" + [Environment]::GetFolderPath("LocalApplicationData") + "\\\\Simple\\\\bin") -replace ";$\", ""), "User")</code>
          </div>
        </div>
      </article>
      
      <!-- Linux -->
      <article class="platform-card">
        <div class="platform-header">
          <div class="platform-name">Linux</div>
          <div class="platform-desc">Native binary via curl</div>
        </div>
        <div class="install-section">
          <div class="install-label">Install</div>
          <div class="code-block">
            <button class="copy-btn" onclick="copy(this, 'curl -fsSL https://elijahshepherd.github.io/Simple/simple-linux -o simple && chmod +x simple && sudo mv simple /usr/local/bin/')">Copy</button>
            <code>curl -fsSL https://elijahshepherd.github.io/Simple/simple-linux -o simple && chmod +x simple && sudo mv simple /usr/local/bin/</code>
          </div>
          <div class="uninstall-label">Uninstall</div>
          <div class="code-block">
            <button class="copy-btn" onclick="copy(this, 'sudo rm /usr/local/bin/simple')">Copy</button>
            <code>sudo rm /usr/local/bin/simple</code>
          </div>
        </div>
      </article>

      <!-- macOS -->
      <article class="platform-card">
        <div class="platform-header">
          <div class="platform-name">macOS</div>
          <div class="platform-desc">Native binary via Homebrew</div>
        </div>
        <div class="install-section">
          <div class="install-label">Install</div>
          <div class="code-block">
            <button class="copy-btn" onclick="copy(this, 'brew install elijahshepherd/simple/simple')">Copy</button>
            <code>brew install elijahshepherd/simple/simple</code>
          </div>
          <div class="uninstall-label">Uninstall</div>
          <div class="code-block">
            <button class="copy-btn" onclick="copy(this, 'brew uninstall simple')">Copy</button>
            <code>brew uninstall simple</code>
          </div>
        </div>
      </article>
    </div>

    <header>
      <div class="logo">Simple</div>
      <h1>Simple</h1>
      <p class="subtitle">Version <span id="version-display">1.5.0</span></p>
    </header>
    
    <div class="version-grid">
      <article class="version-card">
        <div class="version-header">
          <span class="version-tag">Version</span>
          <span class="version-date">Current</span>
        </div>
        <div class="version-content">
          <h3>Built-in commands</h3>
          <ul>
            <li><code>simple version</code> - Show version</li>
            <li><code>simple update</code> - Check for updates</li>
            <li><code>simple uninstall</code> - Uninstall Simple</li>
          </ul>
        </div>
      </article>
    </div>

    <footer>
      <p>Simple Programming Language · <a href="https://github.com/elijahshepherd/Simple" target="_blank" rel="noopener">GitHub</a> · <a href="https://github.com/elijahshepherd/Simple/issues" target="_blank" rel="noopener">Issues</a></p>
    </footer>
  </div>
  
  <script>
    // Version display
    document.getElementById('version-display').textContent = '1.5.0';
    
    function copy(btn, text) {
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    }
  </script>
</body>
</html>`;

            fs.writeFileSync('public/index.html', html);
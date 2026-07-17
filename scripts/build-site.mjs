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
  <title>Simple - Changelog</title>
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
    
    /* Platform cards */
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
    .install-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-subtle); margin-bottom: 8px; }
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
    
    .uninstall-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-subtle); margin: 16px 0 8px; }
    
    /* Version cards */
    .version-grid { display: flex; flex-direction: column; gap: 16px; }
    .version-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .version-card:hover { border-color: var(--fg-muted); box-shadow: 0 4px 24px var(--shadow); }
    
    .version-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .version-tag {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--fg);
    }
    .version-date { color: var(--fg-subtle); font-size: 0.9rem; }
    
    .version-content h3 {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--fg-subtle);
      margin: 20px 0 8px;
      font-weight: 600;
    }
    .version-content h3:first-child { margin-top: 0; }
    .version-content ul { list-style: none; padding: 0; }
    .version-content li {
      position: relative;
      padding-left: 20px;
      margin: 6px 0;
      color: var(--fg);
      font-size: 0.95rem;
    }
    .version-content li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.55em;
      width: 6px;
      height: 6px;
      background: var(--accent);
      border-radius: 50%;
    }
    .version-content code {
      font-family: 'SF Mono', 'Fira Code', monospace;
      background: var(--border);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    
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
    .download-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px var(--shadow); }
    
    .download-section { text-align: center; margin: 24px 0 40px; }
    
    @media (max-width: 600px) {
      .container { padding: 24px 16px; }
      h1 { font-size: 1.8rem; }
      .platforms { grid-template-columns: 1fr; }
      .version-header { flex-direction: column; align-items: flex-start; gap: 4px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Warning banner -->
    <div class="warning">
      <h2>⚠️ Important: Standalone Windows Executable</h2>
      <p>Simple is a <strong>standalone Windows executable</strong> that installs itself. No Node.js, Python, or any runtime required.
      <p>Download <code>simple.exe</code>, run it, click <strong>Install</strong>, then open a <strong>new terminal</strong> to use <code>simple</code> commands.
      <a href="simple.exe" class="btn" download>Download simple.exe</a>
    </div>
    
    <header>
      <div class="logo">Simple</div>
      <h1>Changelog</h1>
      <p class="subtitle">All versions and changes</p>
    </header>
    
    <!-- Platform install cards -->
    <div class="platforms">
      <!-- Windows -->
      <article class="platform-card" data-platform="windows">
        <div class="platform-header">
          <div class="platform-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"><title>windows</title><path fill="currentColor" d="M6.555 1.375L0 2.237v5.45h6.555zM0 13.795l6.555.933V8.313H0zm7.278-5.4l.026 6.378L16 16V8.395zM16 0L7.33 1.244v6.414H16z"/></svg>
          </div>
          <div>
            <div class="platform-name">Windows</div>
            <div class="platform-desc">Standalone installer with auto PATH setup</div>
          </div>
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
      <article class="platform-card" data-platform="linux">
        <div class="platform-header">
          <div class="platform-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 128 128" fill="currentColor"><title>linux</title><path fill="currentColor" fill-rule="evenodd" d="M113.823 104.595c-1.795-1.478-3.629-2.921-5.308-4.525c-1.87-1.785-3.045-3.944-2.789-6.678c.147-1.573-.216-2.926-2.113-3.452c.446-1.154.864-1.928 1.033-2.753c.188-.92.178-1.887.204-2.834c.264-9.96-3.334-18.691-8.663-26.835c-2.454-3.748-5.017-7.429-7.633-11.066c-4.092-5.688-5.559-12.078-5.633-18.981a47.6 47.6 0 0 0-1.081-9.475C80.527 11.956 77.291 7.233 71.422 4.7c-4.497-1.942-9.152-2.327-13.901-1.084c-6.901 1.805-11.074 6.934-10.996 14.088c.074 6.885.417 13.779.922 20.648c.288 3.893-.312 7.252-2.895 10.34c-2.484 2.969-4.706 6.172-6.858 9.397c-1.229 1.844-2.317 3.853-3.077 5.931c-2.07 5.663-3.973 11.373-7.276 16.5c-1.224 1.9-1.363 4.026-.494 6.199c.225.563.363 1.429.089 1.882c-2.354 3.907-5.011 7.345-10.066 8.095c-3.976.591-4.172 1.314-4.051 5.413c.1 3.337.061 6.705-.28 10.021c-.363 3.555.008 4.521 3.442 5.373c7.924 1.968 15.913 3.647 23.492 6.854c3.227 1.365 6.465.891 9.064-1.763c2.713-2.771 6.141-3.855 9.844-3.859c6.285-.005 12.572.298 18.86.369c1.702.02 2.679.653 3.364 2.199c.84 1.893 2.26 3.284 4.445 3.526c4.193.462 8.013-.16 11.19-3.359c3.918-3.948 8.436-7.066 13.615-9.227c1.482-.619 2.878-1.592 4.103-2.648c2.231-1.922 2.113-3.146-.135-5M62.426 24.12c.758-2.601 2.537-4.289 5.243-4.801c2.276-.43 4.203.688 5.639 3.246c1.546 2.758 2.054 5.64.734 8.658c-1.083 2.474-1.591 2.707-4.123 1.868c-.474-.157-.937-.343-1.777-.652c.708-.594 1.154-1.035 1.664-1.382c1.134-.772 1.452-1.858 1.346-3.148c-.139-1.694-1.471-3.194-2.837-3.175c-1.225.017-2.262 1.167-2.4 2.915c-.086 1.089.095 2.199.173 3.589c-3.446-1.023-4.711-3.525-3.662-7.118m-12.75-2.251c1.274-1.928 3.197-2.314 5.101-1.024c2.029 1.376 3.547 5.256 2.763 7.576c-.285.844-1.127 1.5-1.716 2.241l-.604-.374c-.23-1.253-.276-2.585-.757-3.733c-.304-.728-1.257-1.184-1.919-1.762c-.622.739-1.693 1.443-1.757 2.228c-.088 1.084.477 2.28.969 3.331c.311.661 1.001 1.145 1.713 1.916l-1.922 1.51c-3.018-2.7-3.915-8.82-1.871-11.909M87.34 86.075c-.203 2.604-.5 2.713-3.118 3.098c-1.859.272-2.359.756-2.453 2.964a102 102 0 0 0-.012 7.753c.061 1.77-.537 3.158-1.755 4.393c-6.764 6.856-14.845 10.105-24.512 8.926c-4.17-.509-6.896-3.047-9.097-6.639c.98-.363 1.705-.607 2.412-.894c3.122-1.27 3.706-3.955 1.213-6.277c-1.884-1.757-3.986-3.283-6.007-4.892c-1.954-1.555-3.934-3.078-5.891-4.629c-1.668-1.323-2.305-3.028-2.345-5.188c-.094-5.182.972-10.03 3.138-14.747c1.932-4.209 3.429-8.617 5.239-12.885c.935-2.202 1.906-4.455 3.278-6.388c1.319-1.854 2.134-3.669 1.988-5.94c-.084-1.276-.016-2.562-.016-3.843l.707-.352c1.141.985 2.302 1.949 3.423 2.959c4.045 3.646 7.892 3.813 12.319.67c1.888-1.341 3.93-2.47 5.927-3.652c.497-.294 1.092-.423 1.934-.738c2.151 5.066 4.262 10.033 6.375 15c1.072 2.524 1.932 5.167 3.264 7.547c2.671 4.775 4.092 9.813 4.07 15.272c-.012 2.83.137 5.67-.081 8.482" clip-rule="evenodd"/></svg>
          </div>
          <div>
            <div class="platform-name">Linux</div>
            <div class="platform-desc">Native binary via curl</div>
          </div>
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
      <article class="platform-card" data-platform="macos">
        <div class="platform-header">
          <div class="platform-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 26 26" fill="currentColor"><title>macos</title><path fill="currentColor" d="M23.934 18.947c-.598 1.324-.884 1.916-1.652 3.086c-1.073 1.634-2.588 3.673-4.461 3.687c-1.666.014-2.096-1.087-4.357-1.069c-2.261.011-2.732 1.089-4.4 1.072c-1.873-.017-3.307-1.854-4.381-3.485c-3.003-4.575-3.32-9.937-1.464-12.79C4.532 7.425 6.61 6.237 8.561 6.237c1.987 0 3.236 1.092 4.879 1.092c1.594 0 2.565-1.095 4.863-1.095c1.738 0 3.576.947 4.889 2.581c-4.296 2.354-3.598 8.49.742 10.132M16.559 4.408c.836-1.073 1.47-2.587 1.24-4.131c-1.364.093-2.959.964-3.891 2.092c-.844 1.027-1.544 2.553-1.271 4.029c1.488.048 3.028-.839 3.922-1.99"/></svg>
          </div>
          <div>
            <div class="platform-name">macOS</div>
            <div class="platform-desc">Native binary via Homebrew</div>
          </div>
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
      <h1>Changelog</h1>
      <p class="subtitle">All versions and changes</p>
    </header>
    
    <div class="version-grid">`;

            for (const v of allVersions) {
              html += `    <article class="version-card">
      <div class="version-header">
        <span class="version-tag">v${v.version}</span>
        <span class="version-date">${v.date}</span>
      </div>
      <div class="version-content">`;

              for (const section of v.sections) {
                if (section.title) {
                  html += `<h3>${section.title}</h3>`;
                }
                if (section.items.length) {
                  html += '<ul>';
                  for (const item of section.items) {
                    const itemHtml = item.replace(/`([^`]+)`/g, '<code>$1</code>');
                    html += `<li>${itemHtml}</li>`;
                  }
                  html += '</ul>';
                }
              }

              html += `      </div>
    </article>`;
            }

            html += `    </div>
    <footer>
      <p>Simple Programming Language · <a href="https://github.com/elijahshepherd/Simple" target="_blank" rel="noopener">GitHub</a> · <a href="https://github.com/elijahshepherd/Simple/issues" target="_blank" rel="noopener">Issues</a></p>
    </footer>
  </div>
  
  <script>
    function copy(btn, text) {
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
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
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<section id="center">
  <div style="display:flex;flex-direction:column;gap:12px;place-items:center;">
    <div style="font-size:64px;line-height:1;">◉</div>
    <h1>null-agent</h1>
    <p style="max-width:520px;">
      Your coding assistant — now proactive. Multi-provider LLM support, 49 built-in tools,
      user model, calendar integration, privacy mode, and developer accountability.
    </p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:8px;">
      <code style="font-size:14px;">npm install -g null-agent</code>
      <code style="font-size:14px;">null-agent</code>
    </div>
  </div>
</section>

<div class="ticks"></div>

<section id="features">
  <div class="feature-card">
    <h2>🔔 Proactive Engine</h2>
    <p>
      Watches your environment and reaches out before you ask. Calendar events,
      git conflicts, file changes — classified and delivered with the right urgency.
    </p>
    <pre><code>calendar:upcoming → confirm tier (15-min warning)
calendar:started  → auto tier (brief heads-up)
git:conflict      → auto tier (agent steered)</code></pre>
  </div>
  <div class="feature-card">
    <h2>👤 User Model</h2>
    <p>
      Builds a persistent model of who you are — expertise, preferences,
      communication style, active goals, and learned corrections.
    </p>
    <pre><code>/correction add package manager | prefers pnpm</code></pre>
  </div>
  <div class="feature-card">
    <h2>🛡️ Privacy Mode</h2>
    <p>
      Toggle privacy to redact all personal data from the LLM's view.
      Your habits and history stay local. Takes effect immediately.
    </p>
    <pre><code>/config privacy on</code></pre>
  </div>
  <div class="feature-card">
    <h2>🎯 Accountability</h2>
    <p>
      Track goals, monitor activity patterns, generate daily/weekly reports.
      A developer day tracker that keeps you accountable.
    </p>
    <pre><code>/goals        /report        /track coding</code></pre>
  </div>
  <div class="feature-card">
    <h2>🛠️ 49 Built-in Tools</h2>
    <p>
      File, shell, git, code review, testing, web search, process management,
      terminal sessions, and more. All with safety features.
    </p>
    <pre><code>file_read  shell  git_status  web_search  process_start</code></pre>
  </div>
  <div class="feature-card">
    <h2>🖥️ Four Interfaces</h2>
    <p>
      Terminal UI with Ink, readline REPL, HTTP API server, or one-shot CLI.
      Your choice of interface for every situation.
    </p>
    <pre><code>null-agent          null-agent --plain
null-agent --server null-agent "explain this"</code></pre>
  </div>
</section>

<div class="ticks"></div>

<section id="next-steps">
  <div id="docs">
    <h2>Documentation</h2>
    <p>Your questions, answered</p>
    <ul>
      <li>
        <a href="https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/null-agent" target="_blank">
          <svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>
          GitHub
        </a>
      </li>
      <li>
        <a href="https://www.npmjs.com/package/null-agent" target="_blank">
          <svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#npm-icon"></use></svg>
          npm
        </a>
      </li>
    </ul>
  </div>
  <div id="social">
    <h2>Connect</h2>
    <p>Get help and share feedback</p>
    <ul>
      <li>
        <a href="https://github.com/vantolbennett/vantolbennett-blog/issues" target="_blank">
          <svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>
          Issues
        </a>
      </li>
      <li>
        <a href="https://github.com/vantolbennett/vantolbennett-blog/discussions" target="_blank">
          <svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>
          Discussions
        </a>
      </li>
    </ul>
  </div>
</section>

<div class="ticks"></div>
<section id="spacer"></section>
`;

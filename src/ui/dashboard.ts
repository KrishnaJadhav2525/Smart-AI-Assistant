import * as path from 'node:path';

export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart AI Assistant — Autonomous Web Operator</title>
  <link rel="icon" type="image/png" href="/logo.png">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          colors: {
            gpt: {
              dark: '#0d0d0e',
              darker: '#080809',
              card: '#141416',
              cardHover: '#1c1c20',
              border: 'rgba(255, 255, 255, 0.08)',
              text: '#ededed',
              muted: '#8e8e93',
              accent: '#ffffff',
              accentHover: '#f4f4f5',
            },
            light: {
              bg: '#FFFFFF',
              sidebar: '#F8FAFC',
              card: '#FFFFFF',
              cardHover: '#F1F5F9',
              border: '#E2E8F0',
              text: '#0F172A',
              muted: '#64748B',
            }
          }
        }
      }
    }
  </script>
  <style>
    :root {
      --bg-primary: #212121;
      --bg-tertiary: #414141;
      --bg-status-success: #1F4E25;
      --theme-blue-text-on-background: #2C67C5;
      --bg-secondary: #E8E8E8;
      --theme-purple-background: #EDE5FC;
      --bg-status-success-light: #DEF3E5;
      --theme-blue-text-on-background-light: #E8F3FE;
      --bg-tertiary-light: #F3F3F3;
      --bg-secondary-surface: #F9F9F9;
      --text-tertiary: #5D5D5D;
      --theme-purple-text: #A67DF2;
      --text-secondary: #CDCDCD;
      --color-green-700: #2C6732;
      --theme-purple-accent: #7849D1;
      --color-green-600: #3A843F;
      --accent-default: #8F8F8F;
      --accent-muted: #AFAFAF;
      --color-coral: #FF6764;
      --color-black-pure: #000000;
      --color-4: #1F4E94;
      --color-20: #FFFFFF;
      --radius-sm: 0px 10px 10px 0px;
      --radius-md: 26843500px;
      --radius-lg: 8px;
      --radius-xl: 10px;
      --radius-full: 16px;
      --radius-6: 28px;
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.2); border-radius: 9999px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(150, 150, 150, 0.35); }

    html.dark { color-scheme: dark; background-color: #0d0d0e !important; color: #ededed !important; }
    html.dark body { background-color: #0d0d0e !important; color: #ededed !important; }

    html.dark aside, html.dark #sidebar { background-color: #080809 !important; border-color: rgba(255, 255, 255, 0.07) !important; }
    html.dark header { background-color: rgba(13, 13, 14, 0.85) !important; border-color: rgba(255, 255, 255, 0.07) !important; }
    html.dark #chatPane { background-color: #0d0d0e !important; border-color: rgba(255, 255, 255, 0.07) !important; }
    html.dark #browserPane { background-color: #09090b !important; border-color: rgba(255, 255, 255, 0.07) !important; }

    /* Exclude view-btn and canvas-tab from blanket dark background overrides so active states stand out */
    html.dark .bg-light-card:not(.view-btn):not(.canvas-tab),
    html.dark .bg-light-bg:not(.view-btn):not(.canvas-tab),
    html.dark [class*="dark:bg-gpt-card"]:not(.view-btn):not(.canvas-tab) {
      background-color: #141416 !important; border-color: rgba(255, 255, 255, 0.07) !important;
    }
    html.dark h1, html.dark h2, html.dark h3, html.dark strong, html.dark .font-semibold { color: #fafafa !important; }
    html.dark [class*="text-light-muted"], html.dark [class*="dark:text-gpt-muted"] { color: #88888e !important; }
    html.dark [class*="border-light-border"], html.dark [class*="dark:border-gpt-border"] { border-color: rgba(255, 255, 255, 0.07) !important; }

    /* Crisp Light and Dark styling for step output & strategy */
    .step-desc-full {
      font-size: 0.82rem;
      line-height: 1.65;
      white-space: pre-wrap;
      word-break: break-word;
      background: #f8fafc;
      color: #0f172a;
      padding: 12px 16px;
      border-radius: 12px;
      margin-top: 6px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    html.dark .step-desc-full {
      background: rgba(255, 255, 255, 0.04) !important;
      color: #f1f5f9 !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      box-shadow: none;
    }

    .learn-badge {
      background: linear-gradient(135deg, #6366f1, #06b6d4);
      color: #ffffff;
      padding: 3px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 10px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      box-shadow: 0 2px 4px rgba(99, 102, 241, 0.25);
    }

    /* Active view mode button styling in light and dark (black screen) */
    .view-btn.active {
      background-color: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid #cbd5e1 !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
    }
    html.dark .view-btn.active {
      background-color: rgba(16, 185, 129, 0.2) !important;
      color: #34d399 !important;
      border: 1px solid rgba(16, 185, 129, 0.45) !important;
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.28) !important;
    }

    /* Active canvas tab styling */
    .canvas-tab.active {
      background-color: #ffffff !important;
      color: #0f172a !important;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06) !important;
    }
    html.dark .canvas-tab.active {
      background-color: #27272a !important;
      color: #34d399 !important;
      border: 1px solid rgba(16, 185, 129, 0.3) !important;
    }

    /* Smooth animated transitions between View Modes */
    #chatPane, #browserPane {
      transition: flex-basis 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-in-out;
    }
  </style>
</head>
<body class="bg-light-bg dark:bg-gpt-dark text-light-text dark:text-gpt-text font-sans antialiased h-screen overflow-hidden flex transition-colors duration-200">

  <!-- SIDEBAR -->
  <aside id="sidebar" class="w-64 flex-shrink-0 bg-light-sidebar dark:bg-gpt-darker border-r border-light-border dark:border-gpt-border flex flex-col justify-between transition-all duration-300 z-30 select-none">
    <div class="p-3 flex flex-col gap-2">
      <div class="flex items-center justify-between px-2 py-1.5">
        <div class="flex items-center gap-2.5">
          <img src="/logo.png" alt="Smart AI Assistant Logo" class="w-8 h-8 rounded-xl object-cover shadow-sm ring-1 ring-emerald-500/25 flex-shrink-0">
          <div>
            <div class="font-semibold text-sm tracking-tight flex items-center gap-1.5">
              Smart AI Assistant
              <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400">AI</span>
            </div>
            <div class="text-[11px] text-light-muted dark:text-gpt-muted">Autonomous Operator</div>
          </div>
        </div>
        <button type="button" id="collapseSidebarBtn" onclick="window.toggleSidebar(false)" class="p-1.5 rounded-lg text-light-muted dark:text-gpt-muted hover:bg-light-card dark:hover:bg-gpt-card transition-colors cursor-pointer" title="Close sidebar">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
        </button>
      </div>

      <button type="button" id="newTaskBtn" onclick="window.prepareNewTask()" class="mt-2 w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-light-border dark:border-gpt-border bg-light-bg dark:bg-gpt-card hover:bg-light-card dark:hover:bg-gpt-cardHover text-sm font-medium transition-all shadow-sm group cursor-pointer">
        <div class="flex items-center gap-2.5">
          <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>New Browsing Task</span>
        </div>
        <span class="text-[10px] font-mono text-light-muted dark:text-gpt-muted px-1.5 py-0.5 rounded bg-light-card dark:bg-gpt-darker border border-light-border dark:border-gpt-border">⌘K</span>
      </button>
    </div>

    <!-- History List -->
    <div class="flex-1 overflow-y-auto px-2 py-1 space-y-4 text-xs">
      <div>
        <div class="px-3 py-1.5 font-semibold text-[11px] text-light-muted dark:text-gpt-muted uppercase tracking-wider">Recent Tasks</div>
        <div class="space-y-0.5" id="historyList">
          <button type="button" onclick="window.fillChip('search for tickets from chennai to vellore', 'https://www.google.com')" class="history-item cursor-pointer w-full flex items-center justify-between px-3 py-2 rounded-lg text-left bg-light-card/80 dark:bg-gpt-card font-medium text-emerald-600 dark:text-emerald-400 group">
            <div class="flex items-center gap-2 truncate">
              <span class="text-xs">🚌</span>
              <span class="truncate">Chennai to Vellore Bus Tickets</span>
            </div>
            <span class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
          </button>
          <button type="button" onclick="window.fillChip('Search Wikipedia for quantum computing and summarize key concepts', 'https://en.wikipedia.org/wiki/Quantum_computing')" class="history-item cursor-pointer w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-light-muted dark:text-gpt-muted hover:bg-light-card dark:hover:bg-gpt-card hover:text-light-text dark:hover:text-gpt-text transition-colors">
            <div class="flex items-center gap-2 truncate">
              <span class="text-xs">🔬</span>
              <span class="truncate">Wikipedia Quantum Computing</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Status Footer -->
    <div class="p-3 border-t border-light-border dark:border-gpt-border space-y-2">
      <div class="px-3 py-2 rounded-xl bg-light-card dark:bg-gpt-card flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs">
          <span id="agentStatusPulse" class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span id="agentStatusLabel" class="font-medium">Ready</span>
        </div>
        <span class="text-[11px] font-mono text-light-muted dark:text-gpt-muted">Web-v2</span>
      </div>

      <!-- User Profile Card in Sidebar -->
      <div id="sidebarUserCard" onclick="window.openSettingsModal()" class="px-3 py-2 rounded-xl bg-light-card/60 dark:bg-gpt-card/60 hover:bg-light-card dark:hover:bg-gpt-card cursor-pointer border border-light-border dark:border-gpt-border flex items-center justify-between transition-colors group">
        <div class="flex items-center gap-2.5 truncate">
          <div id="sidebarUserAvatar" class="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">K</div>
          <div class="truncate text-left">
            <div id="sidebarUserName" class="font-semibold text-xs truncate">Krishna</div>
            <div id="sidebarUserEmail" class="text-[10px] text-light-muted dark:text-gpt-muted truncate">krishna@example.com</div>
          </div>
        </div>
        <span class="text-xs text-light-muted dark:text-gpt-muted group-hover:text-light-text dark:group-hover:text-gpt-text" title="User Settings">⚙️</span>
      </div>
    </div>
  </aside>

  <!-- MAIN AREA -->
  <main class="flex-1 flex flex-col h-full overflow-hidden min-w-0">
    <!-- Header -->
    <header class="h-14 flex-shrink-0 border-b border-light-border dark:border-gpt-border px-4 flex items-center justify-between bg-light-bg/80 dark:bg-gpt-dark/80 backdrop-blur-md z-20">
      <div class="flex items-center gap-3">
        <button type="button" id="expandSidebarBtn" onclick="window.toggleSidebar(true)" class="hidden p-1.5 rounded-lg text-light-muted dark:text-gpt-muted hover:bg-light-card dark:hover:bg-gpt-card transition-colors cursor-pointer" title="Open sidebar">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>

        <!-- Model Switcher -->
        <div class="relative">
          <button type="button" id="modelPickerBtn" onclick="window.toggleModelDropdown(event)" class="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-light-card dark:hover:bg-gpt-card text-sm font-semibold transition-colors border border-transparent hover:border-light-border dark:hover:border-gpt-border cursor-pointer">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span id="currentModelText">DeepSeek V4 Flash (0731)</span>
            </span>
            <svg class="w-4 h-4 text-light-muted dark:text-gpt-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          
          <div id="modelDropdown" class="hidden absolute left-0 top-full mt-1.5 w-72 max-h-96 overflow-y-auto rounded-2xl bg-light-bg dark:bg-gpt-card border border-light-border dark:border-gpt-border shadow-xl p-1.5 z-50 text-xs space-y-1">
            <div class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-light-muted dark:text-gpt-muted">Select Model</div>
            <div id="modelOptionsContainer" class="space-y-1"></div>
          </div>
        </div>
      </div>

      <!-- View Mode Pills -->
      <div class="hidden md:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-gpt-card border border-slate-200 dark:border-gpt-border text-xs gap-1">
        <button type="button" id="viewSplitBtn" onclick="window.setViewMode('split')" class="view-btn active px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer">Split View</button>
        <button type="button" id="viewBrowserBtn" onclick="window.setViewMode('browser')" class="view-btn px-3 py-1.5 rounded-lg font-medium text-light-muted dark:text-gpt-muted hover:text-light-text dark:hover:text-gpt-text transition-all duration-200 cursor-pointer border border-transparent">Browser Focus</button>
        <button type="button" id="viewChatBtn" onclick="window.setViewMode('chat')" class="view-btn px-3 py-1.5 rounded-lg font-medium text-light-muted dark:text-gpt-muted hover:text-light-text dark:hover:text-gpt-text transition-all duration-200 cursor-pointer border border-transparent">Agent Chat</button>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-light-card/80 dark:bg-gpt-card border border-light-border dark:border-gpt-border text-xs font-mono">
          <span class="flex items-center gap-1 text-light-muted dark:text-gpt-muted">
            <span class="text-emerald-500 font-bold">#</span>
            <span id="metricSteps">0</span> steps
          </span>
          <span class="text-light-border dark:text-gpt-border">|</span>
          <span class="flex items-center gap-1 text-light-muted dark:text-gpt-muted">
            <span id="metricElapsed">0.0s</span>
          </span>
        </div>

        <!-- User Settings & Preferences Button -->
        <button type="button" id="userProfileBtn" onclick="window.openSettingsModal()" class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-light-card/80 dark:bg-gpt-card hover:bg-light-card dark:hover:bg-gpt-cardHover border border-light-border dark:border-gpt-border text-xs font-medium transition-colors cursor-pointer" title="Operator Settings & Preferences">
          <div id="headerUserAvatar" class="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">K</div>
          <span id="headerUserName" class="hidden sm:inline font-semibold">Krishna</span>
          <svg class="w-3.5 h-3.5 text-light-muted dark:text-gpt-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </button>

        <button type="button" id="themeToggleBtn" onclick="window.toggleTheme()" class="p-2 rounded-xl text-light-muted dark:text-gpt-muted hover:bg-light-card dark:hover:bg-gpt-card hover:text-light-text dark:hover:text-gpt-text transition-colors cursor-pointer" title="Toggle Theme">
          <svg class="w-4 h-4 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          <svg class="w-4 h-4 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
        </button>
      </div>
    </header>

    <!-- Workspace -->
    <div id="splitWorkspace" class="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 relative">
      
      <!-- LEFT PANE: Chat & Actions -->
      <section id="chatPane" class="w-full lg:w-1/2 flex flex-col h-full border-r border-light-border dark:border-gpt-border bg-light-bg dark:bg-gpt-dark relative min-w-0 transition-all duration-300 ease-in-out">
        
        <div id="chatFeed" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col items-center">
          <div id="chatFeedInner" class="max-w-3xl mx-auto w-full space-y-6 transition-all duration-300">
            <!-- Welcome Prompt -->
            <div class="flex items-start gap-3.5 w-full">
              <img src="/logo.png" alt="Smart AI Assistant Logo" class="w-8 h-8 rounded-xl object-cover shadow-sm ring-1 ring-emerald-500/20 flex-shrink-0">
              <div class="flex-1 space-y-2 min-w-0">
                <div class="font-medium text-xs text-light-muted dark:text-gpt-muted">Smart AI Assistant</div>
                <div class="text-sm leading-relaxed p-4 rounded-2xl bg-light-card dark:bg-gpt-card text-light-text dark:text-gpt-text shadow-sm border border-light-border dark:border-gpt-border">
                  Welcome to <strong>Smart AI Assistant</strong>. Built for autonomous computer operations, web workflows, and human-in-the-loop oversight.
                </div>
              </div>
            </div>

            <div id="dynamicChatSteps" class="space-y-4 w-full"></div>
          </div>
        </div>

        <!-- Input Bar Container with High Z-Index & Pointer-Events -->
        <div class="p-4 bg-light-bg dark:bg-gpt-dark border-t border-light-border dark:border-gpt-border relative z-30 flex-shrink-0">
          <div id="inputInner" class="max-w-3xl mx-auto space-y-2 relative z-30 transition-all duration-300">
            
            <!-- Quick Action Chips -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar relative z-30">
              <button type="button" class="quick-chip cursor-pointer relative z-30 whitespace-nowrap px-3 py-1.5 rounded-full border border-light-border dark:border-gpt-border bg-light-card dark:bg-gpt-card hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5 text-light-muted dark:text-gpt-muted hover:text-emerald-400" onclick="window.fillChip('search for tickets from chennai to vellore', 'https://www.google.com')">
                <span>🚌</span> Chennai to Vellore Tickets
              </button>
              <button type="button" class="quick-chip cursor-pointer relative z-30 whitespace-nowrap px-3 py-1.5 rounded-full border border-light-border dark:border-gpt-border bg-light-card dark:bg-gpt-card hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5 text-light-muted dark:text-gpt-muted hover:text-emerald-400" onclick="window.fillChip('Search Wikipedia for quantum computing and summarize key concepts', 'https://en.wikipedia.org/wiki/Quantum_computing')">
                <span>🔬</span> Quantum Computing Wiki
              </button>
              <button type="button" class="quick-chip cursor-pointer relative z-30 whitespace-nowrap px-3 py-1.5 rounded-full border border-light-border dark:border-gpt-border bg-light-card dark:bg-gpt-card hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5 text-light-muted dark:text-gpt-muted hover:text-emerald-400" onclick="window.fillChip('Search Hacker News for AI agent breakthroughs and summarize top story', 'https://news.ycombinator.com')">
                <span>📰</span> Hacker News Top AI
              </button>
            </div>

            <!-- Input Box Container -->
            <div class="relative z-30 rounded-[26px] border border-light-border dark:border-gpt-border bg-light-card dark:bg-gpt-card shadow-lg p-2 transition-all focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/30">
              
              <div id="urlInputContainer" class="hidden px-3 pt-1 pb-2 flex items-center gap-2 border-b border-light-border/60 dark:border-gpt-border/50 relative z-30">
                <span class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">🌐 START URL:</span>
                <input id="startUrlInput" type="text" placeholder="https://..." class="flex-1 bg-transparent text-xs font-mono focus:outline-none text-light-text dark:text-gpt-text relative z-30">
                <button type="button" id="closeUrlInputBtn" onclick="window.toggleUrlContainer(false)" class="text-light-muted dark:text-gpt-muted hover:text-light-text dark:hover:text-gpt-text relative z-30">✕</button>
              </div>

              <!-- Live Voice Transcribing Indicator Bar -->
              <div id="liveVoiceBar" class="hidden px-3 py-1 mb-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 relative z-30">
                <div class="flex items-center gap-2">
                  <span class="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span class="font-semibold text-[11px] tracking-wide">LIVE TRANSCRIBING</span>
                  <div class="flex items-center gap-0.5 ml-1">
                    <span class="inline-block w-1 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span class="inline-block w-1 h-4 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span class="inline-block w-1 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  </div>
                </div>
                <span id="liveVoiceStatus" class="text-[10px] text-light-muted dark:text-gpt-muted font-mono">Listening in real-time...</span>
              </div>

              <div class="flex items-end gap-2 px-2 pt-1 pb-1 relative z-30">
                <button type="button" id="toggleUrlBtn" onclick="window.toggleUrlContainer()" class="p-2 rounded-full text-light-muted dark:text-gpt-muted hover:bg-light-bg dark:hover:bg-gpt-cardHover transition-colors flex-shrink-0 relative z-30 cursor-pointer" title="Attach Start URL">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                </button>

                <textarea id="taskPromptInput" rows="2" placeholder="Instruct the agent to search, navigate, or summarize..." class="w-full resize-none bg-transparent py-1.5 text-sm focus:outline-none text-light-text dark:text-gpt-text placeholder:text-light-muted dark:placeholder:text-gpt-muted max-h-36 overflow-y-auto leading-relaxed relative z-30 cursor-text pointer-events-auto"></textarea>

                <div class="flex items-center gap-1.5 flex-shrink-0 relative z-30">
                  <!-- Active Voice Mic Button (faster-whisper small.en) -->
                  <button type="button" id="voiceMicBtn" onclick="window.toggleVoiceListening()" class="w-9 h-9 rounded-full bg-light-bg dark:bg-gpt-card hover:bg-emerald-500/15 text-light-muted dark:text-gpt-muted hover:text-emerald-500 border border-light-border dark:border-gpt-border flex items-center justify-center transition-all shadow-md cursor-pointer relative z-30" title="Tap to speak (Offline faster-whisper small.en)">
                    <span id="voiceMicIcon" class="text-sm">🎙️</span>
                  </button>

                  <!-- Pause / Resume Button -->
                  <button type="button" id="pauseAgentBtn" onclick="window.togglePause()" class="hidden w-9 h-9 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 flex items-center justify-center transition-all shadow-md cursor-pointer relative z-30" title="Pause / Resume Execution">
                    <span id="pauseIcon" class="text-xs font-bold font-mono">⏸</span>
                  </button>

                  <!-- Run / Stop Button -->
                  <button type="button" id="runAgentBtn" onclick="window.executeTaskRun()" class="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all shadow-md cursor-pointer relative z-30" title="Run Agent">
                    <svg id="runIcon" class="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    <svg id="stopIcon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- RIGHT PANE: Live Browser Canvas & Result Tabs -->
      <section id="browserPane" class="w-full lg:w-1/2 flex flex-col h-full bg-light-card/40 dark:bg-gpt-darker relative overflow-hidden min-w-0">
        
        <!-- Browser Chrome -->
        <div class="h-12 border-b border-light-border dark:border-gpt-border bg-light-bg/95 dark:bg-gpt-dark/95 px-3 flex items-center justify-between gap-3 z-20">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5 mr-1">
              <span class="w-3 h-3 rounded-full bg-[#FF5F56] inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-[#27C93F] inline-block"></span>
            </div>
          </div>

          <!-- Address Bar -->
          <div class="flex-1 max-w-lg mx-auto">
            <div class="flex items-center justify-between px-3 py-1 rounded-xl bg-light-card dark:bg-gpt-card border border-light-border dark:border-gpt-border text-xs">
              <div class="flex items-center gap-2 truncate">
                <span class="text-emerald-500 font-bold">🔒</span>
                <span id="browserUrlDisplay" class="font-mono text-[11px] truncate text-light-text dark:text-gpt-text">about:blank</span>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <span id="livePulseDot" class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span id="liveStatusText" class="text-[10px] font-mono text-light-muted dark:text-gpt-muted">800ms Feed</span>
              </div>
            </div>
          </div>

          <!-- Canvas View Mode Tabs -->
          <div class="flex items-center gap-1">
            <div class="flex items-center p-0.5 rounded-lg bg-light-card dark:bg-gpt-card text-xs">
              <button type="button" id="tabLiveBtn" onclick="window.switchCanvasTab('live')" class="canvas-tab px-2.5 py-1 rounded-md font-medium text-[11px] bg-light-bg dark:bg-gpt-darker shadow-sm text-light-text dark:text-gpt-text cursor-pointer">🌐 Live Web</button>
              <button type="button" id="tabResultBtn" onclick="window.switchCanvasTab('result')" class="canvas-tab px-2.5 py-1 rounded-md font-medium text-[11px] text-light-muted dark:text-gpt-muted hover:text-light-text dark:hover:text-gpt-text cursor-pointer">✨ Final Result</button>
              <button type="button" id="tabDomBtn" onclick="window.switchCanvasTab('dom')" class="canvas-tab px-2.5 py-1 rounded-md font-medium text-[11px] text-light-muted dark:text-gpt-muted hover:text-light-text dark:hover:text-gpt-text cursor-pointer">DOM</button>
              <button type="button" id="tabDataBtn" onclick="window.switchCanvasTab('data')" class="canvas-tab px-2.5 py-1 rounded-md font-medium text-[11px] text-light-muted dark:text-gpt-muted hover:text-light-text dark:hover:text-gpt-text cursor-pointer">Data</button>
            </div>
          </div>
        </div>

        <!-- Canvas Viewport -->
        <div class="flex-1 overflow-auto relative p-4 bg-zinc-900/10 dark:bg-black/30 flex items-center justify-center">
          
          <!-- TAB 1: Live Interactive Browser Screen -->
          <div id="viewLiveTab" class="w-full h-full max-w-4xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col relative">
            <div id="browserPlaceholder" class="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center text-zinc-500">
              <span class="text-4xl opacity-40">🌐</span>
              <strong class="text-sm font-semibold">Live Browser Viewport</strong>
              <p class="text-xs max-w-xs leading-relaxed">Start an agent task to stream the live browser screen. Updates every ~800ms.</p>
            </div>
            <img id="realLiveFrame" src="" alt="Live Browser View" class="w-full h-full object-contain hidden">
          </div>

          <!-- TAB 2: Final Result Card View -->
          <div id="viewResultTab" class="hidden w-full h-full max-w-4xl bg-light-bg dark:bg-gpt-dark text-light-text dark:text-gpt-text rounded-xl p-6 overflow-auto shadow-2xl border border-light-border dark:border-gpt-border flex flex-col gap-4">
            <div class="flex items-center justify-between pb-3 border-b border-light-border dark:border-gpt-border">
              <div>
                <span id="resBadge" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ✅ Task Completed Successfully
                </span>
                <h2 id="resGoalTitle" class="text-base font-bold mt-2">No Task Executed Yet</h2>
                <div id="resMetaInfo" class="text-xs font-mono text-light-muted dark:text-gpt-muted mt-1">Start a task run to view final summary.</div>
              </div>
            </div>

            <div class="flex-1 bg-light-card dark:bg-gpt-card rounded-xl p-4 border border-light-border dark:border-gpt-border overflow-y-auto space-y-2">
              <div class="text-xs font-bold uppercase tracking-wider text-emerald-500">Extracted Answer & Summary</div>
              <div id="resTextContent" class="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                Run an agent task to view final answer output here. When complete, the live web session closes and the formatted results load automatically into this tab.
              </div>
            </div>
          </div>

          <!-- TAB 3: DOM Inspector -->
          <div id="viewDomTab" class="hidden w-full h-full max-w-4xl bg-[#101012] text-zinc-200 rounded-xl p-4 overflow-auto font-mono text-xs shadow-2xl border border-zinc-800">
            <div class="flex items-center justify-between pb-3 border-b border-zinc-800 text-[11px] text-zinc-400">
              <span class="font-semibold text-emerald-400">DOM ACCESSIBILITY SNAPSHOT TREE</span>
            </div>
            <pre id="domTreeViewer" class="mt-3 text-zinc-300 leading-relaxed whitespace-pre-wrap">No DOM tree captured yet.</pre>
          </div>

          <!-- TAB 4: Extracted JSON Artifacts -->
          <div id="viewDataTab" class="hidden w-full h-full max-w-4xl bg-light-bg dark:bg-gpt-dark rounded-xl p-4 overflow-auto text-xs shadow-2xl border border-light-border dark:border-gpt-border font-mono">
            <div class="flex items-center justify-between pb-3 border-b border-light-border dark:border-gpt-border text-[11px]">
              <span class="font-semibold text-emerald-600 dark:text-emerald-400">RUN ARTIFACTS & METRICS (JSON)</span>
              <button type="button" onclick="window.copyJsonData()" class="hover:underline text-light-muted dark:text-gpt-muted cursor-pointer">Copy JSON</button>
            </div>
            <pre id="jsonViewer" class="mt-3 text-light-text dark:text-gpt-text leading-relaxed whitespace-pre-wrap">{ "status": "idle" }</pre>
          </div>

        </div>

        <!-- Status Footer -->
        <div class="h-8 border-t border-light-border dark:border-gpt-border bg-light-bg dark:bg-gpt-dark px-3 flex items-center justify-between text-[11px] text-light-muted dark:text-gpt-muted z-20">
          <div class="flex items-center gap-3">
            <span>Viewport: <strong class="text-light-text dark:text-gpt-text font-mono">1280 × 800</strong></span>
            <span>DOM Latency: <strong class="text-light-text dark:text-gpt-text font-mono">18ms</strong></span>
          </div>
          <div class="flex items-center gap-2 font-mono">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Operator Connected</span>
          </div>
        </div>
      </section>

    </div>
  </main>

  <!-- High-Risk Action Human Approval Modal -->
  <div id="approvalModal" class="hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-light-bg dark:bg-gpt-card border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
      <div class="flex items-center gap-3 text-amber-500">
        <span class="text-2xl">⚠️</span>
        <h3 class="font-bold text-base text-light-text dark:text-gpt-text">Human Supervisor Approval Required</h3>
      </div>
      <p class="text-xs text-light-muted dark:text-gpt-muted">The autonomous operator requires human authorization to execute a high-risk action:</p>
      <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono space-y-1.5">
        <div><strong class="text-light-text dark:text-gpt-text">Action:</strong> <span id="approvalTool" class="text-emerald-500">browser_fill_form</span></div>
        <div><strong class="text-light-text dark:text-gpt-text">Reason:</strong> <span id="approvalReason" class="text-amber-400">High transaction amount detected</span></div>
        <div id="approvalArgsPreview" class="truncate text-[11px] text-zinc-500 dark:text-zinc-400 mt-1"></div>
      </div>
      <div class="flex gap-2.5 justify-end pt-2">
        <button type="button" onclick="window.sendApprovalDecision(false)" class="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 cursor-pointer">Deny &amp; Abort</button>
        <button type="button" onclick="window.sendApprovalDecision(true)" class="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-white shadow-md cursor-pointer">Authorize &amp; Proceed</button>
      </div>
    </div>
  </div>

  <!-- Simple Operator Login Screen Gate -->
  <div id="loginGate" class="hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-light-bg dark:bg-gpt-card border border-light-border dark:border-gpt-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
      
      <!-- Brand & Header -->
      <div class="text-center space-y-2">
        <div class="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-1 shadow-sm">
          <img src="/logo.png" alt="Logo" class="w-10 h-10 rounded-xl object-cover shadow-sm ring-1 ring-emerald-500/20">
        </div>
        <h2 class="text-xl font-bold tracking-tight text-light-text dark:text-gpt-text">Smart AI Assistant</h2>
        <p class="text-xs text-light-muted dark:text-gpt-muted">Sign in to your account to initialize your AI session & preferences.</p>
      </div>

      <form id="loginForm" onsubmit="event.preventDefault(); window.submitLogin();" class="space-y-4">
        <!-- User Name -->
        <div class="space-y-1.5">
          <label for="loginUsername" class="block text-xs font-semibold text-light-text dark:text-gpt-text">User Name</label>
          <input type="text" id="loginUsername" value="Krishna" required placeholder="Enter your name" class="w-full px-3.5 py-2.5 rounded-xl bg-light-card dark:bg-gpt-darker border border-light-border dark:border-gpt-border text-sm text-light-text dark:text-gpt-text focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/40">
        </div>

        <!-- User Email -->
        <div class="space-y-1.5">
          <label for="loginEmail" class="block text-xs font-semibold text-light-text dark:text-gpt-text">Email Address</label>
          <input type="email" id="loginEmail" value="krishna@example.com" required placeholder="name@example.com" class="w-full px-3.5 py-2.5 rounded-xl bg-light-card dark:bg-gpt-darker border border-light-border dark:border-gpt-border text-sm text-light-text dark:text-gpt-text focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/40">
        </div>

        <!-- Preferred Default Model -->
        <div class="space-y-1.5">
          <label for="loginModel" class="block text-xs font-semibold text-light-text dark:text-gpt-text">Preferred Reasoning Model</label>
          <select id="loginModel" class="w-full px-3 py-2.5 rounded-xl bg-light-card dark:bg-gpt-darker border border-light-border dark:border-gpt-border text-xs text-light-text dark:text-gpt-text focus:outline-none focus:border-emerald-500/70">
            <option value="deepseek/deepseek-v4-flash-0731:free" selected>DeepSeek V4 Flash (Free - Fast)</option>
            <option value="qwen/qwen3.8-27b:free">Qwen 3.8 27B (Free - Resilient)</option>
            <option value="google/gemma-4-26b-a4b-it:free">Google Gemma 4 26B (Free)</option>
            <option value="nex-agi/nex-n2.5-mini:free">Nex AGI N2.5 Mini (Free)</option>
            <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash</option>
            <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
            <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini</option>
            <option value="anthropic/claude-sonnet-4">Anthropic Claude Sonnet 4</option>
          </select>
        </div>

        <button type="submit" class="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg transition-all duration-200 cursor-pointer mt-2">
          🚀 Launch Assistant
        </button>
      </form>
    </div>
  </div>

  <!-- Model settings & Provider Configuration Modal (Matching Reference Design) -->
  <div id="settingsModal" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6">
    <div class="w-full max-w-5xl h-[85vh] max-h-[750px] bg-light-bg dark:bg-[#111113] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl flex overflow-hidden text-xs">
      
      <!-- LEFT SIDEBAR -->
      <aside class="w-60 sm:w-64 border-r border-light-border dark:border-white/10 bg-light-card/60 dark:bg-[#161618] flex flex-col justify-between p-3 select-none flex-shrink-0">
        <div class="space-y-4 overflow-y-auto">
          <!-- Back to workspace -->
          <button type="button" onclick="window.closeSettingsModal()" class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-light-muted dark:text-zinc-400 hover:text-light-text dark:hover:text-white hover:bg-light-card dark:hover:bg-zinc-800 transition-colors cursor-pointer font-medium w-full text-left">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Back to workspace</span>
          </button>

          <!-- Basics section -->
          <div class="space-y-1">
            <div class="px-2.5 py-1 text-[10px] font-semibold text-light-muted dark:text-zinc-500 uppercase tracking-wider">Basics</div>
            <button type="button" onclick="window.switchSettingsTab('general')" id="tabBtn_general" class="settings-nav-item w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-light-muted dark:text-zinc-400 hover:text-light-text dark:hover:text-white hover:bg-light-card dark:hover:bg-zinc-800 cursor-pointer">
              <span>👤</span><span>General</span>
            </button>
            <button type="button" onclick="window.switchSettingsTab('appearance')" id="tabBtn_appearance" class="settings-nav-item w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-light-muted dark:text-zinc-400 hover:text-light-text dark:hover:text-white hover:bg-light-card dark:hover:bg-zinc-800 cursor-pointer">
              <span>🎨</span><span>Appearance</span>
            </button>
            <button type="button" onclick="window.switchSettingsTab('models')" id="tabBtn_models" class="settings-nav-item active w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-light-card dark:bg-zinc-800 text-light-text dark:text-white font-semibold cursor-pointer">
              <span>📦</span><span>Model settings</span>
            </button>
            <button type="button" onclick="window.switchSettingsTab('browser_use')" id="tabBtn_browser_use" class="settings-nav-item w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-light-muted dark:text-zinc-400 hover:text-light-text dark:hover:text-white hover:bg-light-card dark:hover:bg-zinc-800 cursor-pointer">
              <span>🌐</span><span>Browser Use</span>
            </button>
            <button type="button" onclick="window.switchSettingsTab('computer_use')" id="tabBtn_computer_use" class="settings-nav-item w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-light-muted dark:text-zinc-400 hover:text-light-text dark:hover:text-white hover:bg-light-card dark:hover:bg-zinc-800 cursor-pointer">
              <span>💻</span><span>Computer Use</span>
            </button>
          </div>

          <!-- Providers section -->
          <div class="space-y-1">
            <div class="px-2.5 py-1 text-[10px] font-semibold text-light-muted dark:text-zinc-500 uppercase tracking-wider">Providers</div>
            <button type="button" onclick="window.selectProvider('zai')" id="providerTab_zai" class="provider-nav-item w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-light-muted dark:text-zinc-400 hover:text-light-text dark:hover:text-white hover:bg-light-card dark:hover:bg-zinc-800 cursor-pointer">
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded bg-zinc-700 text-[10px] flex items-center justify-center font-bold text-white">Z</span>
                <span>Z.ai</span>
              </div>
              <span class="w-2 h-2 rounded-full bg-zinc-600"></span>
            </button>
          </div>

          <!-- Custom providers section -->
          <div class="space-y-1">
            <div class="px-2.5 py-1 text-[10px] font-semibold text-light-muted dark:text-zinc-500 uppercase tracking-wider">Custom providers</div>
            <div id="customProvidersNavList" class="space-y-0.5">
              <!-- Dynamically rendered OpenRouter, Gemini, etc. -->
            </div>
            <button type="button" onclick="window.promptAddProvider()" class="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-light-muted dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer">
              <span>+ Add provider</span>
            </button>
          </div>
        </div>

        <!-- Sidebar bottom user badge -->
        <div class="pt-3 border-t border-light-border dark:border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-2 truncate">
            <div id="modalUserAvatar" class="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">K</div>
            <div class="truncate">
              <div id="modalUserBottomName" class="font-semibold truncate text-[11px] text-light-text dark:text-white">Krishna Jadhav</div>
              <div id="modalUserBottomEmail" class="text-[10px] text-light-muted dark:text-zinc-500 truncate">krishna@example.com</div>
            </div>
          </div>
          <button type="button" onclick="window.logoutUser()" title="Sign out" class="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer">🚪</button>
        </div>
      </aside>

      <!-- RIGHT MAIN AREA -->
      <section class="flex-1 flex flex-col bg-light-bg dark:bg-[#111113] overflow-y-auto min-w-0">
        
        <!-- Tab: Model Settings (Primary) -->
        <div id="settingsView_models" class="p-6 space-y-5">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-xl font-bold tracking-tight text-light-text dark:text-white">Model settings</h2>
              <p class="text-xs text-light-muted dark:text-zinc-400 mt-1">Manage custom model providers. Once configured, they can be selected during chat.</p>
            </div>
            <button type="button" onclick="window.renderModelSettingsView()" class="p-1.5 rounded-lg border border-light-border dark:border-zinc-800 text-light-muted dark:text-zinc-400 hover:text-white hover:bg-light-card dark:hover:bg-zinc-800 transition-colors cursor-pointer" title="Refresh settings">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            </button>
          </div>

          <!-- Provider Detail Card -->
          <div class="rounded-2xl border border-light-border dark:border-white/10 bg-light-card/40 dark:bg-[#18181b]/50 p-5 space-y-4">
            
            <!-- Provider Title Bar -->
            <div class="flex items-center justify-between pb-3 border-b border-light-border/60 dark:border-white/10">
              <div class="flex items-center gap-2">
                <span id="curProviderTitle" class="text-base font-bold text-light-text dark:text-white">Gemini</span>
                <button type="button" onclick="window.editProviderName()" class="text-light-muted dark:text-zinc-400 hover:text-white cursor-pointer" title="Edit provider name">✏️</button>
                <div class="flex items-center gap-1 ml-2">
                  <button type="button" id="curProviderEnabledBtn" onclick="window.toggleProviderStatus(true)" class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-pointer">Enabled</button>
                  <button type="button" id="curProviderDisableBtn" onclick="window.toggleProviderStatus(false)" class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 border border-transparent cursor-pointer">Disable</button>
                </div>
              </div>
              <button type="button" onclick="window.deleteCurrentProvider()" id="deleteProviderBtn" class="text-zinc-500 hover:text-rose-400 cursor-pointer p-1" title="Delete custom provider">🗑️</button>
            </div>

            <!-- Provider Parameters -->
            <div class="space-y-3.5">
              <!-- Base URL -->
              <div class="space-y-1">
                <label class="block font-semibold text-light-muted dark:text-zinc-400">Base URL</label>
                <input type="text" id="curProviderBaseUrl" onchange="window.saveProviderField('baseUrl', this.value)" class="w-full px-3.5 py-2 rounded-xl bg-light-card dark:bg-[#202024] border border-light-border dark:border-white/10 text-light-text dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500/60" placeholder="https://generativelanguage.googleapis.com/v1beta/openai">
              </div>

              <!-- API Format -->
              <div class="space-y-1">
                <label class="block font-semibold text-light-muted dark:text-zinc-400">API format</label>
                <select id="curProviderApiFormat" onchange="window.saveProviderField('apiFormat', this.value)" class="w-full px-3.5 py-2 rounded-xl bg-light-card dark:bg-[#202024] border border-light-border dark:border-white/10 text-light-text dark:text-white text-xs focus:outline-none focus:border-emerald-500/60">
                  <option value="openai">OpenAI compatible (/v1/chat/completions)</option>
                  <option value="anthropic">Anthropic messages (/v1/messages)</option>
                  <option value="gemini">Google Gemini Native</option>
                </select>
              </div>

              <!-- API Key -->
              <div class="space-y-1">
                <label class="block font-semibold text-light-muted dark:text-zinc-400">API key</label>
                <div class="relative">
                  <input type="password" id="curProviderApiKey" onchange="window.saveProviderField('apiKey', this.value)" placeholder="Enter API key..." class="w-full px-3.5 py-2 pr-10 rounded-xl bg-light-card dark:bg-[#202024] border border-light-border dark:border-white/10 text-light-text dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500/60">
                  <button type="button" onclick="window.toggleApiKeyVisibility()" class="absolute right-3 top-2 text-light-muted dark:text-zinc-400 hover:text-white cursor-pointer" title="Toggle visibility">👁️</button>
                </div>
              </div>
            </div>

            <!-- Model List Section -->
            <div class="space-y-2.5 pt-2">
              <div class="font-semibold text-light-text dark:text-white text-xs flex items-center justify-between">
                <span>Model list</span>
                <span class="text-[11px] text-light-muted dark:text-zinc-400 font-normal">Click 🔗 to select as active model</span>
              </div>

              <!-- Model Cards Container -->
              <div id="curProviderModelList" class="space-y-1.5">
                <!-- Dynamically rendered model cards -->
              </div>

              <!-- Add Model Button & Inline Form -->
              <div id="addModelInlineArea" class="pt-1">
                <button type="button" id="showAddModelBtn" onclick="window.toggleAddModelForm(true)" class="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-light-border dark:border-white/15 hover:border-emerald-500/50 text-light-muted dark:text-zinc-400 hover:text-emerald-400 transition-colors w-full justify-center font-medium cursor-pointer">
                  <span>+ Add model</span>
                </button>

                <!-- Hidden Inline Form -->
                <div id="addModelForm" class="hidden p-3 rounded-xl border border-light-border dark:border-white/15 bg-light-card dark:bg-[#202024] space-y-2.5">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" id="newModelIdInput" placeholder="Model ID (e.g. gemini-3.8-flash-tiered[1m])" class="w-full px-3 py-1.5 rounded-lg bg-light-bg dark:bg-[#161618] border border-light-border dark:border-white/10 text-light-text dark:text-white font-mono text-xs focus:outline-none">
                    <input type="text" id="newModelTagsInput" placeholder="Tags (e.g. Vision, 1M)" class="w-full px-3 py-1.5 rounded-lg bg-light-bg dark:bg-[#161618] border border-light-border dark:border-white/10 text-light-text dark:text-white text-xs focus:outline-none">
                  </div>
                  <div class="flex justify-end gap-2">
                    <button type="button" onclick="window.toggleAddModelForm(false)" class="px-3 py-1 rounded-lg text-light-muted dark:text-zinc-400 hover:text-white cursor-pointer">Cancel</button>
                    <button type="button" onclick="window.submitAddNewModel()" class="px-3.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold cursor-pointer">Save &amp; Activate Model</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Tab: General (User Profile) -->
        <div id="settingsView_general" class="hidden p-6 space-y-5">
          <h2 class="text-xl font-bold tracking-tight text-light-text dark:text-white">General settings</h2>
          <p class="text-xs text-light-muted dark:text-zinc-400">Manage your user profile details.</p>
          <div class="max-w-md space-y-3.5 p-5 rounded-2xl border border-light-border dark:border-white/10 bg-light-card/40 dark:bg-[#18181b]/50">
            <div class="space-y-1">
              <label class="block font-semibold text-light-muted dark:text-zinc-400">User Name</label>
              <input type="text" id="prefUsername" class="w-full px-3.5 py-2 rounded-xl bg-light-card dark:bg-[#202024] border border-light-border dark:border-white/10 text-light-text dark:text-white text-xs">
            </div>
            <div class="space-y-1">
              <label class="block font-semibold text-light-muted dark:text-zinc-400">Email Address</label>
              <input type="email" id="prefEmail" class="w-full px-3.5 py-2 rounded-xl bg-light-card dark:bg-[#202024] border border-light-border dark:border-white/10 text-light-text dark:text-white text-xs">
            </div>
            <button type="button" onclick="window.saveGeneralProfile()" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold cursor-pointer">Save Profile</button>
          </div>
        </div>

        <!-- Tab: Appearance -->
        <div id="settingsView_appearance" class="hidden p-6 space-y-5">
          <h2 class="text-xl font-bold tracking-tight text-light-text dark:text-white">Appearance</h2>
          <p class="text-xs text-light-muted dark:text-zinc-400">Customize assistant theme and visual interface.</p>
          <div class="max-w-md space-y-3 p-5 rounded-2xl border border-light-border dark:border-white/10 bg-light-card/40 dark:bg-[#18181b]/50">
            <div class="flex items-center justify-between">
              <span class="text-light-text dark:text-white font-medium">Dark Mode Theme</span>
              <button type="button" onclick="window.toggleTheme()" class="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white font-semibold cursor-pointer">Toggle Theme</button>
            </div>
          </div>
        </div>

        <!-- Tab: Browser Use -->
        <div id="settingsView_browser_use" class="hidden p-6 space-y-5">
          <h2 class="text-xl font-bold tracking-tight text-light-text dark:text-white">Browser Use</h2>
          <p class="text-xs text-light-muted dark:text-zinc-400">Configure Playwright browser automation execution parameters.</p>
          <div class="max-w-md space-y-3 p-5 rounded-2xl border border-light-border dark:border-white/10 bg-light-card/40 dark:bg-[#18181b]/50">
            <div class="text-light-muted dark:text-zinc-400">Viewport: 1280 × 800, Headless Playwright Chromium</div>
            <div class="text-emerald-500 font-semibold">✓ Accessibility Snapshot Perception Engine Active</div>
          </div>
        </div>

        <!-- Tab: Computer Use -->
        <div id="settingsView_computer_use" class="hidden p-6 space-y-5">
          <h2 class="text-xl font-bold tracking-tight text-light-text dark:text-white">Computer Use</h2>
          <p class="text-xs text-light-muted dark:text-zinc-400">Configure native desktop and local file tools.</p>
          <div class="max-w-md space-y-3 p-5 rounded-2xl border border-light-border dark:border-white/10 bg-light-card/40 dark:bg-[#18181b]/50">
            <div class="text-emerald-500 font-semibold">✓ Content-Aware Smart Organizer Enabled</div>
            <div class="text-emerald-500 font-semibold">✓ Semantic Folder Renaming Active</div>
            <div class="text-emerald-500 font-semibold">✓ Transactional Undo Reversibility Ready</div>
          </div>
        </div>

      </section>
    </div>
  </div>

  <!-- Toast -->
  <div id="toast" class="fixed bottom-6 right-6 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-medium shadow-2xl border border-zinc-700">
    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
    <span id="toastMessage">Action completed</span>
  </div>

  <script>
    window.state = {
      isRunning: false,
      isPaused: false,
      pendingActionId: null,
      selectedModel: 'deepseek/deepseek-v4-flash-0731:free',
      selectedModelName: 'DeepSeek V4 Flash (0731)',
      currentView: 'split',
      activeCanvasTab: 'live',
      stepCount: 0,
      startTime: null,
      timerInterval: null,
      lastRunResult: null,
      sse: null
    };

    window.esc = function(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    window.formatResultText = function(text) {
      if (!text) return '';
      var safe = window.esc(text);
      safe = safe.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
      safe = safe.replace(/^[\\*\\-]\\s+(.*)$/gm, '• $1');
      return safe.replace(/\\n/g, '<br>');
    };


    window.showToast = function(msg) {
      try {
        var toast = document.getElementById('toast');
        var toastMsg = document.getElementById('toastMessage');
        if (toast && toastMsg) {
          toastMsg.textContent = msg;
          toast.classList.remove('translate-y-20', 'opacity-0');
          setTimeout(function() { toast.classList.add('translate-y-20', 'opacity-0'); }, 2600);
        }
      } catch (e) {}
    };

    // User Authentication & Preferences Management
    window.getSavedUser = function() {
      try {
        var raw = localStorage.getItem('browser_agent_user');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    };

    window.getSavedPreferences = function() {
      try {
        var raw = localStorage.getItem('browser_agent_preferences');
        var defaults = {
          model: 'deepseek/deepseek-v4-flash-0731:free',
          headless: true,
          slowMo: 50,
          apiKey: '',
          email: 'krishna@example.com'
        };
        return raw ? Object.assign(defaults, JSON.parse(raw)) : defaults;
      } catch (e) {
        return {
          model: 'deepseek/deepseek-v4-flash-0731:free',
          headless: true,
          slowMo: 50,
          apiKey: '',
          email: 'krishna@example.com'
        };
      }
    };

    window.initAuthAndPreferences = function() {
      var user = window.getSavedUser();
      var prefs = window.getSavedPreferences();
      var loginGate = document.getElementById('loginGate');

      if (!user) {
        if (loginGate) loginGate.classList.remove('hidden');
        return;
      }

      if (loginGate) loginGate.classList.add('hidden');

      // Update navbar & sidebar user badges
      var headerName = document.getElementById('headerUserName');
      var headerAvatar = document.getElementById('headerUserAvatar');
      var sidebarName = document.getElementById('sidebarUserName');
      var sidebarEmail = document.getElementById('sidebarUserEmail');
      var sidebarAvatar = document.getElementById('sidebarUserAvatar');
      var modalAvatar = document.getElementById('modalUserAvatar');

      var initial = (user.username || 'K').trim().charAt(0).toUpperCase();

      if (headerName) headerName.textContent = user.username || 'Krishna';
      if (headerAvatar) headerAvatar.textContent = initial;
      if (sidebarName) sidebarName.textContent = user.username || 'Krishna';
      if (sidebarEmail) sidebarEmail.textContent = user.email || 'krishna@example.com';
      if (sidebarAvatar) sidebarAvatar.textContent = initial;
      if (modalAvatar) modalAvatar.textContent = initial;

      // Apply preferred model if set
      if (prefs.model) {
        window.state.selectedModel = prefs.model;
        var curModelLabel = document.getElementById('currentModelText');
        if (curModelLabel) {
          curModelLabel.textContent = prefs.model.split('/')[1]?.split(':')[0] || prefs.model;
        }
      }
    };

    window.submitLogin = function() {
      var usernameInput = document.getElementById('loginUsername');
      var emailInput = document.getElementById('loginEmail');
      var modelInput = document.getElementById('loginModel');

      var username = (usernameInput && usernameInput.value.trim()) || 'Krishna';
      var email = (emailInput && emailInput.value.trim()) || 'krishna@example.com';
      var model = (modelInput && modelInput.value) || 'deepseek/deepseek-v4-flash-0731:free';

      var userObj = { username: username, email: email, loginTime: new Date().toISOString() };
      var prefObj = Object.assign(window.getSavedPreferences(), {
        model: model,
        email: email
      });

      localStorage.setItem('browser_agent_user', JSON.stringify(userObj));
      localStorage.setItem('browser_agent_preferences', JSON.stringify(prefObj));

      window.initAuthAndPreferences();
      window.showToast('Welcome, ' + username + '!');
    };

    // Model Settings & Custom Providers Management (Matching Design Reference)
    var DEFAULT_PROVIDERS = [
      {
        id: 'gemini',
        name: 'Gemini',
        enabled: true,
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        apiFormat: 'openai',
        apiKey: '',
        models: [
          { id: 'gemini-3.7-flash-tiered[1m]', tags: ['Vision', '1M'] },
          { id: 'gemini-3.1-pro-high[1m]', tags: ['Vision', '1M'] },
          { id: 'claude-sonnet-4-6', tags: ['1M'] },
          { id: 'gemini-3.8-flash-tiered[1m]', tags: ['Vision', '1M'] }
        ]
      },
      {
        id: 'openrouter',
        name: 'OpenRouter',
        enabled: true,
        baseUrl: 'https://openrouter.ai/api/v1',
        apiFormat: 'openai',
        apiKey: '',
        models: [
          { id: 'deepseek/deepseek-v4-flash-0731:free', tags: ['Free', 'Fast'] },
          { id: 'qwen/qwen3.8-27b:free', tags: ['Free', 'Resilient'] },
          { id: 'google/gemma-4-26b-a4b-it:free', tags: ['Free'] },
          { id: 'nex-agi/nex-n2.5-mini:free', tags: ['Free'] },
          { id: 'google/gemini-2.5-flash', tags: ['Vision'] },
          { id: 'anthropic/claude-3-haiku', tags: ['Fast'] },
          { id: 'openai/gpt-4o-mini', tags: ['Vision'] },
          { id: 'anthropic/claude-sonnet-4', tags: ['1M'] }
        ]
      },
      {
        id: 'zai',
        name: 'Z.ai',
        enabled: false,
        baseUrl: 'http://localhost:8080',
        apiFormat: 'anthropic',
        apiKey: '',
        models: [
          { id: 'z-agent-3.5', tags: ['Local'] }
        ]
      }
    ];

    window.currentSelectedProviderId = 'gemini';

    window.getSavedProviders = function() {
      try {
        var raw = localStorage.getItem('browser_agent_custom_providers');
        if (raw) {
          var parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
      localStorage.setItem('browser_agent_custom_providers', JSON.stringify(DEFAULT_PROVIDERS));
      return DEFAULT_PROVIDERS;
    };

    window.saveProviders = function(providers) {
      localStorage.setItem('browser_agent_custom_providers', JSON.stringify(providers));
    };

    window.selectProvider = function(providerId) {
      window.currentSelectedProviderId = providerId;
      window.renderModelSettingsView();
    };

    window.switchSettingsTab = function(tabName) {
      var tabs = ['general', 'appearance', 'models', 'browser_use', 'computer_use'];
      tabs.forEach(function(t) {
        var btn = document.getElementById('tabBtn_' + t);
        var view = document.getElementById('settingsView_' + t);
        if (btn) {
          if (t === tabName) {
            btn.className = 'settings-nav-item active w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-light-card dark:bg-zinc-800 text-light-text dark:text-white font-semibold cursor-pointer';
          } else {
            btn.className = 'settings-nav-item w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-light-muted dark:text-zinc-400 hover:text-light-text dark:hover:text-white hover:bg-light-card dark:hover:bg-zinc-800 cursor-pointer';
          }
        }
        if (view) {
          if (t === tabName) view.classList.remove('hidden');
          else view.classList.add('hidden');
        }
      });
    };

    window.openSettingsModal = function(tab) {
      var modal = document.getElementById('settingsModal');
      var user = window.getSavedUser() || { username: 'Krishna', email: 'krishna@example.com' };
      var uBottom = document.getElementById('modalUserBottomName');
      var eBottom = document.getElementById('modalUserBottomEmail');
      var uInput = document.getElementById('prefUsername');
      var eInput = document.getElementById('prefEmail');

      if (uBottom) uBottom.textContent = user.username || 'Krishna Jadhav';
      if (eBottom) eBottom.textContent = user.email || 'krishna@example.com';
      if (uInput) uInput.value = user.username || 'Krishna';
      if (eInput) eInput.value = user.email || 'krishna@example.com';

      window.switchSettingsTab(tab || 'models');
      window.renderModelSettingsView();
      if (modal) modal.classList.remove('hidden');
    };

    window.closeSettingsModal = function() {
      var modal = document.getElementById('settingsModal');
      if (modal) modal.classList.add('hidden');
    };

    window.renderModelSettingsView = function() {
      var providers = window.getSavedProviders();
      var curId = window.currentSelectedProviderId || 'gemini';
      var curProv = providers.find(function(p) { return p.id === curId; }) || providers[0];
      if (!curProv) return;
      window.currentSelectedProviderId = curProv.id;

      // 1. Render custom providers list on sidebar
      var customList = document.getElementById('customProvidersNavList');
      if (customList) {
        customList.innerHTML = '';
        providers.filter(function(p) { return p.id !== 'zai'; }).forEach(function(prov) {
          var isCur = prov.id === curProv.id;
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ' +
            (isCur ? 'bg-light-card dark:bg-zinc-800 text-light-text dark:text-white font-semibold' : 'text-light-muted dark:text-zinc-400 hover:text-white hover:bg-light-card dark:hover:bg-zinc-800');
          btn.innerHTML =
            '<div class="flex items-center gap-2">' +
              '<span>' + (prov.id === 'openrouter' ? '📦' : prov.id === 'gemini' ? '💎' : '⚡') + '</span>' +
              '<span>' + window.esc(prov.name) + '</span>' +
            '</div>' +
            '<span class="w-2 h-2 rounded-full ' + (prov.enabled ? 'bg-emerald-500' : 'bg-zinc-600') + '"></span>';
          btn.onclick = function() {
            window.selectProvider(prov.id);
          };
          customList.appendChild(btn);
        });
      }

      // 2. Render provider details
      var titleEl = document.getElementById('curProviderTitle');
      if (titleEl) titleEl.textContent = curProv.name;

      var enabledBtn = document.getElementById('curProviderEnabledBtn');
      var disableBtn = document.getElementById('curProviderDisableBtn');
      if (enabledBtn && disableBtn) {
        if (curProv.enabled) {
          enabledBtn.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-pointer';
          disableBtn.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 border border-transparent cursor-pointer';
        } else {
          enabledBtn.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 border border-transparent cursor-pointer';
          disableBtn.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-700 text-zinc-300 border border-zinc-600 cursor-pointer';
        }
      }

      var baseInput = document.getElementById('curProviderBaseUrl');
      if (baseInput) baseInput.value = curProv.baseUrl || '';

      var formatSelect = document.getElementById('curProviderApiFormat');
      if (formatSelect) formatSelect.value = curProv.apiFormat || 'openai';

      var keyInput = document.getElementById('curProviderApiKey');
      if (keyInput) keyInput.value = curProv.apiKey || '';

      // 3. Render model list cards
      var modelListEl = document.getElementById('curProviderModelList');
      if (modelListEl) {
        modelListEl.innerHTML = '';
        var activeModel = window.state.selectedModel;

        (curProv.models || []).forEach(function(m) {
          var isSelected = (m.id === activeModel);
          var card = document.createElement('div');
          card.className = 'flex items-center justify-between p-2.5 rounded-xl border transition-all ' +
            (isSelected ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold' : 'bg-light-card/60 dark:bg-[#202024] border-light-border dark:border-white/10 text-light-text dark:text-zinc-200');

          var tagsHtml = (m.tags || []).map(function(t) {
            return '<span class="px-2 py-0.5 rounded text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">' + window.esc(t) + '</span>';
          }).join(' ');

          card.innerHTML =
            '<div class="flex items-center gap-2.5 truncate">' +
              (isSelected ? '<span class="text-emerald-500 font-bold" title="Currently Active">✓</span>' : '') +
              '<span class="font-mono text-xs font-semibold truncate">' + window.esc(m.id) + '</span>' +
              '<div class="flex items-center gap-1 flex-shrink-0">' + tagsHtml + '</div>' +
            '</div>' +
            '<div class="flex items-center gap-1.5 flex-shrink-0 ml-2">' +
              '<button type="button" class="select-model-btn p-1.5 rounded-lg hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 cursor-pointer" title="Activate this model">' +
                '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>' +
              '</button>' +
              '<button type="button" class="del-model-btn p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 cursor-pointer" title="Delete model">' +
                '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' +
              '</button>' +
            '</div>';

          var selectBtn = card.querySelector('.select-model-btn');
          if (selectBtn) {
            selectBtn.onclick = function() {
              window.switchModel(m.id, m.name || m.id, curProv.id);
            };
          }

          var delBtn = card.querySelector('.del-model-btn');
          if (delBtn) {
            delBtn.onclick = function(e) {
              e.stopPropagation();
              window.deleteModel(m.id);
            };
          }

          modelListEl.appendChild(card);
        });
      }

      window.populateTopModelPicker();
    };

    window.switchModel = function(modelId, modelName, providerId) {
      window.state.selectedModel = modelId;
      window.state.selectedModelName = modelName || modelId;

      var cleanName = (modelName || modelId).split('/')[1]?.split(':')[0] || (modelName || modelId);
      var curText = document.getElementById('currentModelText');
      if (curText) curText.textContent = cleanName;

      // Persist in preferences
      var prefs = window.getSavedPreferences();
      prefs.model = modelId;
      localStorage.setItem('browser_agent_preferences', JSON.stringify(prefs));
      localStorage.setItem('browser_agent_selected_model', modelId);

      // Close dropdown if open
      var drop = document.getElementById('modelDropdown');
      if (drop) drop.classList.add('hidden');

      // Update modal view if open
      var modal = document.getElementById('settingsModal');
      if (modal && !modal.classList.contains('hidden')) {
        window.renderModelSettingsView();
      }

      window.showToast('✓ Switched model to ' + cleanName + ' (Active)');
    };

    window.toggleAddModelForm = function(show) {
      var form = document.getElementById('addModelForm');
      var btn = document.getElementById('showAddModelBtn');
      if (form) form.classList.toggle('hidden', !show);
      if (btn) btn.classList.toggle('hidden', show);
      if (show) {
        var input = document.getElementById('newModelIdInput');
        if (input) input.focus();
      }
    };

    window.submitAddNewModel = function() {
      var idInput = document.getElementById('newModelIdInput');
      var tagsInput = document.getElementById('newModelTagsInput');
      if (!idInput || !idInput.value.trim()) {
        window.showToast('Please enter a valid model ID.');
        return;
      }
      var newId = idInput.value.trim();
      var tags = (tagsInput && tagsInput.value.trim())
        ? tagsInput.value.split(',').map(function(t) { return t.trim(); }).filter(Boolean)
        : ['Custom'];

      var providers = window.getSavedProviders();
      var curId = window.currentSelectedProviderId || 'gemini';
      var curProv = providers.find(function(p) { return p.id === curId; });
      if (!curProv) return;

      if (!curProv.models) curProv.models = [];
      var existing = curProv.models.find(function(m) { return m.id === newId; });
      if (existing) {
        existing.tags = tags;
      } else {
        curProv.models.push({ id: newId, tags: tags });
      }

      window.saveProviders(providers);
      window.toggleAddModelForm(false);
      idInput.value = '';
      if (tagsInput) tagsInput.value = '';

      // Immediately switch to and activate newly added model
      window.switchModel(newId, newId, curProv.id);
      window.renderModelSettingsView();
      window.showToast('✓ Added model ' + newId + ' to ' + curProv.name);
    };

    window.deleteModel = function(modelId) {
      var providers = window.getSavedProviders();
      var curId = window.currentSelectedProviderId || 'gemini';
      var curProv = providers.find(function(p) { return p.id === curId; });
      if (!curProv || !curProv.models) return;

      curProv.models = curProv.models.filter(function(m) { return m.id !== modelId; });
      window.saveProviders(providers);
      window.renderModelSettingsView();
      window.showToast('Removed model ' + modelId);
    };

    window.saveProviderField = function(field, val) {
      var providers = window.getSavedProviders();
      var curId = window.currentSelectedProviderId || 'gemini';
      var curProv = providers.find(function(p) { return p.id === curId; });
      if (!curProv) return;

      curProv[field] = val;
      window.saveProviders(providers);
      window.showToast('Saved ' + field);
    };

    window.toggleProviderStatus = function(enabled) {
      var providers = window.getSavedProviders();
      var curId = window.currentSelectedProviderId || 'gemini';
      var curProv = providers.find(function(p) { return p.id === curId; });
      if (!curProv) return;

      curProv.enabled = enabled;
      window.saveProviders(providers);
      window.renderModelSettingsView();
      window.showToast(curProv.name + ' provider ' + (enabled ? 'Enabled' : 'Disabled'));
    };

    window.toggleApiKeyVisibility = function() {
      var keyInput = document.getElementById('curProviderApiKey');
      if (!keyInput) return;
      keyInput.type = (keyInput.type === 'password') ? 'text' : 'password';
    };

    window.promptAddProvider = function() {
      var name = prompt('Enter custom provider name:');
      if (!name || !name.trim()) return;
      var cleanName = name.trim();
      var cleanId = cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');

      var providers = window.getSavedProviders();
      if (providers.some(function(p) { return p.id === cleanId; })) {
        window.showToast('Provider already exists.');
        return;
      }

      providers.push({
        id: cleanId,
        name: cleanName,
        enabled: true,
        baseUrl: 'http://localhost:8080',
        apiFormat: 'openai',
        apiKey: '',
        models: []
      });

      window.saveProviders(providers);
      window.selectProvider(cleanId);
      window.showToast('Added custom provider: ' + cleanName);
    };

    window.deleteCurrentProvider = function() {
      var curId = window.currentSelectedProviderId;
      if (curId === 'openrouter' || curId === 'gemini' || curId === 'zai') {
        window.showToast('Cannot delete preset provider.');
        return;
      }
      if (!confirm('Are you sure you want to delete this provider?')) return;

      var providers = window.getSavedProviders().filter(function(p) { return p.id !== curId; });
      window.saveProviders(providers);
      window.selectProvider('gemini');
      window.showToast('Deleted provider.');
    };

    window.editProviderName = function() {
      var providers = window.getSavedProviders();
      var curId = window.currentSelectedProviderId;
      var curProv = providers.find(function(p) { return p.id === curId; });
      if (!curProv) return;

      var newName = prompt('Edit provider name:', curProv.name);
      if (newName && newName.trim()) {
        curProv.name = newName.trim();
        window.saveProviders(providers);
        window.renderModelSettingsView();
      }
    };

    window.saveGeneralProfile = function() {
      var uInput = document.getElementById('prefUsername');
      var eInput = document.getElementById('prefEmail');
      var username = (uInput && uInput.value.trim()) || 'Krishna';
      var email = (eInput && eInput.value.trim()) || 'krishna@example.com';

      var userObj = { username: username, email: email, updatedAt: new Date().toISOString() };
      localStorage.setItem('browser_agent_user', JSON.stringify(userObj));
      window.initAuthAndPreferences();
      window.showToast('Profile updated!');
    };

    window.populateTopModelPicker = function() {
      var container = document.getElementById('modelOptionsContainer');
      if (!container) return;
      container.innerHTML = '';

      var providers = window.getSavedProviders();
      var activeModel = window.state.selectedModel;

      providers.filter(function(p) { return p.enabled; }).forEach(function(prov) {
        var groupHeader = document.createElement('div');
        groupHeader.className = 'px-2 pt-1.5 pb-0.5 text-[10px] font-bold text-light-muted dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between';
        groupHeader.innerHTML = '<span>' + window.esc(prov.name) + '</span><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>';
        container.appendChild(groupHeader);

        (prov.models || []).forEach(function(m) {
          var isCur = (m.id === activeModel);
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'model-option w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-light-card dark:hover:bg-zinc-800 transition-colors cursor-pointer ' +
            (isCur ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/30' : 'text-light-text dark:text-zinc-300');

          var tags = (m.tags || []).map(function(t) {
            return '<span class="px-1.5 py-0.2 rounded text-[9px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">' + window.esc(t) + '</span>';
          }).join(' ');

          btn.innerHTML =
            '<div class="truncate mr-2">' +
              '<div class="font-semibold text-xs truncate">' + window.esc(m.id) + '</div>' +
              '<div class="flex items-center gap-1 mt-0.5">' + tags + '</div>' +
            '</div>' +
            (isCur ? '<span class="text-emerald-500 font-bold text-xs flex-shrink-0">✓</span>' : '');

          btn.onclick = function() {
            window.switchModel(m.id, m.id, prov.id);
          };
          container.appendChild(btn);
        });
      });

      // Bottom Manage Models link
      var manageBtn = document.createElement('button');
      manageBtn.type = 'button';
      manageBtn.className = 'w-full mt-1.5 pt-2 border-t border-light-border dark:border-white/10 px-2 py-1.5 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center justify-center gap-1.5';
      manageBtn.innerHTML = '<span>⚙️</span><span>Manage Models &amp; Providers</span>';
      manageBtn.onclick = function(e) {
        e.stopPropagation();
        var drop = document.getElementById('modelDropdown');
        if (drop) drop.classList.add('hidden');
        window.openSettingsModal('models');
      };
      container.appendChild(manageBtn);
    };

    window.savePreferences = function() {
      window.saveGeneralProfile();
      window.closeSettingsModal();
      window.showToast('Preferences saved successfully!');
    };

    window.logoutUser = function() {
      localStorage.removeItem('browser_agent_user');
      window.closeSettingsModal();
      var loginGate = document.getElementById('loginGate');
      if (loginGate) loginGate.classList.remove('hidden');
      window.showToast('Signed out of operator session.');
    };

    window.toggleTheme = function() {
      document.documentElement.classList.toggle('dark');
      window.showToast(document.documentElement.classList.contains('dark') ? 'Dark theme active' : 'Light theme active');
    };

    window.toggleSidebar = function(open) {
      var sidebar = document.getElementById('sidebar');
      var expandBtn = document.getElementById('expandSidebarBtn');
      if (!sidebar) return;
      if (open === false || (open === undefined && !sidebar.classList.contains('-ml-64'))) {
        sidebar.classList.add('-ml-64');
        if (expandBtn) expandBtn.classList.remove('hidden');
      } else {
        sidebar.classList.remove('-ml-64');
        if (expandBtn) expandBtn.classList.add('hidden');
      }
    };

    // Real-Time Live Speech-to-Text with Web Speech API & faster-whisper (small.en)
    window.voiceState = {
      isListening: false,
      recognition: null,
      audioContext: null,
      mediaStream: null,
      scriptProcessor: null,
      sourceNode: null,
      noiseFloor: 0.01,
      preRollBuffer: [],
      speechBuffer: [],
      isSpeaking: false,
      silenceStartTime: 0,
      speechStartTime: 0,
      basePromptText: '',
      finalTranscript: '',
      interimTranscript: '',
      hasLiveWebSpeech: false,
      lastInterimSendTime: 0,
      isInterimTranscribing: false
    };

    function encodeWavPcm16(float32Arrays, sampleRate) {
      var totalLength = 0;
      for (var i = 0; i < float32Arrays.length; i++) {
        totalLength += float32Arrays[i].length;
      }
      var flattened = new Float32Array(totalLength);
      var offset = 0;
      for (var i = 0; i < float32Arrays.length; i++) {
        flattened.set(float32Arrays[i], offset);
        offset += float32Arrays[i].length;
      }

      var buffer = new ArrayBuffer(44 + flattened.length * 2);
      var view = new DataView(buffer);

      function writeStr(offset, str) {
        for (var idx = 0; idx < str.length; idx++) {
          view.setUint8(offset + idx, str.charCodeAt(idx));
        }
      }

      writeStr(0, 'RIFF');
      view.setUint32(4, 36 + flattened.length * 2, true);
      writeStr(8, 'WAVE');
      writeStr(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // Linear PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeStr(36, 'data');
      view.setUint32(40, flattened.length * 2, true);

      var sampleOffset = 44;
      for (var j = 0; j < flattened.length; j++) {
        var s = Math.max(-1, Math.min(1, flattened[j]));
        view.setInt16(sampleOffset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        sampleOffset += 2;
      }

      return new Blob([view], { type: 'audio/wav' });
    }

    window.updateLiveTranscribingInput = function() {
      var promptInput = document.getElementById('taskPromptInput');
      if (!promptInput) return;

      var base = (window.voiceState.basePromptText || '').trim();
      var finalPart = (window.voiceState.finalTranscript || '').trim();
      var interimPart = (window.voiceState.interimTranscript || '').trim();

      var spoken = finalPart;
      if (interimPart) {
        spoken = spoken ? (spoken + ' ' + interimPart) : interimPart;
      }

      var fullText = base;
      if (spoken) {
        fullText = fullText ? (fullText + ' ' + spoken) : spoken;
      }

      promptInput.value = fullText;
      promptInput.style.height = 'auto';
      promptInput.style.height = Math.min(promptInput.scrollHeight, 144) + 'px';
      promptInput.scrollTop = promptInput.scrollHeight;

      var statusSpan = document.getElementById('liveVoiceStatus');
      if (statusSpan) {
        if (interimPart) {
          statusSpan.textContent = 'Speaking: "' + interimPart.slice(-30) + '..."';
        } else if (finalPart) {
          statusSpan.textContent = 'Captured ' + finalPart.split(/\s+/).filter(Boolean).length + ' words';
        } else {
          statusSpan.textContent = 'Listening in real-time...';
        }
      }
    };

    window.toggleVoiceListening = function() {
      if (window.voiceState.isListening) {
        window.stopVoiceListening(true);
      } else {
        window.startVoiceListening();
      }
    };

    window.startVoiceListening = function() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        window.showToast('Microphone access is not supported by your browser.');
        return;
      }

      var promptInput = document.getElementById('taskPromptInput');
      window.voiceState.basePromptText = promptInput ? promptInput.value.trim() : '';
      window.voiceState.finalTranscript = '';
      window.voiceState.interimTranscript = '';
      window.voiceState.hasLiveWebSpeech = false;
      window.voiceState.isInterimTranscribing = false;
      window.voiceState.lastInterimSendTime = 0;

      // 1. Initialize Browser SpeechRecognition for zero-latency word-by-word streaming in input field
      var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          var rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';
          rec.maxAlternatives = 1;

          rec.onstart = function() {
            window.voiceState.hasLiveWebSpeech = true;
          };

          rec.onresult = function(e) {
            if (!window.voiceState.isListening) return;
            var interim = '';
            for (var i = e.resultIndex; i < e.results.length; ++i) {
              var res = e.results[i];
              if (res.isFinal) {
                var clean = res[0].transcript.trim();
                if (clean) {
                  window.voiceState.finalTranscript += (window.voiceState.finalTranscript ? ' ' : '') + clean;
                }
                interim = '';
              } else {
                interim += res[0].transcript;
              }
            }
            window.voiceState.interimTranscript = interim;
            window.updateLiveTranscribingInput();
          };

          rec.onerror = function(e) {
            console.warn('[WebSpeech API] event:', e.error);
            if (e.error === 'not-allowed') {
              window.showToast('Microphone permission blocked.');
            }
          };

          rec.onend = function() {
            if (window.voiceState.isListening && window.voiceState.hasLiveWebSpeech) {
              try { rec.start(); } catch(err) {}
            }
          };

          rec.start();
          window.voiceState.recognition = rec;
        } catch(recErr) {
          console.warn('[WebSpeech API] failed to initialize:', recErr);
        }
      }

      // 2. Initialize Web Audio API for continuous RMS tracking, VAD, and offline Whisper recording
      navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      })
      .then(function(stream) {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        var audioCtx = new AudioCtx({ sampleRate: 16000 });
        var source = audioCtx.createMediaStreamSource(stream);
        var processor = audioCtx.createScriptProcessor(4096, 1, 1);

        window.voiceState.isListening = true;
        window.voiceState.audioContext = audioCtx;
        window.voiceState.mediaStream = stream;
        window.voiceState.sourceNode = source;
        window.voiceState.scriptProcessor = processor;
        window.voiceState.preRollBuffer = [];
        window.voiceState.speechBuffer = [];
        window.voiceState.isSpeaking = false;
        window.voiceState.silenceStartTime = 0;
        window.voiceState.speechStartTime = 0;
        window.voiceState.noiseFloor = 0.01;

        window.updateVoiceUI(true);
        window.showToast('🎙️ Live Listening... speak now');

        processor.onaudioprocess = function(e) {
          if (!window.voiceState.isListening) return;

          var input = e.inputBuffer.getChannelData(0);
          var copy = new Float32Array(input.length);
          copy.set(input);

          // 1. RMS Energy Calculation
          var sum = 0;
          for (var i = 0; i < copy.length; i++) {
            sum += copy[i] * copy[i];
          }
          var rms = Math.sqrt(sum / copy.length);

          // 2. Dynamic Noise Floor Tracking
          window.voiceState.noiseFloor = window.voiceState.noiseFloor * 0.99 + rms * 0.01;
          var speechThreshold = Math.max(0.015, window.voiceState.noiseFloor * 2.2);
          var isSpeech = rms > speechThreshold;

          if (isSpeech) {
            if (!window.voiceState.isSpeaking) {
              window.voiceState.isSpeaking = true;
              window.voiceState.speechStartTime = Date.now();
              // Prepend 768ms FIFO pre-roll slices to prevent consonant clipping
              for (var j = 0; j < window.voiceState.preRollBuffer.length; j++) {
                window.voiceState.speechBuffer.push(window.voiceState.preRollBuffer[j]);
              }
            }
            window.voiceState.speechBuffer.push(copy);
            window.voiceState.silenceStartTime = 0;

            // If WebSpeech is unavailable or not outputting, periodically send interim audio to Whisper
            if (!window.voiceState.hasLiveWebSpeech && !window.voiceState.isInterimTranscribing && Date.now() - window.voiceState.lastInterimSendTime > 1200) {
              window.voiceState.lastInterimSendTime = Date.now();
              window.sendInterimWhisperChunk();
            }
          } else {
            if (window.voiceState.isSpeaking) {
              window.voiceState.speechBuffer.push(copy);
              if (window.voiceState.silenceStartTime === 0) {
                window.voiceState.silenceStartTime = Date.now();
              } else if (Date.now() - window.voiceState.silenceStartTime > 1400) {
                // Natural pause detected -> dispatch speech segment
                window.finalizeAndSendAudio();
              }
            } else {
              // Rolling pre-roll FIFO buffer (keep 3 slices = ~768ms)
              window.voiceState.preRollBuffer.push(copy);
              if (window.voiceState.preRollBuffer.length > 3) {
                window.voiceState.preRollBuffer.shift();
              }
            }
          }
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
      })
      .catch(function(err) {
        window.showToast('Microphone access denied: ' + err.message);
        window.updateVoiceUI(false);
      });
    };

    window.sendInterimWhisperChunk = function() {
      var chunks = window.voiceState.speechBuffer;
      if (!chunks || chunks.length < 3) return;
      window.voiceState.isInterimTranscribing = true;

      var wavBlob = encodeWavPcm16(chunks, 16000);
      fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'audio/wav' },
        body: wavBlob
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        window.voiceState.isInterimTranscribing = false;
        if (data.ok && data.text && window.voiceState.isListening) {
          window.voiceState.finalTranscript = data.text.trim();
          window.voiceState.interimTranscript = '';
          window.updateLiveTranscribingInput();
        }
      })
      .catch(function() {
        window.voiceState.isInterimTranscribing = false;
      });
    };

    window.finalizeAndSendAudio = function() {
      var chunks = window.voiceState.speechBuffer;
      if (!chunks || chunks.length === 0) {
        window.voiceState.isSpeaking = false;
        window.voiceState.speechBuffer = [];
        return;
      }

      var wavBlob = encodeWavPcm16(chunks, 16000);
      window.voiceState.speechBuffer = [];
      window.voiceState.isSpeaking = false;
      window.voiceState.silenceStartTime = 0;

      window.updateVoiceUI(false, true); // Processing state

      fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'audio/wav' },
        body: wavBlob
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        window.updateVoiceUI(window.voiceState.isListening);
        if (data.ok && data.text) {
          var whisperText = data.text.trim();
          if (!window.voiceState.finalTranscript || whisperText.length > window.voiceState.finalTranscript.length) {
            window.voiceState.finalTranscript = whisperText;
            window.voiceState.interimTranscript = '';
            window.updateLiveTranscribingInput();
          }
          window.showToast('🎙️ Transcribed: "' + (window.voiceState.finalTranscript || whisperText) + '"');
        } else if (data.error) {
          console.warn('Whisper info:', data.error);
        }
      })
      .catch(function(err) {
        window.updateVoiceUI(window.voiceState.isListening);
        console.warn('Whisper fetch error:', err.message);
      });
    };

    window.stopVoiceListening = function(finalize) {
      if (finalize && window.voiceState.isSpeaking) {
        window.finalizeAndSendAudio();
      }

      window.voiceState.isListening = false;
      if (window.voiceState.recognition) {
        try {
          window.voiceState.recognition.onend = null;
          window.voiceState.recognition.stop();
        } catch(e) {}
        window.voiceState.recognition = null;
      }
      if (window.voiceState.scriptProcessor) {
        try { window.voiceState.scriptProcessor.disconnect(); } catch(e) {}
        window.voiceState.scriptProcessor = null;
      }
      if (window.voiceState.sourceNode) {
        try { window.voiceState.sourceNode.disconnect(); } catch(e) {}
        window.voiceState.sourceNode = null;
      }
      if (window.voiceState.mediaStream) {
        try {
          window.voiceState.mediaStream.getTracks().forEach(function(t) { t.stop(); });
        } catch(e) {}
        window.voiceState.mediaStream = null;
      }
      if (window.voiceState.audioContext) {
        try { window.voiceState.audioContext.close(); } catch(e) {}
        window.voiceState.audioContext = null;
      }

      // Finalize text in prompt input and place cursor at end
      window.updateLiveTranscribingInput();
      var promptInput = document.getElementById('taskPromptInput');
      if (promptInput) {
        promptInput.focus();
        promptInput.selectionStart = promptInput.selectionEnd = promptInput.value.length;
      }

      window.updateVoiceUI(false);
    };

    window.updateVoiceUI = function(isListening, isProcessing) {
      var btn = document.getElementById('voiceMicBtn');
      var icon = document.getElementById('voiceMicIcon');
      var textarea = document.getElementById('taskPromptInput');
      var liveBar = document.getElementById('liveVoiceBar');

      if (!btn || !icon) return;

      if (isProcessing) {
        icon.textContent = '⏳';
        btn.className = 'w-9 h-9 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center transition-all shadow-md cursor-wait relative z-30 animate-pulse';
        btn.title = 'Refining transcription with Whisper small.en...';
        if (textarea) textarea.placeholder = 'Finalizing voice transcription...';
        if (liveBar) liveBar.classList.remove('hidden');
      } else if (isListening) {
        icon.textContent = '🔴';
        btn.className = 'w-9 h-9 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/50 flex items-center justify-center transition-all shadow-md cursor-pointer relative z-30 animate-pulse';
        btn.title = 'Live listening... tap again to stop';
        if (textarea) textarea.placeholder = '🎙️ Listening... speak now (live transcribing in real-time)';
        if (liveBar) liveBar.classList.remove('hidden');
      } else {
        icon.textContent = '🎙️';
        btn.className = 'w-9 h-9 rounded-full bg-light-bg dark:bg-gpt-card hover:bg-emerald-500/15 text-light-muted dark:text-gpt-muted hover:text-emerald-500 border border-light-border dark:border-gpt-border flex items-center justify-center transition-all shadow-md cursor-pointer relative z-30';
        btn.title = 'Tap to speak (Live Real-Time Transcribing)';
        if (textarea) textarea.placeholder = 'Instruct the agent to search, navigate, or summarize...';
        if (liveBar) liveBar.classList.add('hidden');
      }
    };

    window.toggleModelDropdown = function(e) {
      if (e) e.stopPropagation();
      var dropdown = document.getElementById('modelDropdown');
      if (dropdown) dropdown.classList.toggle('hidden');
    };

    window.fillChip = function(task, url) {
      var input = document.getElementById('taskPromptInput');
      var urlInput = document.getElementById('startUrlInput');
      if (input) input.value = task;
      if (urlInput) urlInput.value = url || '';
      var container = document.getElementById('urlInputContainer');
      if (container) {
        if (url) container.classList.remove('hidden');
        else container.classList.add('hidden');
      }
      window.executeTaskRun();
    };

    window.openChat = function(chatId) {
      if (!chatId) return;
      if (window.location.pathname !== '/chat/agent/' + chatId) {
        history.pushState({ chatId: chatId }, '', '/chat/agent/' + chatId);
      }
      window.loadChatSession(chatId);
    };

    window.loadRecentChats = function() {
      fetch('/api/chats')
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (!data || !data.chats) return;
          var list = document.getElementById('historyList');
          if (!list) return;
          list.innerHTML = '';
          var curPath = window.location.pathname;
          var curId = curPath.indexOf('/chat/agent/') !== -1 ? curPath.split('/chat/agent/')[1].split('/')[0] : '';

          data.chats.forEach(function(chat) {
            var btn = document.createElement('button');
            btn.type = 'button';
            var isActive = (chat.id === curId);
            btn.className = 'history-item cursor-pointer w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors group ' +
              (isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-light-muted dark:text-gpt-muted hover:bg-light-card dark:hover:bg-gpt-card hover:text-light-text dark:hover:text-gpt-text');
            btn.innerHTML = '<div class="flex items-center gap-2 truncate">' +
              '<span class="text-xs">' + (chat.status === 'completed' ? '✅' : chat.status === 'running' ? '⏳' : '⚡') + '</span>' +
              '<span class="truncate">' + window.esc(chat.goal) + '</span>' +
              '</div>' +
              (isActive ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>' : '');
            btn.onclick = function() {
              window.openChat(chat.id);
            };
            list.appendChild(btn);
          });
        })
        .catch(function() {});
    };

    window.loadChatSession = function(chatId) {
      fetch('/api/chats/' + encodeURIComponent(chatId))
        .then(function(res) {
          if (!res.ok) throw new Error('Chat session not found');
          return res.json();
        })
        .then(function(session) {
          if (!session) return;
          window.state.currentChatId = session.id;

          var promptInput = document.getElementById('taskPromptInput');
          if (promptInput) promptInput.value = session.goal || '';

          var urlInput = document.getElementById('startUrlInput');
          var urlContainer = document.getElementById('urlInputContainer');
          if (urlInput && urlContainer) {
            if (session.initialUrl) {
              urlInput.value = session.initialUrl;
              urlContainer.classList.remove('hidden');
            } else {
              urlInput.value = '';
              urlContainer.classList.add('hidden');
            }
          }

          var stepMetric = document.getElementById('metricSteps');
          if (stepMetric) stepMetric.textContent = session.steps ? session.steps.length : '0';
          var elapsedMetric = document.getElementById('metricElapsed');
          if (elapsedMetric) {
            elapsedMetric.textContent = session.durationMs ? ((session.durationMs / 1000).toFixed(1) + 's') : '0.0s';
          }

          var container = document.getElementById('dynamicChatSteps');
          if (container) {
            container.innerHTML = '';

            var userBubble = document.createElement('div');
            userBubble.className = "flex items-start gap-3.5 w-full";
            userBubble.innerHTML =
              '<div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-semibold text-xs shadow-sm">U</div>' +
              '<div class="flex-1 space-y-2 min-w-0">' +
                '<div class="font-medium text-xs text-light-muted dark:text-gpt-muted">You</div>' +
                '<div class="text-sm leading-relaxed p-3.5 rounded-2xl bg-light-card dark:bg-gpt-card text-light-text dark:text-gpt-text shadow-sm border border-light-border dark:border-gpt-border">' + window.esc(session.goal) + '</div>' +
                (session.initialUrl ? '<div class="flex items-center gap-1.5 text-xs text-light-muted dark:text-gpt-muted"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-light-card dark:bg-gpt-card border border-light-border dark:border-gpt-border font-mono text-[11px] text-emerald-600 dark:text-emerald-400">🌐 ' + window.esc(session.initialUrl) + '</span></div>' : '') +
              '</div>';
            container.appendChild(userBubble);

            if (session.steps && session.steps.length) {
              session.steps.forEach(function(d, index) {
                var toolName = d.toolName || d.tool || 'Action';
                var isLearn = toolName === 'learn_prompt';

                var card = document.createElement('div');
                card.className = "flex items-start gap-3.5 w-full";

                var badgeHtml = isLearn
                  ? '<span class="learn-badge">🧠 Learn Prompt Strategy</span>'
                  : '<span class="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">#' + (d.stepNumber || (index + 1)) + ' ' + window.esc(toolName) + '</span>';

                var descHtml = isLearn
                  ? '<div class="step-desc-full">' + window.formatResultText((d.thought ? d.thought + '\\n\\n' : '') + (d.output || '')) + '</div>'
                  : '<div class="text-xs text-slate-700 dark:text-gpt-text font-medium mt-1">' + window.esc(d.thought || d.output || '') + '</div>';

                card.innerHTML =
                  '<img src="/logo.png" alt="BrowserAgent" class="w-8 h-8 rounded-xl object-cover shadow-sm ring-1 ring-emerald-500/20 flex-shrink-0">' +
                  '<div class="flex-1 space-y-1.5 min-w-0">' +
                    '<div class="flex items-center justify-between">' + badgeHtml + '<span class="text-[10px] font-mono text-light-muted dark:text-gpt-muted">' + (d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : '') + '</span></div>' +
                    descHtml +
                  '</div>';
                container.appendChild(card);
              });
            }

            if (session.finalAnswer || session.summary) {
              var doneBubble = document.createElement('div');
              doneBubble.className = "flex items-start gap-3.5 w-full";
              doneBubble.innerHTML =
                '<img src="/logo.png" alt="BrowserAgent" class="w-8 h-8 rounded-xl object-cover shadow-sm ring-1 ring-emerald-500/20 flex-shrink-0">' +
                '<div class="flex-1 space-y-2 min-w-0">' +
                  '<div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Final Result</div>' +
                  '<div class="text-sm p-4 rounded-2xl bg-light-card dark:bg-gpt-card border border-light-border dark:border-gpt-border text-light-text dark:text-gpt-text leading-relaxed whitespace-pre-wrap shadow-sm">' + window.formatResultText(session.finalAnswer || session.summary) + '</div>' +
                '</div>';
              container.appendChild(doneBubble);
            }
          }

          var rb = document.getElementById('resBadge');
          if (rb) {
            if (session.status === 'completed') {
              rb.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
              rb.innerHTML = '✅ Task Completed Successfully';
            } else if (session.status === 'failed') {
              rb.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30';
              rb.innerHTML = '❌ Task Failed';
            }
          }
          var gt = document.getElementById('resGoalTitle');
          if (gt) gt.textContent = session.goal ? ('Goal: ' + session.goal) : 'Task Overview';
          var mi = document.getElementById('resMetaInfo');
          if (mi) mi.textContent = 'Total Steps: ' + (session.steps ? session.steps.length : 0) + ' | Duration: ' + Math.round((session.durationMs || 0)/1000) + 's';
          var tc = document.getElementById('resTextContent');
          if (tc) tc.innerHTML = window.formatResultText(session.finalAnswer || session.summary || 'Session recorded.');

          if (session.snapshotTree) {
            var domViewer = document.getElementById('domTreeViewer');
            if (domViewer) domViewer.textContent = session.snapshotTree;
          }

          var jv = document.getElementById('jsonViewer');
          if (jv) jv.textContent = JSON.stringify(session, null, 2);

          if (session.finalAnswer || session.summary) {
            window.switchCanvasTab('result');
          }

          window.loadRecentChats();
          window.showToast('Loaded chat session');
        })
        .catch(function(err) {
          window.showToast('Failed to load chat: ' + err.message);
        });
    };

    window.prepareNewTask = function() {
      if (window.location.pathname !== '/') {
        history.pushState(null, '', '/');
      }
      var input = document.getElementById('taskPromptInput');
      if (input) {
        input.value = '';
        input.focus();
      }
      var urlInput = document.getElementById('startUrlInput');
      if (urlInput) urlInput.value = '';
      var container = document.getElementById('urlInputContainer');
      if (container) container.classList.add('hidden');

      var chatSteps = document.getElementById('dynamicChatSteps');
      if (chatSteps) chatSteps.innerHTML = '';

      var stepMetric = document.getElementById('metricSteps');
      if (stepMetric) stepMetric.textContent = '0';
      var elapsedMetric = document.getElementById('metricElapsed');
      if (elapsedMetric) elapsedMetric.textContent = '0.0s';

      window.switchCanvasTab('live');
      window.loadRecentChats();
      window.showToast('Ready for new task');
    };

    window.toggleUrlContainer = function(show) {
      var container = document.getElementById('urlInputContainer');
      if (!container) return;
      if (show === undefined) container.classList.toggle('hidden');
      else if (show) container.classList.remove('hidden');
      else container.classList.add('hidden');
    };

    window.copyJsonData = function() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(window.state.lastRunResult || { status: "idle" }, null, 2))
          .then(function() { window.showToast('JSON copied to clipboard!'); });
      }
    };

    window.switchTab = function(tab) {
      window.switchCanvasTab(tab);
    };

    window.switchCanvasTab = function(tab) {
      window.state.activeCanvasTab = tab;
      var tabMap = [
        { id: 'live', btn: document.getElementById('tabLiveBtn'), view: document.getElementById('viewLiveTab') },
        { id: 'result', btn: document.getElementById('tabResultBtn'), view: document.getElementById('viewResultTab') },
        { id: 'dom', btn: document.getElementById('tabDomBtn'), view: document.getElementById('viewDomTab') },
        { id: 'data', btn: document.getElementById('tabDataBtn'), view: document.getElementById('viewDataTab') }
      ];

      tabMap.forEach(function(item) {
        if (item.btn) {
          if (item.id === tab) {
            item.btn.classList.add('active');
            item.btn.classList.remove('text-light-muted', 'dark:text-gpt-muted');
          } else {
            item.btn.classList.remove('active');
            item.btn.classList.add('text-light-muted', 'dark:text-gpt-muted');
          }
        }
        if (item.view) {
          if (item.id === tab) item.view.classList.remove('hidden');
          else item.view.classList.add('hidden');
        }
      });
    };

    window.setViewMode = function(mode) {
      window.state.currentView = mode;
      var chatPane = document.getElementById('chatPane');
      var browserPane = document.getElementById('browserPane');
      var chatFeedInner = document.getElementById('chatFeedInner');
      var inputInner = document.getElementById('inputInner');

      var btnMap = [
        { id: 'split', btn: document.getElementById('viewSplitBtn') },
        { id: 'browser', btn: document.getElementById('viewBrowserBtn') },
        { id: 'chat', btn: document.getElementById('viewChatBtn') }
      ];

      btnMap.forEach(function(item) {
        if (!item.btn) return;
        if (item.id === mode) {
          item.btn.classList.add('active');
          item.btn.classList.remove('text-light-muted', 'dark:text-gpt-muted');
        } else {
          item.btn.classList.remove('active');
          item.btn.classList.add('text-light-muted', 'dark:text-gpt-muted');
        }
      });

      if (!chatPane || !browserPane) return;

      if (mode === 'split') {
        chatPane.classList.remove('hidden');
        chatPane.className = "w-full lg:w-1/2 flex flex-col h-full border-r border-light-border dark:border-gpt-border bg-light-bg dark:bg-gpt-dark relative min-w-0 transition-all duration-300 ease-in-out";
        
        browserPane.classList.remove('hidden');
        browserPane.className = "w-full lg:w-1/2 flex flex-col h-full bg-light-card/40 dark:bg-gpt-darker relative overflow-hidden min-w-0 transition-all duration-300 ease-in-out";

        if (chatFeedInner) chatFeedInner.className = "max-w-3xl mx-auto w-full space-y-6 transition-all duration-300";
        if (inputInner) inputInner.className = "max-w-3xl mx-auto space-y-2 relative z-30 transition-all duration-300";
      } else if (mode === 'browser') {
        chatPane.classList.add('hidden');
        
        browserPane.classList.remove('hidden');
        browserPane.className = "w-full flex-1 flex flex-col h-full bg-light-card/40 dark:bg-gpt-darker relative overflow-hidden min-w-0 transition-all duration-300 ease-in-out";
      } else if (mode === 'chat') {
        browserPane.classList.add('hidden');
        
        chatPane.classList.remove('hidden');
        chatPane.className = "w-full flex-1 flex flex-col h-full border-r-0 bg-light-bg dark:bg-gpt-dark relative min-w-0 transition-all duration-300 ease-in-out";

        // Center the chat feed & prompt input cleanly on screen (ChatGPT / Gemini style)
        if (chatFeedInner) chatFeedInner.className = "max-w-3xl md:max-w-4xl mx-auto w-full space-y-6 transition-all duration-300";
        if (inputInner) inputInner.className = "max-w-3xl md:max-w-4xl mx-auto space-y-2 relative z-30 transition-all duration-300";
      }
    };

    window.loadModels = function() {
      window.populateTopModelPicker();
    };

    window.initSSE = function() {
      try {
        if (window.state.sse) window.state.sse.close();
        window.state.sse = new EventSource('/api/stream');

        window.state.sse.addEventListener('status', function(e) {
          try {
            var d = JSON.parse(e.data);
            if (d.isRunning !== undefined) window.setRunningUI(d.isRunning);
            if (d.isPaused !== undefined) {
              window.state.isPaused = !!d.isPaused;
              window.updatePauseUI(window.state.isPaused);
            }
          } catch(err) {}
        });

        window.state.sse.addEventListener('start', function(e) {
          try {
            var d = JSON.parse(e.data);
            window.onRunStart(d);
          } catch(err) {}
        });

        window.state.sse.addEventListener('step', function(e) {
          try {
            var d = JSON.parse(e.data);
            window.onRunStep(d);
          } catch(err) {}
        });

        window.state.sse.addEventListener('approval_required', function(e) {
          try {
            var d = JSON.parse(e.data);
            window.state.pendingActionId = d.actionId;
            var modal = document.getElementById('approvalModal');
            var toolEl = document.getElementById('approvalTool');
            var reasonEl = document.getElementById('approvalReason');
            var previewEl = document.getElementById('approvalArgsPreview');
            if (toolEl) toolEl.textContent = d.toolName || 'Action';
            if (reasonEl) reasonEl.textContent = d.reason || 'High-risk action requires authorization';
            if (previewEl) previewEl.textContent = JSON.stringify(d.args || {});
            if (modal) modal.classList.remove('hidden');
            window.showToast('⚠️ Supervisor Approval Requested');
          } catch(err) {}
        });

        window.state.sse.addEventListener('approval_resolved', function() {
          var modal = document.getElementById('approvalModal');
          if (modal) modal.classList.add('hidden');
        });

        window.state.sse.addEventListener('frame', function(e) {
          try {
            var d = JSON.parse(e.data);
            window.onRunFrame(d);
          } catch(err) {}
        });

        window.state.sse.addEventListener('done', function(e) {
          try {
            var d = JSON.parse(e.data);
            window.onRunDone(d);
          } catch(err) {}
        });

        window.state.sse.addEventListener('error', function(e) {
          try { var d = JSON.parse(e.data); window.onRunError(d.message); } catch(ex) {}
        });

        window.state.sse.onerror = function() {
          if (window.state.sse && window.state.sse.readyState === 2) {
            setTimeout(function() { window.initSSE(); }, 2500);
          }
        };
      } catch (e) {}
    };

    window.togglePause = function() {
      var isCurrentlyPaused = window.state.isPaused;
      var endpoint = isCurrentlyPaused ? '/api/resume' : '/api/pause';
      fetch(endpoint, { method: 'POST' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          window.state.isPaused = !!data.isPaused;
          window.updatePauseUI(window.state.isPaused);
          window.showToast(data.isPaused ? '⏸ Operator execution paused' : '▶ Operator execution resumed');
        })
        .catch(function(err) {
          window.showToast('Failed to pause/resume: ' + err.message);
        });
    };

    window.updatePauseUI = function(isPaused) {
      var pauseBtn = document.getElementById('pauseAgentBtn');
      var pauseIcon = document.getElementById('pauseIcon');
      var pulse = document.getElementById('agentStatusLabel');
      if (pauseIcon) {
        pauseIcon.textContent = isPaused ? '▶' : '⏸';
      }
      if (pulse && window.state.isRunning) {
        pulse.textContent = isPaused ? 'Paused' : 'Running...';
      }
      if (pauseBtn) {
        if (isPaused) {
          pauseBtn.className = 'w-9 h-9 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all shadow-md cursor-pointer relative z-30';
          pauseBtn.title = 'Resume Execution';
        } else {
          pauseBtn.className = 'w-9 h-9 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 flex items-center justify-center transition-all shadow-md cursor-pointer relative z-30';
          pauseBtn.title = 'Pause Execution';
        }
      }
    };

    window.sendApprovalDecision = function(approved) {
      var modal = document.getElementById('approvalModal');
      if (modal) modal.classList.add('hidden');
      fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: approved, actionId: window.state.pendingActionId })
      })
      .then(function(res) { return res.json(); })
      .then(function() {
        window.showToast(approved ? '✅ Action Authorized by Supervisor' : '⛔ Action Denied by Supervisor');
      })
      .catch(function(err) {
        window.showToast('Approval submission error: ' + err.message);
      });
    };

    window.setRunningUI = function(running) {
      window.state.isRunning = running;
      var btn = document.getElementById('runAgentBtn');
      var pauseBtn = document.getElementById('pauseAgentBtn');
      var runIcon = document.getElementById('runIcon');
      var stopIcon = document.getElementById('stopIcon');
      var pulse = document.getElementById('agentStatusLabel');
      var pulseDot = document.getElementById('agentStatusPulse');

      if (!btn) return;
      if (running) {
        if (runIcon) runIcon.classList.add('hidden');
        if (stopIcon) stopIcon.classList.remove('hidden');
        btn.classList.remove('bg-emerald-500', 'hover:bg-emerald-400');
        btn.classList.add('bg-rose-500', 'hover:bg-rose-400');
        if (pauseBtn) pauseBtn.classList.remove('hidden');
        if (pulse) pulse.textContent = window.state.isPaused ? 'Paused' : 'Running...';
        if (pulseDot) pulseDot.innerHTML = '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>';
      } else {
        if (stopIcon) stopIcon.classList.add('hidden');
        if (runIcon) runIcon.classList.remove('hidden');
        btn.classList.remove('bg-rose-500', 'hover:bg-rose-400');
        btn.classList.add('bg-emerald-500', 'hover:bg-emerald-400');
        if (pauseBtn) pauseBtn.classList.add('hidden');
        window.state.isPaused = false;
        window.updatePauseUI(false);
        var modal = document.getElementById('approvalModal');
        if (modal) modal.classList.add('hidden');
        if (pulse) pulse.textContent = 'Ready';
        if (pulseDot) pulseDot.innerHTML = '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>';
        clearInterval(window.state.timerInterval);
      }
    };

    window.onRunStart = function(d) {
      window.setRunningUI(true);
      window.state.stepCount = 0;
      window.state.startTime = Date.now();
      window.addToHistory(d.goal, d.initialUrl);
      var st = document.getElementById('metricSteps'); if (st) st.textContent = '0';
      var el = document.getElementById('metricElapsed'); if (el) el.textContent = '0.0s';
      if (d.initialUrl) {
        var ur = document.getElementById('browserUrlDisplay');
        if (ur) ur.textContent = d.initialUrl;
      }

      window.state.timerInterval = setInterval(function() {
        var sec = ((Date.now() - window.state.startTime) / 1000).toFixed(1);
        var me = document.getElementById('metricElapsed');
        if (me) me.textContent = sec + 's';
      }, 100);

      var container = document.getElementById('dynamicChatSteps');
      if (container) {
        var userBubble = document.createElement('div');
        userBubble.className = "flex items-start gap-3.5 w-full animate-in fade-in";
        userBubble.innerHTML =
          '<div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-semibold text-xs shadow-sm">U</div>' +
          '<div class="flex-1 space-y-2 min-w-0">' +
            '<div class="font-medium text-xs text-light-muted dark:text-gpt-muted">You</div>' +
            '<div class="text-sm leading-relaxed p-3.5 rounded-2xl bg-light-card dark:bg-gpt-card text-light-text dark:text-gpt-text shadow-sm border border-light-border dark:border-gpt-border">' + window.esc(d.goal) + '</div>' +
            (d.initialUrl ? '<div class="flex items-center gap-1.5 text-xs text-light-muted dark:text-gpt-muted"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-light-card dark:bg-gpt-card border border-light-border dark:border-gpt-border font-mono text-[11px] text-emerald-600 dark:text-emerald-400">🌐 ' + window.esc(d.initialUrl) + '</span></div>' : '') +
          '</div>';
        container.appendChild(userBubble);
        var chatFeed = document.getElementById('chatFeed');
        if (chatFeed) chatFeed.scrollTop = chatFeed.scrollHeight;
      }

      window.switchCanvasTab('live');
    };

    window.onRunStep = function(d) {
      window.state.stepCount++;
      var st = document.getElementById('metricSteps');
      if (st) st.textContent = window.state.stepCount;

      var container = document.getElementById('dynamicChatSteps');
      if (container) {
        var toolName = d.toolName || d.tool || 'Action';
        var isLearn = toolName === 'learn_prompt';

        var card = document.createElement('div');
        card.className = "flex items-start gap-3.5 w-full animate-in fade-in";

        var badgeHtml = isLearn
          ? '<span class="learn-badge">🧠 Learn Prompt Strategy</span>'
          : '<span class="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">#' + window.state.stepCount + ' ' + window.esc(toolName) + '</span>';

        var descHtml = isLearn
          ? '<div class="step-desc-full">' + window.formatResultText((d.thought ? d.thought + '\\n\\n' : '') + (d.output || '')) + '</div>'
          : '<div class="text-xs text-slate-700 dark:text-gpt-text font-medium mt-1">' + window.esc(d.thought || d.output || '') + '</div>';

        card.innerHTML =
          '<img src="/logo.png" alt="BrowserAgent" class="w-8 h-8 rounded-xl object-cover shadow-sm ring-1 ring-emerald-500/20 flex-shrink-0">' +
          '<div class="flex-1 space-y-1.5 min-w-0">' +
            '<div class="flex items-center justify-between">' + badgeHtml + '<span class="text-[10px] font-mono text-light-muted dark:text-gpt-muted">' + new Date(d.timestamp || Date.now()).toLocaleTimeString() + '</span></div>' +
            descHtml +
          '</div>';

        container.appendChild(card);
        var chatFeed = document.getElementById('chatFeed');
        if (chatFeed) chatFeed.scrollTop = chatFeed.scrollHeight;
      }

      if (d.snapshotTree) {
        var domViewer = document.getElementById('domTreeViewer');
        if (domViewer) domViewer.textContent = d.snapshotTree;
      }
    };

    window.onRunFrame = function(d) {
      if (d.screenshotUrl) {
        var img = document.getElementById('realLiveFrame');
        var placeholder = document.getElementById('browserPlaceholder');
        if (img && placeholder) {
          img.src = d.screenshotUrl + '?t=' + Date.now();
          img.classList.remove('hidden');
          placeholder.classList.add('hidden');
        }
      }
      if (d.url) {
        var ur = document.getElementById('browserUrlDisplay');
        if (ur) ur.textContent = d.url;
      }
    };

    window.onRunDone = function(d) {
      window.setRunningUI(false);
      window.state.lastRunResult = d;

      var img = document.getElementById('realLiveFrame');
      var placeholder = document.getElementById('browserPlaceholder');
      if (img && placeholder) {
        img.classList.add('hidden');
        placeholder.classList.remove('hidden');
        placeholder.innerHTML = '<span class="text-4xl">✅</span><strong class="text-sm font-semibold">Browser Session Closed</strong><p class="text-xs max-w-xs leading-relaxed">Task completed cleanly. Output loaded in Final Result tab.</p>';
      }
      var ur = document.getElementById('browserUrlDisplay');
      if (ur) ur.textContent = 'Browser Session Closed';

      var rb = document.getElementById('resBadge');
      if (rb) {
        rb.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
        rb.innerHTML = '✅ Task Completed Successfully';
      }
      var gt = document.getElementById('resGoalTitle'); if (gt) gt.textContent = d.goal ? ('Goal: ' + d.goal) : 'Task Completed';
      var mi = document.getElementById('resMetaInfo'); if (mi) mi.textContent = 'Total Steps: ' + (d.steps ? d.steps.length : window.state.stepCount) + ' | Duration: ' + Math.round((d.durationMs || 0)/1000) + 's';
      var tc = document.getElementById('resTextContent'); if (tc) tc.innerHTML = window.formatResultText(d.finalAnswer || d.summary || 'Task completed cleanly.');

      var jv = document.getElementById('jsonViewer'); if (jv) jv.textContent = JSON.stringify(d, null, 2);

      var container = document.getElementById('dynamicChatSteps');
      if (container) {
        var doneBubble = document.createElement('div');
        doneBubble.className = "flex items-start gap-3.5 w-full animate-in fade-in";
        doneBubble.innerHTML =
          '<img src="/logo.png" alt="BrowserAgent" class="w-8 h-8 rounded-xl object-cover shadow-sm ring-1 ring-emerald-500/20 flex-shrink-0">' +
          '<div class="flex-1 space-y-2 min-w-0">' +
            '<div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Final Result</div>' +
            '<div class="text-sm p-4 rounded-2xl bg-light-card dark:bg-gpt-card border border-light-border dark:border-gpt-border text-light-text dark:text-gpt-text leading-relaxed whitespace-pre-wrap shadow-sm">' + window.formatResultText(d.finalAnswer || d.summary || 'Completed.') + '</div>' +
          '</div>';
        container.appendChild(doneBubble);
        var chatFeed = document.getElementById('chatFeed');
        if (chatFeed) chatFeed.scrollTop = chatFeed.scrollHeight;
      }

      window.switchCanvasTab('result');
      window.showToast('Task complete!');
    };

    window.onRunError = function(msg) {
      window.setRunningUI(false);
      var ur = document.getElementById('browserUrlDisplay');
      if (ur) ur.textContent = 'Session Terminated (Error)';

      var rb = document.getElementById('resBadge');
      if (rb) {
        rb.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30';
        rb.innerHTML = '❌ Execution Error';
      }
      var gt = document.getElementById('resGoalTitle'); if (gt) gt.textContent = 'Task Error';
      var mi = document.getElementById('resMetaInfo'); if (mi) mi.textContent = 'Stopped after ' + window.state.stepCount + ' steps';
      var tc = document.getElementById('resTextContent'); if (tc) tc.textContent = msg || 'Execution error encountered.';

      window.switchCanvasTab('result');
      window.showToast('Run error: ' + (msg || 'Error'));
    };

    window.executeTaskRun = function() {
      if (window.state.isRunning) {
        fetch('/api/stop', { method: 'POST' })
          .then(function() { window.showToast('Stopping agent run...'); });
        return;
      }

      var user = window.getSavedUser();
      if (!user) {
        var loginGate = document.getElementById('loginGate');
        if (loginGate) loginGate.classList.remove('hidden');
        window.showToast('Please sign in to run tasks.');
        return;
      }

      var promptInput = document.getElementById('taskPromptInput');
      if (!promptInput) return;
      var goal = promptInput.value.trim();
      if (!goal) {
        window.showToast('Please enter a task prompt goal.');
        return;
      }

      var startInput = document.getElementById('startUrlInput');
      var url = (startInput && startInput.value.trim()) ? startInput.value.trim() : undefined;
      var prefs = window.getSavedPreferences();

      // Clear prompt input immediately upon submission
      promptInput.value = '';
      promptInput.style.height = 'auto';

      var providers = window.getSavedProviders();
      var activeModel = window.state.selectedModel || prefs.model;
      var activeProvider = providers.find(function(p) {
        return (p.models || []).some(function(m) { return m.id === activeModel; });
      }) || providers[0];

      fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: goal,
          url: url,
          model: activeModel,
          headless: prefs.headless !== undefined ? prefs.headless : true,
          slowMo: prefs.slowMo !== undefined ? parseInt(prefs.slowMo, 10) : 50,
          apiKey: (activeProvider && activeProvider.apiKey && activeProvider.apiKey.trim()) ? activeProvider.apiKey.trim() : ((prefs.apiKey && prefs.apiKey.trim()) ? prefs.apiKey.trim() : undefined),
          baseUrl: activeProvider ? activeProvider.baseUrl : undefined
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.error) {
          window.showToast('Error: ' + data.error);
        } else if (data.chatId) {
          window.state.currentChatId = data.chatId;
          history.pushState({ chatId: data.chatId }, '', '/chat/agent/' + data.chatId);
          window.loadRecentChats();
        }
      })
      .catch(function(err) { window.showToast('Failed to start run.'); });
    };

    function initApp() {
      try { window.initAuthAndPreferences(); } catch (e) {}
      try { window.loadModels(); } catch (e) {}
      try { window.initSSE(); } catch (e) {}
      try { window.loadRecentChats(); } catch (e) {}

      var path = window.location.pathname;
      if (path.indexOf('/chat/agent/') !== -1) {
        var chatId = path.split('/chat/agent/')[1].split('/')[0];
        if (chatId) {
          window.loadChatSession(chatId);
        }
      }

      window.addEventListener('popstate', function() {
        var p = window.location.pathname;
        if (p.indexOf('/chat/agent/') !== -1) {
          var id = p.split('/chat/agent/')[1].split('/')[0];
          if (id) window.loadChatSession(id);
        } else {
          window.prepareNewTask();
        }
      });

      document.addEventListener('click', function(e) {
        var dropdown = document.getElementById('modelDropdown');
        var picker = document.getElementById('modelPickerBtn');
        if (dropdown && picker && !picker.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      });

      window.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          var input = document.getElementById('taskPromptInput');
          if (input) input.focus();
        }
        var taskInput = document.getElementById('taskPromptInput');
        if (e.key === 'Enter' && !e.shiftKey && document.activeElement === taskInput) {
          e.preventDefault();
          window.executeTaskRun();
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  </script>
</body>
</html>`;
}

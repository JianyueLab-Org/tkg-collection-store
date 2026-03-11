<script lang="ts">
  import { onMount } from 'svelte';

  // ── flip state ─────────────────────────────────────────────────────────────
  let isRegister = false;   // false = login (front), true = register (back)

  // ── login form ─────────────────────────────────────────────────────────────
  let loginEmail    = '';
  let loginPassword = '';
  let loginLoading  = false;
  let loginError    = '';
  let loginSuccess  = '';
  let showLoginPwd  = false;

  // ── register form ──────────────────────────────────────────────────────────
  let regUsername   = '';
  let regEmail      = '';
  let regPassword   = '';
  let regConfirm    = '';
  let regNickname   = '';
  let regLoading    = false;
  let regError      = '';
  let regSuccess    = '';
  let showRegPwd    = false;
  let showRegConf   = false;
  let agreeTerms    = false;

  // ── paper-grain SVG filter id hack (SSR safe) ──────────────────────────────
  let mounted = false;
  onMount(() => { mounted = true; });

  // ── helpers ────────────────────────────────────────────────────────────────
  function validateEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  // ── API: LOGIN ─────────────────────────────────────────────────────────────
  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    loginError = ''; loginSuccess = '';
    if (!validateEmail(loginEmail)) { loginError = '请输入有效的邮箱地址'; return; }
    if (loginPassword.length < 6)   { loginError = '密码至少 6 位'; return; }
    loginLoading = true;
    try {
      // TODO: 替换为真实 API 端点
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? '登录失败');
      loginSuccess = '登录成功！正在跳转…';
      // TODO: 保存 token / 跳转
      // localStorage.setItem('token', data.token);
      // goto('/');
    } catch (err: any) {
      loginError = err.message ?? '网络错误，请稍后重试';
    } finally {
      loginLoading = false;
    }
  }

  // ── API: REGISTER ──────────────────────────────────────────────────────────
  async function handleRegister(e: SubmitEvent) {
    e.preventDefault();
    regError = ''; regSuccess = '';
    if (!regUsername.trim())           { regError = '请填写用户名'; return; }
    if (!validateEmail(regEmail))      { regError = '请输入有效的邮箱地址'; return; }
    if (regPassword.length < 8)        { regError = '密码至少 8 位'; return; }
    if (regPassword !== regConfirm)    { regError = '两次密码输入不一致'; return; }
    if (!agreeTerms)                   { regError = '请阅读并同意服务条款'; return; }
    regLoading = true;
    try {
      // TODO: 替换为真实 API 端点
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          nickname: regNickname || regUsername,
          email: regEmail,
          password: regPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? '注册失败');
      regSuccess = '注册成功！请前往登录 ✉️';
      setTimeout(() => { isRegister = false; }, 1800);
    } catch (err: any) {
      regError = err.message ?? '网络错误，请稍后重试';
    } finally {
      regLoading = false;
    }
  }
</script>

<!-- ═══════════════════════════════════════════════════════════════════════════
     PAGE SHELL
═══════════════════════════════════════════════════════════════════════════ -->
<div class="auth-bg min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

  <!-- ── ambient blobs ────────────────────────────────────────────────────── -->
  <div class="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full
    bg-gradient-to-br from-rose-200 to-pink-100 opacity-40 blur-3xl pointer-events-none"></div>
  <div class="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full
    bg-gradient-to-br from-purple-200 to-blue-100 opacity-40 blur-3xl pointer-events-none"></div>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full
    bg-gradient-to-r from-rose-100/30 via-purple-100/20 to-blue-100/30 blur-3xl pointer-events-none"></div>

  <!-- ── wireframe grid bg ─────────────────────────────────────────────────── -->
  <svg class="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="auth-grid" width="52" height="52" patternUnits="userSpaceOnUse">
        <path d="M 52 0 L 0 0 0 52" fill="none" stroke="#7c3aed" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#auth-grid)"/>
  </svg>

  <!-- ── paper grain ───────────────────────────────────────────────────────── -->
  <svg class="absolute inset-0 w-full h-full opacity-[0.022] mix-blend-multiply pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <filter id="page-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#page-grain)" fill="#831843"/>
  </svg>

  <!-- ── logo + back link ──────────────────────────────────────────────────── -->
  <a href="/" class="relative z-10 flex items-center gap-2 mb-10 group">
    <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600
      flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488
             m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51
             m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98
             l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"/>
      </svg>
    </span>
    <span class="font-extrabold text-2xl tracking-tight">
      <span class="text-rose-500">TKG</span><span class="text-purple-700">Store</span>
    </span>
  </a>

  <!-- ─────────────────────────────────────────────────────────────────────────
       POSTCARD 3-D FLIP CONTAINER
  ───────────────────────────────────────────────────────────────────────────── -->
  <div class="postcard-scene relative z-10" style="perspective: 1400px;">

    <!-- overflowing stamp — top right, breaks grid -->
    <div class="absolute -top-7 -right-5 z-20 rotate-12 pointer-events-none drop-shadow-xl">
      <div class="stamp-widget w-14 h-[4.5rem] border-[2.5px] border-rose-400 rounded-sm
        bg-gradient-to-b from-rose-50 to-pink-50 relative overflow-hidden
        flex flex-col items-center justify-center gap-0.5">
        <svg class="absolute inset-0 w-full h-full opacity-[0.07] mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
          <filter id="s1-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#s1-grain)" fill="#831843"/>
        </svg>
        <div class="perf-top absolute top-0 left-0 right-0 flex justify-between px-0.5 -translate-y-1/2">
          {#each [0,1,2,3,4,5] as _}
            <div class="w-1.5 h-1.5 rounded-full bg-white border border-rose-300"></div>
          {/each}
        </div>
        <div class="perf-bot absolute bottom-0 left-0 right-0 flex justify-between px-0.5 translate-y-1/2">
          {#each [0,1,2,3,4,5] as _}
            <div class="w-1.5 h-1.5 rounded-full bg-white border border-rose-300"></div>
          {/each}
        </div>
        <span class="text-xl relative z-10">🌸</span>
        <span class="text-[8px] font-mono font-bold text-rose-500 relative z-10">TKG</span>
        <span class="text-[7px] text-rose-300 relative z-10">¥80</span>
      </div>
    </div>

    <!-- overflowing postmark — bottom left -->
    <div class="absolute -bottom-6 -left-8 z-20 -rotate-6 pointer-events-none">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" class="opacity-50">
        <circle cx="32" cy="32" r="30" stroke="#7c3aed" stroke-width="1.5"/>
        <circle cx="32" cy="32" r="24" stroke="#7c3aed" stroke-width="0.8"/>
        <line x1="6"  y1="32" x2="58" y2="32" stroke="#7c3aed" stroke-width="1.2"/>
        <text x="32" y="28" text-anchor="middle" font-size="6" fill="#7c3aed" font-family="monospace" font-weight="bold">TKG STORE</text>
        <text x="32" y="38" text-anchor="middle" font-size="5" fill="#7c3aed" font-family="monospace">2026</text>
      </svg>
    </div>

    <!-- THE POSTCARD FLIP CARD -->
    <div
      class="postcard-card"
      style="transform: rotateY({isRegister ? 180 : 0}deg);"
    >

      <!-- ════════════════════════════════════════════════════════════════════
           FRONT — LOGIN
      ═════════════════════════════════════════════════════════════════════ -->
      <div class="postcard-face postcard-front">

        <!-- paper grain -->
        <svg class="abs-grain opacity-[0.045] mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
          <filter id="front-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#front-grain)" fill="#831843"/>
        </svg>

        <!-- red-edge accent bar (top) -->
        <div class="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl
          bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500"></div>

        <!-- card inner layout: left form | right address column -->
        <div class="relative z-10 flex h-full pt-5">

          <!-- LEFT — form area -->
          <div class="flex-1 flex flex-col justify-between px-7 py-4 border-r border-dashed border-rose-200/70">

            <!-- header -->
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xl">✉️</span>
                <h2 class="text-xl font-black text-slate-800 tracking-tight">欢迎回来</h2>
              </div>
              <p class="text-xs text-slate-400 mb-5 font-mono tracking-wide">CORRESPONDENCE · LOGIN</p>

              <form on:submit={handleLogin} class="space-y-4" novalidate>
                <!-- email -->
                <div class="field-wrap">
                  <label class="field-label" for="l-email">📧 邮箱地址</label>
                  <input
                    id="l-email"
                    type="email"
                    bind:value={loginEmail}
                    placeholder="your@email.com"
                    autocomplete="email"
                    class="field-input"
                    required
                  />
                </div>

                <!-- password -->
                <div class="field-wrap">
                  <label class="field-label" for="l-pwd">🔑 密码</label>
                  <div class="relative">
                    <input
                      id="l-pwd"
                      type={showLoginPwd ? 'text' : 'password'}
                      bind:value={loginPassword}
                      placeholder="••••••••"
                      autocomplete="current-password"
                      class="field-input pr-10"
                      required
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                      on:click={() => showLoginPwd = !showLoginPwd}
                      aria-label="切换密码可见"
                    >
                      {#if showLoginPwd}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                        </svg>
                      {:else}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      {/if}
                    </button>
                  </div>
                </div>

                <!-- remember + forgot -->
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <label class="flex items-center gap-1.5 cursor-pointer select-none">
                    <input type="checkbox" class="rounded border-slate-300 text-rose-500 focus:ring-rose-400 w-3.5 h-3.5"/>
                    记住我
                  </label>
                  <a href="/auth/forgot" class="text-rose-500 hover:text-rose-600 font-medium transition-colors">忘记密码？</a>
                </div>

                <!-- feedback -->
                {#if loginError}
                  <div class="feedback-error">{loginError}</div>
                {/if}
                {#if loginSuccess}
                  <div class="feedback-success">{loginSuccess}</div>
                {/if}

                <!-- submit -->
                <button
                  type="submit"
                  disabled={loginLoading}
                  class="btn-primary w-full"
                >
                  {#if loginLoading}
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    登录中…
                  {:else}
                    寄出登录信 ✉️
                  {/if}
                </button>
              </form>
            </div>

            <!-- OAuth divider -->
            <div class="mt-4">
              <div class="flex items-center gap-3 mb-3">
                <div class="flex-1 h-px bg-slate-200"></div>
                <span class="text-[10px] text-slate-400 font-mono tracking-widest">OR</span>
                <div class="flex-1 h-px bg-slate-200"></div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <!-- TODO: wire up OAuth providers -->
                <button class="oauth-btn" type="button">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button class="oauth-btn" type="button">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="#1DB954">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          </div>

          <!-- RIGHT — address column (classic postcard right side) -->
          <div class="w-36 flex flex-col justify-between px-4 py-4 flex-shrink-0">
            <!-- top: stamp area -->
            <div class="flex flex-col items-end gap-2">
              <div class="w-14 h-16 border-2 border-dashed border-rose-300 rounded bg-rose-50/60
                flex flex-col items-center justify-center gap-0.5 relative overflow-hidden">
                <svg class="absolute inset-0 w-full h-full opacity-[0.06] mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
                  <filter id="stamp-r-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
                  <feColorMatrix type="saturate" values="0"/></filter>
                  <rect width="100%" height="100%" filter="url(#stamp-r-grain)" fill="#831843"/>
                </svg>
                <span class="text-2xl relative z-10">🌸</span>
                <span class="text-[8px] text-rose-400 font-mono relative z-10">TKG</span>
              </div>
              <!-- postmark circle -->
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" class="opacity-30 -mt-1 -mr-1">
                <circle cx="22" cy="22" r="20" stroke="#7c3aed" stroke-width="1.2"/>
                <circle cx="22" cy="22" r="15" stroke="#7c3aed" stroke-width="0.7" fill="none"/>
                <line x1="4" y1="22" x2="40" y2="22" stroke="#7c3aed" stroke-width="1"/>
                <text x="22" y="19.5" text-anchor="middle" font-size="4.5" fill="#7c3aed" font-family="monospace">LOGIN</text>
                <text x="22" y="26" text-anchor="middle" font-size="4" fill="#7c3aed" font-family="monospace">2026</text>
              </svg>
            </div>

            <!-- middle: address lines -->
            <div class="space-y-1.5 my-2">
              <p class="text-[9px] text-slate-400 font-mono uppercase tracking-widest mb-1">收件人</p>
              {#each [55,48,52,44] as w}
                <div class="h-1 rounded-full bg-slate-200" style="width:{w}%"></div>
              {/each}
            </div>

            <!-- bottom: flip to register -->
            <button
              type="button"
              on:click={() => isRegister = true}
              class="flip-hint-btn text-center"
            >
              <span class="text-[9px] font-mono text-purple-400 block leading-tight">还没有账户？</span>
              <span class="text-[10px] font-bold text-purple-600 flex items-center justify-center gap-0.5 mt-0.5">
                翻转注册
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════════
           BACK — REGISTER
      ═════════════════════════════════════════════════════════════════════ -->
      <div class="postcard-face postcard-back">

        <!-- paper grain -->
        <svg class="abs-grain opacity-[0.045] mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
          <filter id="back-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.71" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#back-grain)" fill="#4c1d95"/>
        </svg>

        <!-- purple-edge accent bar (top) -->
        <div class="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl
          bg-gradient-to-r from-purple-500 via-blue-500 to-rose-500"></div>

        <div class="relative z-10 flex h-full pt-5">

          <!-- LEFT — form area -->
          <div class="flex-1 flex flex-col px-7 py-4 border-r border-dashed border-purple-200/70">

            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl">📮</span>
              <h2 class="text-xl font-black text-slate-800 tracking-tight">创建账户</h2>
            </div>
            <p class="text-xs text-slate-400 mb-4 font-mono tracking-wide">NEW CORRESPONDENT · REGISTER</p>

            <form on:submit={handleRegister} class="space-y-3 flex-1" novalidate>

              <!-- row: username + nickname -->
              <div class="grid grid-cols-2 gap-3">
                <div class="field-wrap">
                  <label class="field-label" for="r-username">👤 用户名 <span class="text-rose-400">*</span></label>
                  <input
                    id="r-username"
                    type="text"
                    bind:value={regUsername}
                    placeholder="tkg_user"
                    autocomplete="username"
                    class="field-input"
                    required
                  />
                </div>
                <div class="field-wrap">
                  <label class="field-label" for="r-nickname">✨ 昵称</label>
                  <input
                    id="r-nickname"
                    type="text"
                    bind:value={regNickname}
                    placeholder="高木桑"
                    autocomplete="nickname"
                    class="field-input"
                  />
                </div>
              </div>

              <!-- email -->
              <div class="field-wrap">
                <label class="field-label" for="r-email">📧 邮箱地址 <span class="text-rose-400">*</span></label>
                <input
                  id="r-email"
                  type="email"
                  bind:value={regEmail}
                  placeholder="your@email.com"
                  autocomplete="email"
                  class="field-input"
                  required
                />
              </div>

              <!-- row: password + confirm -->
              <div class="grid grid-cols-2 gap-3">
                <div class="field-wrap">
                  <label class="field-label" for="r-pwd">🔑 密码 <span class="text-rose-400">*</span></label>
                  <div class="relative">
                    <input
                      id="r-pwd"
                      type={showRegPwd ? 'text' : 'password'}
                      bind:value={regPassword}
                      placeholder="至少8位"
                      autocomplete="new-password"
                      class="field-input pr-9"
                      required
                    />
                    <button type="button" on:click={() => showRegPwd = !showRegPwd}
                      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-500 transition-colors" aria-label="切换">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        {#if showRegPwd}
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                        {:else}
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        {/if}
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="field-wrap">
                  <label class="field-label" for="r-conf">🔒 确认密码 <span class="text-rose-400">*</span></label>
                  <div class="relative">
                    <input
                      id="r-conf"
                      type={showRegConf ? 'text' : 'password'}
                      bind:value={regConfirm}
                      placeholder="再输一遍"
                      autocomplete="new-password"
                      class="field-input pr-9"
                      required
                    />
                    <button type="button" on:click={() => showRegConf = !showRegConf}
                      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-500 transition-colors" aria-label="切换">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        {#if showRegConf}
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                        {:else}
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        {/if}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- password strength bar -->
              {#if regPassword}
                {@const strength = regPassword.length < 8 ? 1 : regPassword.length < 12 ? 2 : /[A-Z]/.test(regPassword) && /\d/.test(regPassword) ? 4 : 3}
                <div class="space-y-1">
                  <div class="flex gap-1">
                    {#each [1,2,3,4] as lvl}
                      <div class="flex-1 h-1 rounded-full transition-all duration-300
                        {lvl <= strength
                          ? strength === 1 ? 'bg-red-400'
                          : strength === 2 ? 'bg-amber-400'
                          : strength === 3 ? 'bg-blue-400'
                          : 'bg-green-400'
                          : 'bg-slate-200'}">
                      </div>
                    {/each}
                  </div>
                  <p class="text-[10px] {strength===1?'text-red-400':strength===2?'text-amber-500':strength===3?'text-blue-500':'text-green-500'}">
                    {strength===1?'弱 — 太短了':strength===2?'一般 — 建议更长':strength===3?'良好 — 可以更强':'强 💪'}
                  </p>
                </div>
              {/if}

              <!-- terms -->
              <label class="flex items-start gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  bind:checked={agreeTerms}
                  class="mt-0.5 rounded border-slate-300 text-purple-500 focus:ring-purple-400 w-3.5 h-3.5 flex-shrink-0"
                />
                <span class="text-[11px] text-slate-500 leading-tight group-hover:text-slate-700 transition-colors">
                  我已阅读并同意
                  <a href="/terms" class="text-purple-500 hover:text-purple-600 underline underline-offset-2">服务条款</a>
                  与
                  <a href="/privacy" class="text-purple-500 hover:text-purple-600 underline underline-offset-2">隐私政策</a>
                </span>
              </label>

              <!-- feedback -->
              {#if regError}
                <div class="feedback-error">{regError}</div>
              {/if}
              {#if regSuccess}
                <div class="feedback-success">{regSuccess}</div>
              {/if}

              <!-- submit -->
              <button
                type="submit"
                disabled={regLoading}
                class="btn-primary-purple w-full"
              >
                {#if regLoading}
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  注册中…
                {:else}
                  投递注册信 📮
                {/if}
              </button>
            </form>
          </div>

          <!-- RIGHT — address column -->
          <div class="w-36 flex flex-col justify-between px-4 py-4 flex-shrink-0">
            <!-- stamp -->
            <div class="flex flex-col items-end gap-2">
              <div class="w-14 h-16 border-2 border-dashed border-purple-300 rounded bg-purple-50/60
                flex flex-col items-center justify-center gap-0.5 relative overflow-hidden">
                <svg class="absolute inset-0 w-full h-full opacity-[0.06] mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
                  <filter id="stamp-back-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
                  <feColorMatrix type="saturate" values="0"/></filter>
                  <rect width="100%" height="100%" filter="url(#stamp-back-grain)" fill="#4c1d95"/>
                </svg>
                <span class="text-2xl relative z-10">📮</span>
                <span class="text-[8px] text-purple-400 font-mono relative z-10">TKG</span>
              </div>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" class="opacity-30 -mt-1 -mr-1">
                <circle cx="22" cy="22" r="20" stroke="#7c3aed" stroke-width="1.2"/>
                <circle cx="22" cy="22" r="15" stroke="#7c3aed" stroke-width="0.7" fill="none"/>
                <line x1="4" y1="22" x2="40" y2="22" stroke="#7c3aed" stroke-width="1"/>
                <text x="22" y="19.5" text-anchor="middle" font-size="4" fill="#7c3aed" font-family="monospace">REGISTER</text>
                <text x="22" y="26" text-anchor="middle" font-size="4" fill="#7c3aed" font-family="monospace">2026</text>
              </svg>
            </div>

            <!-- address lines placeholder -->
            <div class="space-y-1.5 my-2">
              <p class="text-[9px] text-slate-400 font-mono uppercase tracking-widest mb-1">新账户</p>
              {#each [55,48,52,44,50] as w}
                <div class="h-1 rounded-full bg-slate-200" style="width:{w}%"></div>
              {/each}
            </div>

            <!-- flip back to login -->
            <button
              type="button"
              on:click={() => isRegister = false}
              class="flip-hint-btn text-center"
            >
              <span class="text-[9px] font-mono text-rose-400 block leading-tight">已有账户？</span>
              <span class="text-[10px] font-bold text-rose-600 flex items-center justify-center gap-0.5 mt-0.5">
                翻回登录
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

    </div><!-- end .postcard-card -->
  </div><!-- end .postcard-scene -->

  <!-- bottom tagline -->
  <p class="relative z-10 mt-10 text-xs text-slate-400 font-mono tracking-widest text-center">
    TKG STORE · SINCE 2018 · 每张明信片都是一段旅程
  </p>

</div>

<!-- ══════════════════════════════════════════════════════════════════════════
     STYLES
══════════════════════════════════════════════════════════════════════════ -->
<style>
  /* ── page background ──────────────────────────────────────────────────── */
  .auth-bg {
    background: linear-gradient(145deg, #fdf2f8 0%, #faf5ff 40%, #eff6ff 100%);
  }

  /* ── postcard scene ───────────────────────────────────────────────────── */
  .postcard-scene {
    width: min(720px, 96vw);
  }

  .postcard-card {
    position: relative;
    width: 100%;
    height: 400px;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
    filter:
      drop-shadow(0 24px 40px rgba(244,63,94,0.13))
      drop-shadow(0 8px 16px rgba(124,58,237,0.10))
      drop-shadow(0 2px 4px rgba(0,0,0,0.06));
  }

  /* ── faces ────────────────────────────────────────────────────────────── */
  .postcard-face {
    position: absolute;
    inset: 0;
    border-radius: 1.25rem;
    background: #fffdf9;
    border: 1.5px solid #fce7f3;
    backface-visibility: hidden;
    overflow: hidden;
    /* subtle inner shadow for depth */
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.9),
      inset 0 -1px 0 rgba(0,0,0,0.03);
  }

  .postcard-back {
    transform: rotateY(180deg);
    border-color: #ede9fe;
  }

  /* ── grain overlay helper ─────────────────────────────────────────────── */
  .abs-grain {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* ── fields ───────────────────────────────────────────────────────────── */
  .field-wrap { display: flex; flex-direction: column; gap: 0.25rem; }

  .field-label {
    font-size: 0.625rem;
    font-weight: 600;
    color: #64748b;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .field-input {
    width: 100%;
    padding: 0.45rem 0.65rem;
    border-radius: 0.625rem;
    border: 1.5px solid #e2e8f0;
    background: rgba(255,255,255,0.7);
    font-size: 0.8125rem;
    color: #1e293b;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    /* neumorphism inset */
    box-shadow: inset 2px 2px 4px rgba(0,0,0,0.04), inset -1px -1px 3px rgba(255,255,255,0.9);
  }
  .field-input:focus {
    border-color: #f43f5e;
    box-shadow: 0 0 0 3px rgba(244,63,94,0.12), inset 2px 2px 4px rgba(0,0,0,0.04);
  }
  .field-input::placeholder { color: #cbd5e1; }

  /* ── buttons ──────────────────────────────────────────────────────────── */
  .btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.6rem 1rem;
    border-radius: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #f43f5e, #a855f7);
    box-shadow: 0 4px 14px rgba(244,63,94,0.28), 0 2px 6px rgba(168,85,247,0.18);
    transition: all 0.2s;
    cursor: pointer;
    border: none;
  }
  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #e11d48, #9333ea);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(244,63,94,0.32);
  }
  .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

  .btn-primary-purple {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.6rem 1rem;
    border-radius: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #a855f7, #3b82f6);
    box-shadow: 0 4px 14px rgba(168,85,247,0.28), 0 2px 6px rgba(59,130,246,0.18);
    transition: all 0.2s;
    cursor: pointer;
    border: none;
  }
  .btn-primary-purple:hover:not(:disabled) {
    background: linear-gradient(135deg, #9333ea, #2563eb);
    transform: translateY(-1px);
  }
  .btn-primary-purple:disabled { opacity: 0.65; cursor: not-allowed; }

  .oauth-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.45rem 0.5rem;
    border-radius: 0.625rem;
    border: 1.5px solid #e2e8f0;
    background: rgba(255,255,255,0.8);
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: all 0.18s;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.04), -1px -1px 4px rgba(255,255,255,0.9);
  }
  .oauth-btn:hover {
    border-color: #f43f5e;
    color: #e11d48;
    transform: translateY(-1px);
  }

  .flip-hint-btn {
    padding: 0.5rem 0.375rem;
    border-radius: 0.625rem;
    border: 1px dashed #c4b5fd;
    background: rgba(245,243,255,0.6);
    cursor: pointer;
    transition: all 0.18s;
    width: 100%;
  }
  .flip-hint-btn:hover {
    background: rgba(237,233,254,0.9);
    border-color: #a78bfa;
    transform: scale(1.02);
  }

  /* ── feedback ─────────────────────────────────────────────────────────── */
  .feedback-error {
    padding: 0.4rem 0.65rem;
    border-radius: 0.5rem;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #e11d48;
    font-size: 0.7rem;
    font-weight: 500;
  }
  .feedback-success {
    padding: 0.4rem 0.65rem;
    border-radius: 0.5rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #16a34a;
    font-size: 0.7rem;
    font-weight: 500;
  }

  /* ── stamp widget ─────────────────────────────────────────────────────── */
  .stamp-widget {
    /* left/right perf shadow */
    box-shadow: -2px 0 0 0 rgba(244,63,94,0.15), 2px 0 0 0 rgba(244,63,94,0.15);
  }

  /* ── mobile responsive ────────────────────────────────────────────────── */
  @media (max-width: 520px) {
    .postcard-card { height: 520px; }
    .postcard-face .flex { flex-direction: column; }
    .postcard-face .w-36 {
      width: 100%;
      flex-direction: row;
      border-right: none;
      border-top: 1px dashed #e2e8f0;
      padding: 0.75rem 1.25rem;
    }
  }
</style>


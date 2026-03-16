<script lang="ts">
  import Footer from "$lib/Footer.svelte";
  import Navbar from "$lib/Navbar.svelte";
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  import { auth } from '$lib/stores/auth.js';
  import { page } from '$app/stores';

  // ── state: mode switch ──────────────────────────────────────────────────
  let mode: 'login' | 'register' = 'login';
  let flipPhase: 'idle' | 'out' | 'in' = 'idle';

  // ── state: login form ───────────────────────────────────────────────────
  let loginEmail = '';
  let loginPassword = '';
  let showLoginPwd = false;
  let loginLoading = false;
  let loginError = '';
  let loginSuccess = '';

  // ── state: register form ────────────────────────────────────────────────
  let regUsername = '';
  let regEmail = '';
  let regNickname = '';
  let regPassword = '';
  let regConfirm = '';
  let showRegPwd = false;
  let showRegConf = false;
  let regLoading = false;
  let regError = '';
  let regSuccess = '';
  let agreeTerms = false;
  let pwdStrength = 0;

  // ── methods ─────────────────────────────────────────────────────────────

  // Toggle between Login / Register with 3D flip animation
  async function switchMode() {
    if (flipPhase !== 'idle') return;

    // 1. Flip OUT
    flipPhase = 'out';
    await new Promise(r => setTimeout(r, 280));

    // 2. Change content
    mode = mode === 'login' ? 'register' : 'login';
    // reset form states
    loginError = ''; loginSuccess = '';
    regError = ''; regSuccess = '';

    // 3. Flip IN
    flipPhase = 'in';
    await new Promise(r => setTimeout(r, 50)); // tiny delay to let DOM update
    flipPhase = 'idle';
  }

  // Password Strength Logic (simple heuristic)
  $: {
    if (!regPassword) pwdStrength = 0;
    else {
      let score = 0;
      if (regPassword.length > 5) score++;
      if (regPassword.length > 8) score++;
      if (/[A-Z]/.test(regPassword)) score++;
      if (/[0-9]/.test(regPassword)) score++;
      if (/[^a-zA-Z0-9]/.test(regPassword)) score++;
      pwdStrength = Math.min(score, 4);
    }
  }

  const strengthLabel = ["", "太弱", "一般", "不错", "极其强悍"];
  const strengthColor = ["", "text-red-500", "text-orange-500", "text-blue-500", "text-green-600"];
  const strengthBarColor = ["", "bg-red-400", "bg-orange-400", "bg-blue-400", "bg-green-500"];

  // LOGIN Handler
  async function handleLogin(e: Event) {
    e.preventDefault();
    if (loginLoading) return;

    // basic validation
    if (!loginEmail || !loginPassword) {
      loginError = "请输入邮箱和密码";
      return;
    }

    loginLoading = true;
    loginError = '';
    loginSuccess = '';

    try {
      const payload = { username: loginEmail, password: loginPassword };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        loginSuccess = "登录成功！正在跳转...";

        // Use auth store
        auth.login(data.user, data.token);

        // Get redirect loop
        const from = $page.url.searchParams.get('from') || '/';

        setTimeout(() => {
          goto(from);
        }, 800);
      } else {
        loginError = data.error || "登录失败，请检查凭证";
      }

    } catch (err) {
      console.error(err);
      loginError = "网络连接错误，请稍后重试";
    } finally {
      loginLoading = false;
    }
  }

  // REGISTER Handler
  async function handleRegister(e: Event) {
    e.preventDefault();
    if (regLoading) return;

    // validation
    if (!regUsername || !regEmail || !regPassword) {
      regError = "请填写所有必填项";
      return;
    }
    if (regPassword !== regConfirm) {
      regError = "两次输入的密码不一致";
      return;
    }
    if (!agreeTerms) {
      regError = "请阅读并同意服务条款";
      return;
    }
    if (regPassword.length < 8) {
        regError = "密码长度至少需要8位";
        return;
    }

    regLoading = true;
    regError = '';
    regSuccess = '';

    try {
      const payload = {
          username: regUsername,
          password: regPassword,
          email: regEmail
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        regSuccess = "注册成功！即将为您切换到登录...";
        setTimeout(async () => {
           // Auto fill login
           loginEmail = regUsername;
           loginPassword = '';
           // Switch to login view
           await switchMode();
        }, 1200);
      } else {
        regError = data.error || "注册失败，请换个用户名试试";
      }

    } catch (err) {
      console.error(err);
      regError = "网络连接错误，请稍后重试";
    } finally {
      regLoading = false;
    }
  }

  let isFlipping = false;
  // let username = ''; // Removed unused
  // let password = ''; // Removed unused

  // 3D 旋转相关的状态
  let rotateY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let cardElement: HTMLElement; // Added type annotation

  function handleMouseMove(e: MouseEvent) { // Added type annotation
    if (!cardElement) return; // Guard clause
    const { clientX, clientY } = e;
    const { left, top, width, height } = cardElement.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 2;
    const y = ((clientY - top) / height - 0.5) * 2;
    mouseX = x;
    mouseY = y;
    rotateY = x * 15; // 控制旋转角度
  }

  // const cardStyle = { // Removed unused
  //   transform: `rotateY(${rotateY}deg)`,
  // };

  onMount(() => {
    const handle = (e: MouseEvent) => { // Added type annotation
      if (isFlipping) return;
      // We need to check if mouse is over cardElement to mimic previous logic roughly or just attach to window?
      // Actually previous logic attached to window but used cardElement.
      // If cardElement is null onMount (which shouldn't happen if bound correctly), we should check.
      if(cardElement) {
          // Check if mouse is within card bounds if needed, or just calculate parallax
           handleMouseMove(e);
      }
    };
    window.addEventListener('mousemove', handle as any); // Cast to any to satisfy TS listener requirement if strict
    return () => window.removeEventListener('mousemove', handle as any);
  });
</script>

<!-- ═══════════════════════════════════════════════════ PAGE ═══════════════ -->
<Navbar />
<div class="auth-page">

  <!-- ambient blobs -->
  <div class="blob blob-rose"></div>
  <div class="blob blob-purple"></div>
  <div class="blob blob-blue"></div>

  <!-- wireframe grid -->
  <svg class="wf-grid" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="ag" width="52" height="52" patternUnits="userSpaceOnUse">
        <path d="M52 0L0 0 0 52" fill="none" stroke="#7c3aed" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#ag)"/>
  </svg>

  <!-- paper grain -->
  <svg class="pg" xmlns="http://www.w3.org/2000/svg">
    <filter id="pg-f">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#pg-f)" fill="#831843"/>
  </svg>

  <!-- ── logo ─────────────────────────────────────────────────────────────── -->
  <a href="/" class="logo-link">
    <span class="logo-icon">
      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25
             0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0
             00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25
             2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25
             2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"/>
      </svg>
    </span>
    <span class="logo-text"><span class="text-rose-500">TKG</span><span class="text-purple-700">Store</span></span>
  </a>

  <!-- ══════════════════════════════════════════════════════════════════════
       POSTCARD CARD
  ═══════════════════════════════════════════════════════════════════════ -->
  <div class="card-scene">

    <!-- overflow stamps / postmarks — always visible -->
    <div class="ovr-stamp ovr-stamp-tr" aria-hidden="true">
      <div class="stamp stamp-rose">
        <svg class="abs-grain" xmlns="http://www.w3.org/2000/svg">
          <filter id="st1g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#st1g)" fill="#831843"/>
        </svg>
        {#each [0,1,2,3,4,5] as _}<div class="perf perf-t"></div>{/each}
        {#each [0,1,2,3,4,5] as _}<div class="perf perf-b"></div>{/each}
        <span class="stamp-emoji">🌸</span>
        <span class="stamp-label">TKG</span>
        <span class="stamp-price">¥80</span>
      </div>
    </div>

    <div class="ovr-postmark ovr-pm-bl" aria-hidden="true">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" class="opacity-50">
        <circle cx="32" cy="32" r="30" stroke="#7c3aed" stroke-width="1.5"/>
        <circle cx="32" cy="32" r="24" stroke="#7c3aed" stroke-width="0.8"/>
        <line x1="6" y1="32" x2="58" y2="32" stroke="#7c3aed" stroke-width="1.2"/>
        <text x="32" y="28" text-anchor="middle" font-size="6" fill="#7c3aed" font-family="monospace" font-weight="bold">TKG STORE</text>
        <text x="32" y="38" text-anchor="middle" font-size="5" fill="#7c3aed" font-family="monospace">2026</text>
      </svg>
    </div>

    <!-- THE CARD -->
    <div class="postcard"
      bind:this={cardElement}
      class:flip-out={flipPhase === 'out'}
      class:flip-in={flipPhase === 'in'}
    >

      <!-- paper grain on card -->
      <svg class="abs-grain card-grain" xmlns="http://www.w3.org/2000/svg">
        <filter id="cg">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#cg)" fill="{mode === 'login' ? '#831843' : '#4c1d95'}"/>
      </svg>

      <!-- colour top bar — reacts to mode -->
      <div class="top-bar" class:top-bar-login={mode === 'login'} class:top-bar-reg={mode === 'register'}></div>

      <!-- ── INNER LAYOUT: left form | dashed divider | right address col ── -->
      <div class="card-inner">

        <!-- ────────────────────────── LEFT: FORM ────────────────────────── -->
        <div class="form-col">

          {#if mode === 'login'}
          <!-- ════════════ LOGIN FORM ════════════ -->
          <div class="form-header">
            <span class="form-icon">✉️</span>
            <div>
              <h2 class="form-title">欢迎回来</h2>
              <p class="form-sub">CORRESPONDENCE · LOGIN</p>
            </div>
          </div>

          <form on:submit={handleLogin} class="form-body" novalidate>
            <!-- email -->
            <div class="field">
              <label class="label" for="l-email">📧 邮箱地址</label>
              <input id="l-email" type="email" bind:value={loginEmail}
                placeholder="your@email.com" autocomplete="email"
                class="input" required/>
            </div>

            <!-- password -->
            <div class="field">
              <label class="label" for="l-pwd">🔑 密码</label>
              <div class="input-wrap">
                <input id="l-pwd" type={showLoginPwd ? 'text' : 'password'}
                  bind:value={loginPassword} placeholder="••••••••"
                  autocomplete="current-password" class="input pr-9" required/>
                <button type="button" class="eye-btn"
                  on:click={() => showLoginPwd = !showLoginPwd} aria-label="切换可见">
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
            <div class="row-between">
              <label class="check-label">
                <input type="checkbox" class="check-box"/> 记住我
              </label>
              <a href="/auth/forgot" class="link-rose text-xs">忘记密码？</a>
            </div>

            <!-- feedback -->
            {#if loginError}<div class="fb-err">{loginError}</div>{/if}
            {#if loginSuccess}<div class="fb-ok">{loginSuccess}</div>{/if}

            <!-- submit -->
            <button type="submit" disabled={loginLoading} class="btn btn-rose">
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

            <!-- OAuth -->
            <div class="oauth-row">
              <div class="divider"><div class="div-line"></div><span class="div-txt">OR</span><div class="div-line"></div></div>
              <div class="oauth-btns">
                <!-- TODO: wire OAuth -->
                <button type="button" class="oauth-btn">
                  <svg class="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button type="button" class="oauth-btn">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          </form>

          {:else}
          <!-- ════════════ REGISTER FORM ════════════ -->
          <div class="form-header">
            <span class="form-icon">📮</span>
            <div>
              <h2 class="form-title">创建账户</h2>
              <p class="form-sub">NEW CORRESPONDENT · REGISTER</p>
            </div>
          </div>

          <form on:submit={handleRegister} class="form-body" novalidate>
            <!-- username + nickname -->
            <div class="grid-2">
              <div class="field">
                <label class="label" for="r-user">👤 用户名 <span class="text-rose-400">*</span></label>
                <input id="r-user" type="text" bind:value={regUsername}
                  placeholder="tkg_user" autocomplete="username" class="input" required/>
              </div>
              <div class="field">
                <label class="label" for="r-nick">✨ 昵称</label>
                <input id="r-nick" type="text" bind:value={regNickname}
                  placeholder="高木桑" autocomplete="nickname" class="input"/>
              </div>
            </div>

            <!-- email -->
            <div class="field">
              <label class="label" for="r-email">📧 邮箱地址 <span class="text-rose-400">*</span></label>
              <input id="r-email" type="email" bind:value={regEmail}
                placeholder="your@email.com" autocomplete="email" class="input" required/>
            </div>

            <!-- password + confirm -->
            <div class="grid-2">
              <div class="field">
                <label class="label" for="r-pwd">🔑 密码 <span class="text-rose-400">*</span></label>
                <div class="input-wrap">
                  <input id="r-pwd" type={showRegPwd ? 'text' : 'password'}
                    bind:value={regPassword} placeholder="至少8位"
                    autocomplete="new-password" class="input pr-9" required/>
                  <button type="button" class="eye-btn"
                    on:click={() => showRegPwd = !showRegPwd} aria-label="切换">
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
              <div class="field">
                <label class="label" for="r-conf">🔒 确认密码 <span class="text-rose-400">*</span></label>
                <div class="input-wrap">
                  <input id="r-conf" type={showRegConf ? 'text' : 'password'}
                    bind:value={regConfirm} placeholder="再输一遍"
                    autocomplete="new-password" class="input pr-9" required/>
                  <button type="button" class="eye-btn"
                    on:click={() => showRegConf = !showRegConf} aria-label="切换">
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

            <!-- password strength -->
            {#if regPassword}
              <div class="pwd-strength">
                <div class="pwd-bars">
                  {#each [1,2,3,4] as lvl}
                    <div class="pwd-bar {lvl <= pwdStrength ? strengthBarColor[pwdStrength] : 'bg-slate-200'}"></div>
                  {/each}
                </div>
                <p class="text-[10px] {strengthColor[pwdStrength]}">{strengthLabel[pwdStrength]}</p>
              </div>
            {/if}

            <!-- terms -->
            <label class="terms-label">
              <input type="checkbox" bind:checked={agreeTerms} class="check-box"/>
              <span class="text-[11px] text-slate-500 leading-tight">
                我已阅读并同意
                <a href="/terms" class="link-purple">服务条款</a> 与
                <a href="/privacy" class="link-purple">隐私政策</a>
              </span>
            </label>

            <!-- feedback -->
            {#if regError}<div class="fb-err">{regError}</div>{/if}
            {#if regSuccess}<div class="fb-ok">{regSuccess}</div>{/if}

            <!-- submit -->
            <button type="submit" disabled={regLoading} class="btn btn-purple">
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
          {/if}

        </div><!-- /form-col -->

        <!-- ─────────────── RIGHT: ADDRESS COLUMN ─────────────────────── -->
        <div class="addr-col">

          <!-- stamp + postmark -->
          <div class="addr-top">
            <div class="addr-stamp" class:addr-stamp-reg={mode === 'register'}>
              <svg class="abs-grain" xmlns="http://www.w3.org/2000/svg">
                <filter id="as-g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
                <feColorMatrix type="saturate" values="0"/></filter>
                <rect width="100%" height="100%" filter="url(#as-g)" fill="{mode === 'login' ? '#831843' : '#4c1d95'}"/>
              </svg>
              <span class="text-xl relative z-10">{mode === 'login' ? '🌸' : '📮'}</span>
              <span class="text-[8px] font-mono relative z-10" class:text-rose-400={mode==='login'} class:text-purple-400={mode==='register'}>TKG</span>
            </div>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" class="opacity-25 mt-1 self-end">
              <circle cx="20" cy="20" r="18" stroke="#7c3aed" stroke-width="1.2"/>
              <circle cx="20" cy="20" r="13" stroke="#7c3aed" stroke-width="0.7" fill="none"/>
              <line x1="4" y1="20" x2="36" y2="20" stroke="#7c3aed" stroke-width="1"/>
              <text x="20" y="18" text-anchor="middle" font-size="4.5" fill="#7c3aed" font-family="monospace">{mode === 'login' ? 'LOGIN' : 'REGIST'}</text>
              <text x="20" y="24" text-anchor="middle" font-size="4" fill="#7c3aed" font-family="monospace">2026</text>
            </svg>
          </div>

          <!-- address lines -->
          <div class="addr-lines">
            <p class="addr-title">收件人</p>
            {#each [55,48,52,44,50] as w}
              <div class="addr-line" style="width:{w}%"></div>
            {/each}
          </div>

          <!-- switch button -->
          <button type="button" class="switch-btn" class:switch-btn-reg={mode === 'register'}
            on:click={switchMode} disabled={flipPhase !== 'idle'}>
            {#if mode === 'login'}
              <span class="switch-hint">还没有账户？</span>
              <span class="switch-action switch-action-purple">
                翻转注册
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
              </span>
            {:else}
              <span class="switch-hint" style="color:#f87171;">已有账户？</span>
              <span class="switch-action switch-action-rose">
                翻回登录
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
              </span>
            {/if}
          </button>

        </div><!-- /addr-col -->
      </div><!-- /card-inner -->
    </div><!-- /postcard -->
  </div><!-- /card-scene -->
</div>
<Footer />

<!-- ═════════════════════════════════════════════════════════ STYLES ════════ -->
<style>
  /* ── page ──────────────────────────────────────────────── */
  .auth-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    background: linear-gradient(145deg, #fdf2f8 0%, #faf5ff 45%, #eff6ff 100%);
    position: relative;
    overflow: hidden;
  }

  /* blobs */
  .blob {
    position: absolute;
    border-radius: 9999px;
    pointer-events: none;
    filter: blur(80px);
    opacity: 0.38;
  }
  .blob-rose   { top:-10rem;  left:-10rem;  width:28rem; height:28rem; background:radial-gradient(circle,#fda4af,#fce7f3); }
  .blob-purple { bottom:-8rem;right:-8rem;  width:24rem; height:24rem; background:radial-gradient(circle,#c4b5fd,#ede9fe); }
  .blob-blue   { top:50%;left:50%; transform:translate(-50%,-50%); width:38rem; height:18rem; background:radial-gradient(ellipse,#bfdbfe,transparent); opacity:0.22; }

  /* wireframe grid */
  .wf-grid {
    position: absolute; inset: 0; width: 100%; height: 100%;
    opacity: 0.035; pointer-events: none;
  }

  /* paper grain overlay */
  .pg {
    position: absolute; inset: 0; width: 100%; height: 100%;
    opacity: 0.022; mix-blend-mode: multiply; pointer-events: none;
  }

  /* ── logo ───────────────────────────────────────────────── */
  .logo-link {
    position: relative; z-index: 10;
    display: flex; align-items: center; gap: 0.5rem;
    margin-bottom: 2.5rem; text-decoration: none;
  }
  .logo-icon {
    width: 2.25rem; height: 2.25rem; border-radius: 0.625rem;
    background: linear-gradient(135deg, #f43f5e, #a855f7);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(244,63,94,0.3);
    transition: transform 0.2s;
  }
  .logo-link:hover .logo-icon { transform: scale(1.1); }
  .logo-text { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.03em; }

  /* ── card scene ─────────────────────────────────────────── */
  .card-scene {
    position: relative; z-index: 10;
    width: min(720px, 96vw);
  }

  /* ── overflow decorations ───────────────────────────────── */
  .ovr-stamp { position: absolute; z-index: 20; pointer-events: none; }
  .ovr-stamp-tr { top: -1.75rem; right: -1.25rem; transform: rotate(12deg); }

  .stamp {
    width: 3.5rem; height: 4.5rem;
    border: 2.5px solid;
    border-radius: 2px;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
    position: relative; overflow: hidden;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  }
  .stamp-rose { border-color: #f43f5e; background: linear-gradient(to bottom,#fff1f2,#fce7f3); }

  .perf { position: absolute; width: 6px; height: 6px; border-radius: 9999px; background: white; border: 1px solid; }
  .perf-t { top: -3px; border-color: #fda4af; }
  .perf-b { bottom: -3px; border-color: #fda4af; }
  /* distribute perfs evenly via nth-child */
  .perf:nth-child(1)  { left: 2px; }
  .perf:nth-child(2)  { left: 20%; }
  .perf:nth-child(3)  { left: 40%; }
  .perf:nth-child(4)  { left: 60%; }
  .perf:nth-child(5)  { left: 80%; }
  .perf:nth-child(6)  { right: 2px; }
  .perf:nth-child(7)  { left: 2px; }
  .perf:nth-child(8)  { left: 20%; }
  .perf:nth-child(9)  { left: 40%; }
  .perf:nth-child(10) { left: 60%; }
  .perf:nth-child(11) { left: 80%; }
  .perf:nth-child(12) { right: 2px; }

  .stamp-emoji { font-size: 1.35rem; position: relative; z-index: 10; }
  .stamp-label { font-size: 0.5rem; font-family: monospace; font-weight: 700; color: #f43f5e; position: relative; z-index: 10; }
  .stamp-price { font-size: 0.44rem; color: #fda4af; position: relative; z-index: 10; }

  .ovr-postmark { position: absolute; z-index: 20; pointer-events: none; }
  .ovr-pm-bl { bottom: -1.5rem; left: -2rem; transform: rotate(-6deg); }

  /* ── THE POSTCARD ───────────────────────────────────────── */
  .postcard {
    position: relative;
    border-radius: 1.25rem;
    background: #fffdf9;
    border: 1.5px solid #fce7f3;
    overflow: hidden;
    /* neumorphic lift */
    box-shadow:
      0 24px 48px rgba(244,63,94,0.12),
      0 8px 20px rgba(124,58,237,0.09),
      0 2px 6px rgba(0,0,0,0.06),
      inset 0 1px 0 rgba(255,255,255,0.9);
    /* flip animation target */
    transform-origin: center center;
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.6, 1);
  }

  /* flip-out: fold card away (0 → 90deg, squash width) */
  .postcard.flip-out {
    transform: rotateY(90deg) scaleX(0.6);
    opacity: 0.7;
  }
  /* flip-in: unfold from 90 → 0 */
  .postcard.flip-in {
    transform: rotateY(0deg) scaleX(1);
    opacity: 1;
    transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.4, 1);
  }

  /* abs grain helper */
  .abs-grain {
    position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;
  }
  .card-grain { opacity: 0.045; mix-blend-mode: multiply; }

  /* top colour bar */
  .top-bar {
    position: absolute; top: 0; left: 0; right: 0;
    height: 5px; border-radius: 1.25rem 1.25rem 0 0;
    transition: background 0.4s ease;
  }
  .top-bar-login  { background: linear-gradient(90deg,#f43f5e,#a855f7,#3b82f6); }
  .top-bar-reg    { background: linear-gradient(90deg,#a855f7,#3b82f6,#f43f5e); }

  /* ── card inner layout ──────────────────────────────────── */
  .card-inner {
    display: flex; height: 100%; padding-top: 1.25rem;
  }

  /* form column */
  .form-col {
    flex: 1; display: flex; flex-direction: column;
    padding: 0.75rem 1.5rem 1rem;
    border-right: 1.5px dashed rgba(244,63,94,0.25);
    min-height: 440px;
    overflow: hidden;
  }

  /* form header */
  .form-header {
    display: flex; align-items: center; gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .form-icon { font-size: 1.25rem; line-height: 1; }
  .form-title { font-size: 1.2rem; font-weight: 900; color: #1e293b; letter-spacing: -0.02em; }
  .form-sub   { font-size: 0.6rem; color: #94a3b8; font-family: monospace; letter-spacing: 0.1em; margin-top: 1px; }

  /* form body */
  .form-body { display: flex; flex-direction: column; gap: 0.7rem; flex: 1; }

  /* fields */
  .field  { display: flex; flex-direction: column; gap: 0.2rem; }
  .label  { font-size: 0.6rem; font-weight: 700; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; }
  .input-wrap { position: relative; }
  .input {
    width: 100%; padding: 0.42rem 0.7rem;
    border-radius: 0.625rem; border: 1.5px solid #e2e8f0;
    background: rgba(255,255,255,0.75); font-size: 0.8125rem; color: #1e293b;
    outline: none; transition: border-color 0.18s, box-shadow 0.18s;
    box-shadow: inset 2px 2px 4px rgba(0,0,0,0.04), inset -1px -1px 3px rgba(255,255,255,0.9);
    box-sizing: border-box;
  }
  .input:focus {
    border-color: #f43f5e;
    box-shadow: 0 0 0 3px rgba(244,63,94,0.11), inset 2px 2px 4px rgba(0,0,0,0.04);
  }
  .input::placeholder { color: #cbd5e1; }
  .pr-9 { padding-right: 2.25rem; }

  .eye-btn {
    position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%);
    color: #94a3b8; background: none; border: none; cursor: pointer; padding: 0; display: flex;
    transition: color 0.15s;
  }
  .eye-btn:hover { color: #f43f5e; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

  /* row helpers */
  .row-between { display: flex; align-items: center; justify-content: space-between; }
  .check-label { display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; color: #64748b; cursor: pointer; user-select: none; }
  .check-box   { width: 0.8rem; height: 0.8rem; border-radius: 3px; border: 1.5px solid #cbd5e1; accent-color: #f43f5e; }
  .link-rose   { color: #f43f5e; font-weight: 600; text-decoration: none; transition: color 0.15s; }
  .link-rose:hover { color: #e11d48; }
  .link-purple { color: #a855f7; text-decoration: underline; text-underline-offset: 2px; }

  /* feedback */
  .fb-err { padding: 0.35rem 0.6rem; border-radius: 0.5rem; background: #fff1f2; border: 1px solid #fecdd3; color: #e11d48; font-size: 0.7rem; font-weight: 500; }
  .fb-ok  { padding: 0.35rem 0.6rem; border-radius: 0.5rem; background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; font-size: 0.7rem; font-weight: 500; }

  /* buttons */
  .btn {
    display: flex; align-items: center; justify-content: center; gap: 0.375rem;
    padding: 0.58rem 1rem; border-radius: 0.75rem;
    font-size: 0.8125rem; font-weight: 700; color: white;
    border: none; cursor: pointer; transition: all 0.2s;
  }
  .btn:disabled { opacity: 0.65; cursor: not-allowed; }
  .btn-rose   { background: linear-gradient(135deg,#f43f5e,#a855f7); box-shadow: 0 4px 14px rgba(244,63,94,0.28); }
  .btn-rose:hover:not(:disabled)   { background: linear-gradient(135deg,#e11d48,#9333ea); transform: translateY(-1px); }
  .btn-purple { background: linear-gradient(135deg,#a855f7,#3b82f6); box-shadow: 0 4px 14px rgba(168,85,247,0.28); }
  .btn-purple:hover:not(:disabled) { background: linear-gradient(135deg,#9333ea,#2563eb); transform: translateY(-1px); }

  /* OAuth */
  .oauth-row  { margin-top: auto; }
  .divider    { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
  .div-line   { flex: 1; height: 1px; background: #e2e8f0; }
  .div-txt    { font-size: 0.6rem; color: #94a3b8; font-family: monospace; letter-spacing: 0.12em; }
  .oauth-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
  .oauth-btn  {
    display: flex; align-items: center; justify-content: center; gap: 0.35rem;
    padding: 0.42rem 0.5rem; border-radius: 0.6rem;
    border: 1.5px solid #e2e8f0; background: rgba(255,255,255,0.8);
    font-size: 0.73rem; font-weight: 600; color: #475569;
    cursor: pointer; transition: all 0.18s;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.04), -1px -1px 4px rgba(255,255,255,0.9);
  }
  .oauth-btn:hover { border-color: #f43f5e; color: #e11d48; transform: translateY(-1px); }

  /* password strength */
  .pwd-strength { display: flex; flex-direction: column; gap: 0.2rem; }
  .pwd-bars { display: flex; gap: 0.2rem; }
  .pwd-bar  { flex: 1; height: 3px; border-radius: 9999px; transition: background 0.3s; }

  /* terms */
  .terms-label { display: flex; align-items: flex-start; gap: 0.4rem; cursor: pointer; user-select: none; }

  /* ── address column ─────────────────────────────────────── */
  .addr-col {
    width: 8.5rem; flex-shrink: 0;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 0.75rem 0.9rem 1rem;
  }
  .addr-top { display: flex; flex-direction: column; align-items: flex-end; gap: 0.35rem; }

  .addr-stamp {
    width: 3.25rem; height: 4rem;
    border: 2px dashed #fda4af; border-radius: 3px;
    background: rgba(255,241,242,0.7);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
    position: relative; overflow: hidden; transition: border-color 0.3s, background 0.3s;
  }
  .addr-stamp-reg { border-color: #c4b5fd; background: rgba(245,243,255,0.7); }

  .addr-lines { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 0.35rem; margin: 0.5rem 0; }
  .addr-title { font-size: 0.55rem; color: #94a3b8; font-family: monospace; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.15rem; }
  .addr-line  { height: 3px; border-radius: 9999px; background: #e2e8f0; }

  /* switch button */
  .switch-btn {
    width: 100%; padding: 0.5rem 0.4rem;
    border-radius: 0.625rem; border: 1px dashed #c4b5fd;
    background: rgba(245,243,255,0.6);
    cursor: pointer; transition: all 0.18s; text-align: center;
  }
  .switch-btn:hover:not(:disabled) { background: rgba(237,233,254,0.9); border-color: #a78bfa; transform: scale(1.02); }
  .switch-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .switch-btn-reg { border-color: #fda4af; background: rgba(255,241,242,0.6); }
  .switch-btn-reg:hover:not(:disabled) { background: rgba(255,228,230,0.9); border-color: #f43f5e; }

  .switch-hint   { font-size: 0.56rem; font-family: monospace; color: #a78bfa; display: block; line-height: 1.3; }
  .switch-action { font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 2px; margin-top: 2px; }
  .switch-action-purple { color: #7c3aed; }
  .switch-action-rose   { color: #e11d48; }


</style>

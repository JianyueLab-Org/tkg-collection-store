<script lang="ts">
  import Navbar from '$lib/Navbar.svelte';
  import Footer from '$lib/Footer.svelte';
  import { onMount } from 'svelte';

  // ── Floating widget ────────────────────────────────────────────────────────
  let widgetOpen = false;
  let widgetMessage = '';
  let widgetMessages: { from: 'user' | 'bot'; text: string }[] = [
    { from: 'bot', text: '你好！欢迎来到高木桑收藏品店 ✨ 想了解明信片代寄或邮路测试，还是收藏品选购？' }
  ];
  function sendMessage() {
    if (!widgetMessage.trim()) return;
    widgetMessages = [...widgetMessages, { from: 'user', text: widgetMessage }];
    const q = widgetMessage;
    widgetMessage = '';
    setTimeout(() => {
      widgetMessages = [...widgetMessages, {
        from: 'bot',
        text: q.includes('代寄') || q.includes('寄出')
          ? '我们支持从全球多个城市代寄明信片，您只需选好卡片和寄出方式，其余交给我们！🌍'
          : q.includes('价格') || q.includes('多少钱')
          ? '明信片零售价从 ¥5 起，代寄服务含邮资套餐，详情请见商店区域～'
          : q.includes('邮票') || q.includes('集邮')
          ? '我们有来自30+国家的精选邮票，欢迎浏览「邮票珍藏」区 🏷️'
          : '感谢您的提问！我们的团队会尽快为您解答 🌸'
      }];
    }, 600);
  }

  // ── Hero 3D postcard ───────────────────────────────────────────────────────
  let cardRotateY = -20;
  let cardRotateX = 5;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let autoRotate = true;
  let animFrame: number;

  function startAutoRotate() {
    function tick() {
      if (autoRotate) {
        cardRotateY += 0.4;
        if (cardRotateY > 360) cardRotateY -= 360;
      }
      animFrame = requestAnimationFrame(tick);
    }
    animFrame = requestAnimationFrame(tick);
  }

  function onCardMouseDown(e: MouseEvent) {
    isDragging = true;
    autoRotate = false;
    lastX = e.clientX;
    lastY = e.clientY;
  }
  function onWinMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    cardRotateY += dx * 0.5;
    cardRotateX -= dy * 0.3;
    cardRotateX = Math.max(-30, Math.min(30, cardRotateX));
    lastX = e.clientX;
    lastY = e.clientY;
  }
  function onWinMouseUp() {
    if (isDragging) {
      isDragging = false;
      setTimeout(() => { autoRotate = true; }, 2000);
    }
  }
  function onCardTouchStart(e: TouchEvent) {
    isDragging = true;
    autoRotate = false;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }
  function onCardTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - lastX;
    const dy = e.touches[0].clientY - lastY;
    cardRotateY += dx * 0.5;
    cardRotateX -= dy * 0.3;
    cardRotateX = Math.max(-30, Math.min(30, cardRotateX));
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }
  function onCardTouchEnd() {
    isDragging = false;
    setTimeout(() => { autoRotate = true; }, 2000);
  }

  // ── Global mail route cities ───────────────────────────────────────────────
  const cities = [
    { x: 120, y: 60, name: '东京', flag: '🇯🇵' },
    { x: 320, y: 90, name: '北京', flag: '🇨🇳' },
    { x: 480, y: 140, name: '巴黎', flag: '🇫🇷' },
    { x: 600, y: 80, name: '纽约', flag: '🇺🇸' },
    { x: 60, y: 130, name: '首尔', flag: '🇰🇷' },
    { x: 200, y: 160, name: '上海', flag: '🇨🇳' },
    { x: 380, y: 170, name: '伦敦', flag: '🇬🇧' },
    { x: 560, y: 155, name: '悉尼', flag: '🇦🇺' },
    { x: 640, y: 110, name: '洛杉矶', flag: '🇺🇸' },
  ];

  const mailRoutes = [
    { x1: 120, y1: 60, x2: 320, y2: 90, color: '#f43f5e', dur: '3' },
    { x1: 320, y1: 90, x2: 480, y2: 140, color: '#a78bfa', dur: '4' },
    { x1: 480, y1: 140, x2: 600, y2: 80, color: '#60a5fa', dur: '3.5' },
    { x1: 60, y1: 130, x2: 200, y2: 160, color: '#f43f5e', dur: '2.5' },
    { x1: 200, y1: 160, x2: 380, y2: 170, color: '#a78bfa', dur: '4.5' },
    { x1: 380, y1: 170, x2: 560, y2: 155, color: '#60a5fa', dur: '3' },
    { x1: 560, y1: 155, x2: 640, y2: 110, color: '#f43f5e', dur: '2' },
    { x1: 120, y1: 60, x2: 60, y2: 130, color: '#a78bfa', dur: '2.8' },
    { x1: 640, y1: 110, x2: 600, y2: 80, color: '#60a5fa', dur: '2.2' },
  ];

  // ── Stats ──────────────────────────────────────────────────────────────────
  let statsVisible = false;
  let statsRef: HTMLElement;

  onMount(() => {
    startAutoRotate();
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) statsVisible = true;
    }, { threshold: 0.3 });
    if (statsRef) obs.observe(statsRef);
    window.addEventListener('mouseup', onWinMouseUp);
    window.addEventListener('mousemove', onWinMouseMove);
    return () => {
      cancelAnimationFrame(animFrame);
      obs.disconnect();
      window.removeEventListener('mouseup', onWinMouseUp);
      window.removeEventListener('mousemove', onWinMouseMove);
    };
  });

  const gallery = [
    { emoji: '🗼', title: '巴黎铁塔', year: '1965', color: 'from-rose-100 to-pink-100', border: 'border-rose-200' },
    { emoji: '🧨', title: '春节特刊', year: '1987', color: 'from-purple-100 to-violet-100', border: 'border-purple-200' },
    { emoji: '🏰', title: '梅关古道', year: '1972', color: 'from-blue-100 to-indigo-100', border: 'border-blue-200' },
    { emoji: '🌉', title: '长江大桥', year: '1958', color: 'from-rose-100 to-purple-100', border: 'border-rose-200' },
    { emoji: '🏔️', title: '五岳四季', year: '1981', color: 'from-blue-100 to-rose-100', border: 'border-blue-200' },
    { emoji: '🕌', title: '特色建筑', year: '1963', color: 'from-purple-100 to-blue-100', border: 'border-purple-200' },
  ];

  const shopItems = [
    { type: '明信片', name: '世界遗产系列', price: '¥8', emoji: '🏛️', tag: '热销', tagColor: 'bg-rose-500' },
    { type: '信封信纸', name: '复古牛皮纸套装', price: '¥28', emoji: '✉️', tag: '新品', tagColor: 'bg-blue-500' },
    { type: '邮票', name: '2025邮票册', price: '¥158', emoji: '🏷️', tag: '珍藏', tagColor: 'bg-purple-500' },
    { type: '明信片', name: '浮世绘限定款', price: '¥15', emoji: '🎨', tag: '限量', tagColor: 'bg-rose-500' },
    { type: '邮票', name: '首日封', price: '¥288', emoji: '📮', tag: '珍藏', tagColor: 'bg-purple-500' },
    { type: '礼盒套装', name: '代寄旅行套装', price: '¥68', emoji: '🎁', tag: '包邮', tagColor: 'bg-blue-500' },
  ];

  const stats = [
    { value: '3+', label: '代寄城市' },
    { value: '8,00+', label: '明信片在库' },
    { value: '10+', label: '经测试有效邮路' },
    { value: '99%', label: '好评率' },
  ];

  const mailSteps = [
    { step: '01', icon: '🗺️', title: '选择目的地', desc: '可以选择全球目的地（只要目的地地区可达）' },
    { step: '02', icon: '🎴', title: '挑选明信片', desc: '浏览精选库存，选一张最能代表心意的明信片' },
    { step: '03', icon: '✍️', title: '撰写寄语', desc: '留下您想说的话，我们为您手写或打印在卡片背面' },
    { step: '04', icon: '📬', title: '追踪邮路', desc: '若选择挂号追踪，实时查看您的明信片正在哪段旅程中' },
  ];
</script>

<Navbar />

<!-- ===== HERO ===== -->
<section class="relative min-h-screen flex items-center overflow-hidden bg-white pt-20">
  <!-- BG blobs -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 opacity-60 blur-3xl"></div>
    <div class="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50 blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 opacity-50 blur-3xl"></div>
    <svg class="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#6d28d9" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)"/>
    </svg>
  </div>

  <div class="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
    <!-- Left copy -->
    <div class="space-y-8">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
        <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        全球代寄/邮路测试服务现测试中，即将上线 ✉️
      </div>
      <h1 class="text-5xl lg:text-7xl font-black leading-tight tracking-tight text-slate-900">
        一张明信片，<br/>
        <span class="bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          跨越千山万水
        </span>
      </h1>
      <p class="text-lg text-slate-500 leading-relaxed max-w-lg">
        高木桑收藏品店 —— 专注于明信片、信件与邮票的收藏与代寄，以及创新型的邮路测试功能。每一张卡片都是有温度的旅行，让您的心意从世界任何角落出发。
      </p>
      <div class="flex flex-wrap gap-4">
        <a href="#shop"
          class="px-8 py-4 rounded-2xl text-white font-bold text-base bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 shadow-xl shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-0.5 transition-all duration-200">
          浏览明信片 →
        </a>
        <a href="#mailroute"
          class="px-8 py-4 rounded-2xl font-bold text-base text-slate-700 border-2 border-slate-200 hover:border-rose-300 hover:text-rose-500 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
          </svg>
          查看邮路
        </a>
      </div>
      <div class="flex items-center gap-6 pt-2">
        <div class="flex -space-x-2">
          {#each ['bg-rose-400','bg-purple-400','bg-blue-400','bg-indigo-400','bg-pink-400'] as c}
            <span class="w-9 h-9 rounded-full {c} border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow"></span>
          {/each}
        </div>
        <p class="text-sm text-slate-500">已有 <span class="font-bold text-slate-800">5万+</span> 张明信片成功代寄</p>
      </div>
    </div>

    <!-- Right: 3D Postcard -->
    <div class="relative flex items-center justify-center select-none">
      <div class="relative" style="perspective: 900px; padding: 40px;">
        <p class="absolute -top-2 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">← 拖动旋转明信片 →</p>

        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="relative cursor-grab active:cursor-grabbing"
          style="width:340px; height:220px; transform-style:preserve-3d; transform: rotateX({cardRotateX}deg) rotateY({cardRotateY}deg); transition: transform 0.05s linear;"
          on:mousedown={onCardMouseDown}
          on:touchstart|passive={onCardTouchStart}
          on:touchmove|passive={onCardTouchMove}
          on:touchend={onCardTouchEnd}
        >
          <!-- Front face -->
          <div class="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-rose-200/60"
            style="backface-visibility:hidden; background: linear-gradient(135deg,#fff5f5 0%,#fdf4ff 50%,#eff6ff 100%); border: 2px solid #fecdd3;">
            <div class="absolute inset-0 flex flex-col">
              <div class="flex-1 relative overflow-hidden">
                <svg class="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 340 140" fill="none">
                  <circle cx="60" cy="50" r="35" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="5 3"/>
                  <path d="M20 120 Q80 60 160 100 Q240 140 320 80" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/>
                  <path d="M0 100 L60 60 L110 90 L160 50 L220 80 L270 40 L340 70" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3 3" fill="none"/>
                  <circle cx="280" cy="40" r="20" stroke="#f43f5e" stroke-width="1" stroke-dasharray="3 2"/>
                  <rect x="150" y="55" width="40" height="30" rx="4" stroke="#7c3aed" stroke-width="1.5" fill="none"/>
                </svg>
                <div class="relative z-10 p-4 flex items-center gap-3">
                  <div class="text-4xl">🌸</div>
                  <div>
                    <p class="font-black text-slate-800 text-base">广东·广州</p>
                    <p class="text-xs text-slate-400">Guangdong·Canton</p>
                  </div>
                  <div class="ml-auto w-12 h-16 border-2 border-dashed border-rose-300 rounded flex items-center justify-center text-2xl bg-rose-50/60">
                    🌸
                  </div>
                </div>
              </div>
              <div class="h-10 bg-white/80 border-t border-rose-100 flex items-center px-4 gap-2">
                <div class="flex gap-1">
                  {#each [0,1,2,3,4,5] as _}
                    <div class="w-6 h-2 rounded-sm bg-gradient-to-r from-rose-200 to-purple-200"></div>
                  {/each}
                </div>
                <span class="ml-auto text-[10px] text-slate-400 font-mono">TKG-Collection-Store ✉</span>
              </div>
            </div>
          </div>

          <!-- Back face -->
          <div class="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-purple-200/60"
            style="backface-visibility:hidden; transform: rotateY(180deg); background: #fff8f8; border: 2px solid #e9d5ff;">
            <div class="p-4 h-full flex flex-col gap-2">
              <div class="flex gap-3 flex-1">
                <div class="flex-1 border-r border-dashed border-purple-200 pr-3">
                  <p class="text-[10px] text-purple-400 font-semibold mb-2 uppercase tracking-widest">Message</p>
                  <div class="space-y-1.5">
                    {#each [3,4,3.5,4,2] as w}
                      <div class="h-1.5 rounded-full bg-slate-200" style="width:{w*14}px"></div>
                    {/each}
                  </div>
                </div>
                <div class="w-28 flex flex-col gap-2">
                  <p class="text-[10px] text-purple-400 font-semibold uppercase tracking-widest">To</p>
                  <div class="space-y-1">
                    {#each [3.5,4,3] as w}
                      <div class="h-1.5 rounded-full bg-slate-200" style="width:{w*10}px"></div>
                    {/each}
                  </div>
                  <div class="mt-auto self-end w-12 h-14 border-2 border-rose-300 rounded bg-rose-50 flex items-center justify-center flex-col">
                    <span class="text-lg">📮</span>
                    <span class="text-[8px] text-rose-400 font-mono">TKG</span>
                  </div>
                </div>
              </div>
              <p class="text-center text-[9px] text-slate-300 font-mono tracking-widest">高木桑收藏品店 · TKG-SAN Collection STORE</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating badges -->
      <div class="absolute top-4 -left-2 bg-white rounded-2xl shadow-lg shadow-rose-100 border border-rose-100 px-4 py-3 flex items-center gap-2 animate-bounce" style="animation-duration:3s">
        <span class="text-xl">✉️</span>
        <div>
          <p class="text-xs font-bold text-slate-800">已到达巴黎</p>
          <p class="text-xs text-slate-400">32天前发出</p>
        </div>
      </div>
      <div class="absolute bottom-4 -right-2 bg-white rounded-2xl shadow-lg shadow-purple-100 border border-purple-100 px-4 py-3 flex items-center gap-2 animate-bounce" style="animation-duration:4s;animation-delay:1s">
        <span class="text-xl">🌍</span>
        <div>
          <p class="text-xs font-bold text-slate-800">3+ 可选代寄城市</p>
          <p class="text-xs text-slate-400">国内·国际目的地皆可</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===== STATS ===== -->
<section bind:this={statsRef} class="py-20 bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600">
  <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
    {#each stats as s, i}
      <div
        class="space-y-2"
        style="opacity:{statsVisible?1:0}; transform:translateY({statsVisible?0:20}px); transition: opacity 0.6s ease {i*100}ms, transform 0.6s ease {i*100}ms"
      >
        <p class="text-4xl font-black">{s.value}</p>
        <p class="text-rose-100 text-sm font-medium">{s.label}</p>
      </div>
    {/each}
  </div>
</section>

<!-- ===== BENTO GRID CORE ===== -->
<section id="features" class="py-28 bg-gradient-to-b from-slate-50 to-white">
  <div class="max-w-7xl mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-16 space-y-4">
      <span class="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold border border-purple-200">关于我们</span>
      <h2 class="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
        探索<span class="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">邮路的世界</span>
      </h2>
      <p class="text-slate-500 text-lg">明信片是旅行记忆的凝固，是人与人之间最温柔的连接。</p>
    </div>

    <!-- Bento Grid: 3-col layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <!-- Cell A: Story & Intro (spans 2 cols) -->
      <div class="lg:col-span-2 rounded-3xl p-8 relative overflow-hidden bg-white border border-slate-100
        shadow-[8px_8px_24px_rgba(0,0,0,0.06),-4px_-4px_12px_rgba(255,255,255,0.9)]
        hover:shadow-[12px_12px_32px_rgba(0,0,0,0.08),-4px_-4px_12px_rgba(255,255,255,0.9)]
        transition-shadow duration-300">
        <div class="absolute top-0 right-0 w-48 h-48 rounded-full bg-gradient-to-br from-rose-100 to-pink-50 opacity-60 blur-3xl pointer-events-none"></div>
        <div class="relative">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg text-xl">📬</div>
            <div>
              <h3 class="text-xl font-black text-slate-900">高木桑收藏品店的故事</h3>
              <p class="text-sm text-slate-400">始于一张来自杭州的明信片</p>
            </div>
          </div>
          <p class="text-slate-600 leading-relaxed mb-6">
            2023年，Jack在一次旅途中，给自己寄出了一张印有西塘风光的明信片。从那以后，收集来自世界各地的明信片与邮票，成为了他最执着的爱好。如今，这家小店承载着来自10余个国家的明信片收藏，也为每一位想传递心意的人提供专业代寄和新手邮路测试服务。
          </p>
          <div class="flex flex-wrap gap-3">
            <span class="px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-sm font-medium border border-rose-100">🇨🇳 中国系列</span>
            <span class="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium border border-blue-100">🌍 欧洲系列</span>
            <span class="px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-medium border border-purple-100">🏷️ 集邮专区</span>
            <span class="px-4 py-2 rounded-full bg-slate-50 text-slate-600 text-sm font-medium border border-slate-100">✉️ 代寄/邮路测试服务</span>
          </div>
        </div>
        <div class="absolute bottom-4 right-6 opacity-10 pointer-events-none">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="4" y="4" width="72" height="72" rx="12" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="5 3"/>
            <circle cx="40" cy="40" r="24" stroke="#e11d48" stroke-width="1.5" stroke-dasharray="4 3"/>
          </svg>
        </div>
      </div>

      <!-- Cell: Mail Service Steps (tall, spans rows) -->
      <div class="lg:row-span-2 rounded-3xl p-7 relative overflow-hidden
        bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900
        shadow-[8px_8px_24px_rgba(0,0,0,0.18),-2px_-2px_8px_rgba(255,255,255,0.04)]
        hover:shadow-[14px_14px_36px_rgba(0,0,0,0.22)] transition-shadow duration-300">
        <div class="absolute inset-0 opacity-10 pointer-events-none">
          <svg class="w-full h-full" viewBox="0 0 200 400" preserveAspectRatio="xMidYMid slice">
            <circle cx="100" cy="100" r="80" stroke="white" stroke-width="0.8" fill="none" stroke-dasharray="5 5"/>
            <circle cx="100" cy="300" r="60" stroke="white" stroke-width="0.8" fill="none" stroke-dasharray="4 4"/>
          </svg>
        </div>
        <div class="relative">
          <h3 class="text-xl font-black text-white mb-2">如何代寄明信片或进行邮路测试</h3>
          <p class="text-slate-400 text-sm mb-8">四步完成，让心意飞翔</p>
          <div class="space-y-6">
            {#each mailSteps as step, i}
              <div class="flex gap-4 group">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    {step.icon}
                  </div>
                  {#if i < mailSteps.length - 1}
                    <div class="w-px h-8 bg-gradient-to-b from-purple-500/40 to-transparent mt-2"></div>
                  {/if}
                </div>
                <div class="pt-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-rose-400 text-xs font-mono font-bold">{step.step}</span>
                    <h4 class="text-white font-bold text-sm">{step.title}</h4>
                  </div>
                  <p class="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            {/each}
          </div>
          <a href="#contact" class="mt-8 block text-center py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-sm hover:from-rose-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-900/50">
            立即下单代寄 →
          </a>
        </div>
        <!-- 底部法律声明 -->
        <p class="absolute bottom-2 left-1/3 -translate-x-1/2 text-[10px] text-slate-500 opacity-80">* 本店服务通过中国邮政实现，不提供实际寄送服务。</p>
      </div>

      <!-- Cell B: Gallery -->
      <div class="rounded-3xl p-6 relative overflow-hidden bg-white border border-slate-100
        shadow-[8px_8px_24px_rgba(0,0,0,0.06),-4px_-4px_12px_rgba(255,255,255,0.9)]
        hover:shadow-[12px_12px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="text-lg font-black text-slate-900">珍藏画廊</h3>
            <p class="text-xs text-slate-400">明信片 · 信件 · 邮票</p>
          </div>
          <a href="#shop" class="text-xs text-rose-500 font-semibold hover:text-rose-600 transition-colors">查看全部 →</a>
        </div>
        <div class="grid grid-cols-3 gap-2">
          {#each gallery as item}
            <div class="group cursor-pointer rounded-xl overflow-hidden border {item.border} bg-gradient-to-br {item.color} aspect-square flex flex-col items-center justify-center p-2 hover:scale-105 transition-transform duration-200 shadow-sm">
              <div class="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">{item.emoji}</div>
              <p class="text-[9px] font-bold text-slate-700 text-center leading-tight">{item.title}</p>
              <p class="text-[8px] text-slate-400 text-center">{item.year}</p>
            </div>
          {/each}
        </div>
        <div class="mt-4 flex items-center gap-2">
          <div class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-rose-400 to-purple-500" style="width:72%"></div>
          </div>
          <span class="text-xs text-slate-400">8,000+ 件</span>
        </div>
      </div>

      <!-- Cell C: Global Mail Route Map -->
      <div id="mailroute" class="rounded-3xl p-6 relative overflow-hidden
        bg-gradient-to-br from-slate-900 to-purple-950
        shadow-[8px_8px_24px_rgba(0,0,0,0.18)] hover:shadow-[14px_14px_36px_rgba(0,0,0,0.22)] transition-shadow duration-300">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <h3 class="text-base font-black text-white">实时全球邮路(开发中)</h3>
          <span class="ml-auto text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full font-mono">LIVE</span>
        </div>
        <div class="relative rounded-xl overflow-hidden bg-slate-950/50 border border-purple-900/50">
          <svg viewBox="0 0 700 200" class="w-full" style="height:160px">
            <!-- Simplified continent outlines -->
            <path d="M50,80 Q80,60 100,70 Q130,50 150,65 Q170,80 160,95 Q145,105 130,100 Q110,115 95,105 Q70,110 55,95 Z" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
            <path d="M165,60 Q200,40 260,55 Q310,45 340,65 Q370,55 400,70 Q420,90 400,105 Q370,115 340,110 Q300,120 260,110 Q220,115 190,105 Q165,90 165,60 Z" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
            <path d="M420,65 Q460,50 510,60 Q550,55 580,70 Q610,60 640,80 Q650,100 630,115 Q600,125 570,115 Q540,120 510,110 Q475,115 445,105 Q420,95 420,65 Z" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
            <!-- Route lines -->
            {#each mailRoutes as r}
              <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
                stroke={r.color} stroke-width="1.2" opacity="0.5" stroke-dasharray="6 4"/>
              <!-- Animated dot -->
              <circle r="3.5" fill={r.color} opacity="0.85">
                <animateMotion path="M {r.x1},{r.y1} L {r.x2},{r.y2}" dur="{r.dur}s" repeatCount="indefinite"/>
              </circle>
            {/each}
            <!-- City nodes -->
            {#each cities as city}
              <g>
                <circle cx={city.x} cy={city.y} r="5" fill="#0f172a" stroke="#7c3aed" stroke-width="1.5"/>
                <circle cx={city.x} cy={city.y} r="2.5" fill="#a78bfa"/>
                <circle cx={city.x} cy={city.y} r="8" fill="none" stroke="#a78bfa" stroke-width="0.8" opacity="0.4">
                  <animate attributeName="r" values="5;14;5" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
                </circle>
                <text x={city.x} y={city.y - 10} text-anchor="middle" font-size="7" fill="#94a3b8" font-family="sans-serif">{city.name}</text>
              </g>
            {/each}
          </svg>
        </div>
        <div class="mt-3 flex items-center justify-between text-xs">
          <span class="text-slate-400">已追踪 <span class="text-green-400 font-bold">127</span> 条在途邮路</span>
          <a href="#contact" class="text-purple-400 hover:text-purple-300 font-medium transition-colors">订阅追踪 →</a>
        </div>
        <!-- 底部法律声明 -->
        <p class="absolute bottom-2 left-1/3 -translate-x-1/2 text-[10px] text-slate-500 opacity-80">* 本店服务通过中国邮政实现，不提供实际寄送服务。</p>
        <!-- Scan line animation -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div class="scanline absolute w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent"></div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ===== SHOP SECTION (Cell D expanded) ===== -->
<section id="shop" class="py-28 bg-white">
  <div class="max-w-7xl mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-16 space-y-4">
      <span class="inline-block px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-sm font-semibold border border-rose-200">精选商店</span>
      <h2 class="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
        明信片 · 信件 · <span class="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">邮票零售</span>
      </h2>
      <p class="text-slate-500 text-lg">商店功能即将上线。</p>
    </div>

    <!-- Filter tabs -->
    <div class="flex flex-wrap justify-center gap-3 mb-10">
      {#each ['全部', '明信片', '信封信纸', '邮票', '礼盒套装'] as tab, i}
        <button class="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
          {i===0
            ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-200'
            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-rose-300 hover:text-rose-500'}">
          {tab}
        </button>
      {/each}
    </div>

    <!-- Product grid (neumorphism cards) -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each shopItems as item}
        <div class="group rounded-3xl p-6 relative bg-white
          shadow-[6px_6px_18px_rgba(0,0,0,0.06),-4px_-4px_12px_rgba(255,255,255,1)]
          hover:shadow-[10px_10px_28px_rgba(0,0,0,0.09),-4px_-4px_12px_rgba(255,255,255,1)]
          border border-slate-50 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <span class="absolute top-5 right-5 px-2.5 py-1 rounded-full {item.tagColor} text-white text-[10px] font-bold shadow-sm">{item.tag}</span>
          <div class="w-full h-36 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mb-5 group-hover:from-rose-50 group-hover:to-purple-50 transition-colors duration-300
            shadow-[inset_3px_3px_8px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]">
            <span class="text-5xl group-hover:scale-110 transition-transform duration-300">{item.emoji}</span>
          </div>
          <div class="space-y-2">
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">{item.type}</p>
            <h4 class="font-black text-slate-800 text-base">{item.name}</h4>
            <div class="flex items-center justify-between pt-1">
              <span class="text-2xl font-black bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">{item.price}</span>
              <button class="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 shadow-md shadow-rose-200/50 hover:shadow-rose-300/50 transition-all active:scale-95">
                加入购物车
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="text-center mt-12">
      <a href="#shop"
        class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-slate-700 border-2 border-slate-200 hover:border-rose-300 hover:text-rose-500 transition-all duration-200 hover:-translate-y-0.5">
        查看全部商品
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
        </svg>
      </a>
    </div>
  </div>
</section>

<!-- ===== CTA BANNER ===== -->
<section class="py-24 bg-gradient-to-br from-rose-500 via-purple-600 to-blue-600 relative overflow-hidden">
  <div class="absolute inset-0 pointer-events-none opacity-10">
    <svg class="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
      {#each [80,200,380,600,800,1000,1100] as cx}
        {#each [80,200,320] as cy}
          <circle cx={cx} cy={cy} r="60" stroke="white" stroke-width="1" fill="none" stroke-dasharray="6 4"/>
        {/each}
      {/each}
    </svg>
  </div>
  <div class="relative max-w-4xl mx-auto px-6 text-center text-white space-y-8">
    <h2 class="text-4xl lg:text-6xl font-black leading-tight">
      寄出一张明信片，<br/>连接世界的温度
    </h2>
    <p class="text-rose-100 text-xl">来自全球 30+ 城市，每一张都是一段旅程。</p>
    <div class="flex flex-wrap justify-center gap-4">
      <a href="#shop"
        class="px-10 py-4 rounded-2xl bg-white text-purple-700 font-bold text-base hover:bg-rose-50 shadow-2xl hover:-translate-y-1 transition-all duration-200">
        选购明信片
      </a>
      <a href="#mailroute"
        class="px-10 py-4 rounded-2xl border-2 border-white/50 text-white font-bold text-base hover:bg-white/10 hover:-translate-y-1 transition-all duration-200">
        代寄服务
      </a>
    </div>
  </div>
</section>

<!-- ===== FOOTER ===== -->
<Footer />

<!-- ===== FLOATING WIDGET ===== -->
<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
  {#if widgetOpen}
    <div class="w-80 rounded-3xl bg-white shadow-2xl shadow-purple-200/50 border border-purple-100 overflow-hidden flex flex-col" style="max-height: 420px;">
      <div class="px-5 py-4 bg-gradient-to-r from-rose-500 to-purple-600 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">🌸</span>
          <div>
            <p class="text-white font-bold text-sm">高木桑助手</p>
            <p class="text-rose-200 text-xs">在线 · 通常立即回复</p>
          </div>
        </div>
        <button on:click={() => widgetOpen = false} aria-label="关闭" class="text-white/70 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
        {#each widgetMessages as msg}
          <div class="flex {msg.from === 'user' ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
              {msg.from === 'user'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-tr-sm'
                : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-sm'}">
              {msg.text}
            </div>
          </div>
        {/each}
      </div>
      <form class="px-4 py-3 border-t border-slate-100 flex gap-2" on:submit|preventDefault={sendMessage}>
        <input
          bind:value={widgetMessage}
          placeholder="询问代寄 / 收藏品..."
          class="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 bg-slate-50"
        />
        <button type="submit" aria-label="发送"
          class="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white hover:from-rose-600 hover:to-purple-700 transition-all flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
          </svg>
        </button>
      </form>
    </div>
  {/if}
  <button
    on:click={() => widgetOpen = !widgetOpen}
    class="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 shadow-xl shadow-purple-300/50 flex items-center justify-center text-white hover:from-rose-600 hover:to-purple-700 hover:scale-110 transition-all duration-200"
    aria-label="打开客服"
  >
    {#if widgetOpen}
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    {:else}
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
      </svg>
    {/if}
  </button>
</div>

<style>
  @keyframes scanline {
    0% { top: -2px; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  .scanline {
    animation: scanline 5s linear infinite;
  }
</style>


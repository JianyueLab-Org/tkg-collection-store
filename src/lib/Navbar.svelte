<script lang="ts">
  import { onMount } from 'svelte';
  let scrolled = false;
  let mobileOpen = false;

  onMount(() => {
    const handler = () => { scrolled = window.scrollY > 20; };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  });
</script>

<nav
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
  class:bg-white={scrolled}
  class:shadow-md={scrolled}
  class:bg-transparent={!scrolled}
>
  <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2 group">
      <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/>
        </svg>
      </span>
      <span class="font-extrabold text-xl tracking-tight">
        <span class="text-rose-500">TKG</span><span class="text-purple-700">Store</span>
      </span>
    </a>

    <!-- Desktop Nav -->
    <ul class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
      <li><a href="#features" class="hover:text-rose-500 transition-colors">关于我们</a></li>
      <li><a href="#shop" class="hover:text-rose-500 transition-colors">精选商店</a></li>
      <li><a href="#mailroute" class="hover:text-rose-500 transition-colors">全球邮路</a></li>
      <li><a href="#about" class="hover:text-rose-500 transition-colors">联系我们</a></li>
    </ul>

    <!-- CTA -->
    <div class="hidden md:flex items-center gap-3">
      <a href="#login" class="text-sm font-medium text-slate-600 hover:text-rose-500 transition-colors">登录</a>
      <a href="#shop"
        class="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 shadow-md hover:shadow-rose-200 transition-all duration-200">
        选购明信片
      </a>
    </div>

    <!-- Mobile hamburger -->
    <button
      class="md:hidden p-2 rounded-lg text-slate-600 hover:text-rose-500"
      on:click={() => mobileOpen = !mobileOpen}
      aria-label="菜单"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        {#if mobileOpen}
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        {/if}
      </svg>
    </button>
  </div>

  <!-- Mobile menu -->
  {#if mobileOpen}
    <div class="md:hidden bg-white border-t border-slate-100 px-6 pb-4">
      <ul class="flex flex-col gap-4 py-4 text-sm font-medium text-slate-600">
        <li><a href="#features" on:click={() => mobileOpen=false} class="hover:text-rose-500">关于我们</a></li>
        <li><a href="#shop" on:click={() => mobileOpen=false} class="hover:text-rose-500">精选商店</a></li>
        <li><a href="#mailroute" on:click={() => mobileOpen=false} class="hover:text-rose-500">全球邮路</a></li>
        <li><a href="#about" on:click={() => mobileOpen=false} class="hover:text-rose-500">联系我们</a></li>
        <li>
          <a href="#shop" class="inline-block px-5 py-2 rounded-full text-white bg-gradient-to-r from-rose-500 to-purple-600 font-semibold">
            选购明信片
          </a>
        </li>
      </ul>
    </div>
  {/if}
</nav>


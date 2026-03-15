<script lang="ts">
  import { onMount } from 'svelte';
  let scrolled = false;
  let mobileOpen = false;

  const navLinks = [
    { href: '/about', text: '关于我们' },
    { href: '/shop', text: '精选商店' },
    { href: '/shop/sent', text: '代寄/邮路测试' },
    { href: '/about/contact', text: '联系我们' },
  ];

  onMount(() => {
    const handler = () => { scrolled = window.scrollY > 20; };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  });
</script>

<header class="sticky top-0 z-50 bg-white/80 backdrop-blur-lg">
  <nav class="container mx-auto flex items-center justify-between px-4 py-3">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2">
      <img src="/favicon.svg" alt="logo" class="h-8 w-8" />
      <span class="text-lg font-bold">高木桑收藏品店</span>
    </a>

    <!-- Desktop Nav -->
    <div class="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
      {#each navLinks as link}
        <a href={link.href} data-sveltekit-reload class="hover:text-rose-500">{link.text}</a>
      {/each}
      <a href="/auth" data-sveltekit-reload class="inline-block rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-5 py-2 font-semibold text-white">
        登录/注册
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
  </nav>

  <!-- mobile nav -->
  <div class:hidden={!mobileOpen} class="border-t md:hidden">
    <div class="container mx-auto px-4">
      <ul class="flex flex-col gap-4 py-4 text-sm font-medium text-slate-600">
        {#each navLinks as link}
          <li><a href={link.href} on:click={() => mobileOpen=false} data-sveltekit-reload class="hover:text-rose-500">{link.text}</a></li>
        {/each}
        <li>
          <a href="/auth" data-sveltekit-reload class="inline-block rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-5 py-2 font-semibold text-white">
            登录/注册
          </a>
        </li>
      </ul>
    </div>
  </div>
</header>

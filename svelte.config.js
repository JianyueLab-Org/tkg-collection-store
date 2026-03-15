import adapter from '@sveltejs/adapter-node'; // 从 auto 改为 node
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter() // 这会默认输出到 build 目录
	}
};

export default config;
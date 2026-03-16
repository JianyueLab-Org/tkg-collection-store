// tailwind.config.cjs
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  // 兼容旧版字段名
  purge: ["./src/**/*.{html,js,svelte,ts}"],
  safelist: ["text-red-600", "text-3xl", "font-bold"],
  theme: {
    extend: {},
  },
  plugins: [],
};

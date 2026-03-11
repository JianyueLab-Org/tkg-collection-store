// scripts/build-tailwind.js
const fs = require('fs');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');
const path = require('path');

(async () => {
  try {
    const inputPath = path.resolve(__dirname, '../src/app.css');
    const css = fs.readFileSync(inputPath, 'utf8');
    const result = await postcss([tailwind, autoprefixer]).process(css, { from: inputPath });
    fs.writeFileSync(path.resolve(__dirname, '../temp-out.css'), result.css, 'utf8');
    console.log('WROTE temp-out.css');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();


/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",   // ← これがJITで最重要
      "./src/pages/**/*.{js,jsx}",    // ← 明示的にページディレクトリも追加
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
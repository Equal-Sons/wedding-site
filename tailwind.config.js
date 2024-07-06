/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
		'./*.html', 
		'./js/**/*.js',
		'./css/**/*.css'
	],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
	daisyui: {
    themes: ["emerald"],
  },
}


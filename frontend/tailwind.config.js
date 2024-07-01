/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx}', // Path to your JS, JSX, TS, and TSX files
        './public/index.html', // Path to your HTML file
    ],
    darkMode: 'media', // or 'media' or 'class'
    theme: {
        screens: {
            'xs': '475px',
            '2xs': '375px',
            '3xs': '320px',
            ...defaultTheme.screens,
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}


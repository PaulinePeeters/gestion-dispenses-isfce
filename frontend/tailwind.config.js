/** @type {import('tailwindcss').Config} */
// Configuration de Tailwind CSS
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // Ajout des animations
            animation: {
                fadeIn: 'fadeIn 0.3s ease-out',
                slideUp: 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                // Ajout de l'animation slideUp utilisée dans le composant UeDetailModal
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}

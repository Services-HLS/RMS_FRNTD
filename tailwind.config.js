/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2F2F2F', // Charcoal
                secondary: '#4CAF50', // Olive Green
                neutral: {
                    DEFAULT: '#F7F8FA', // Light Grey background
                    card: '#FFFFFF',
                    border: '#E0E0E0',
                    zebra: '#FAFAFA',
                    text: '#333333',
                    muted: '#666666',
                },
                warning: '#FFA726',
                error: '#E53935',
                info: '#1976D2',
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 2px 8px rgba(0,0,0,0.06)',
            }
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['Fira Code', 'monospace'],
        },
        colors: {
            // Modern Developer Dark Mode Palette
            slate: {
                850: '#1e293b', // Sidebar bg
                900: '#0f172a', // Main bg
                950: '#020617', // Code block bg
            },
            indigo: {
                500: '#6366f1', // Primary Accent
                600: '#4f46e5', // Hover
            }
        },
        animation: {
            'fade-in': 'fadeIn 0.3s ease-out',
            'slide-in': 'slideIn 0.2s ease-out',
        },
        keyframes: {
            fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
            },
            slideIn: {
                '0%': { transform: 'translateX(-10px)', opacity: '0' },
                '100%': { transform: 'translateX(0)', opacity: '1' },
            }
        }
      },
    },
    plugins: [],
  }

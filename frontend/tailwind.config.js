/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 莫蘭迪主色調 - 紫色系
        primary: {
          50: '#F4F2FF',
          100: '#E8E4FF',
          200: '#D4CCFF',
          300: '#AEA4D6',
          400: '#9A8DC7',
          500: '#8B7CC8',  // 主色
          600: '#6B5D8C',  // 深色
          700: '#4A3F61',
          800: '#2E2640',
          900: '#1A1525',
        },
        
        // 莫蘭迪輔助色 - 灰色系
        secondary: {
          50: '#F8F7F6',
          100: '#F0EFED',
          200: '#E8E6E3',
          300: '#B8B5B2',
          400: '#A8A5A0',  // 暖調灰
          500: '#9B9B9B',  // 冷調灰
          600: '#6B6B6B',  // 深灰
          700: '#4A4A4A',
          800: '#3A3A3A',
          900: '#2A2A2A',
        },

        // 中性色調 - 莫蘭迪基調
        neutral: {
          cream: '#F5F4F2',    // 奶油白
          white: '#FEFEFE',     // 純白
          light: '#E8E6E3',     // 淺灰
          medium: '#B8B5B2',    // 中灰
          dark: '#3A3A3A',      // 深色
        },

        // 功能色調 - 莫蘭迪調和
        success: '#7A9B7E',     // 莫蘭迪綠
        warning: '#C4A661',     // 莫蘭迪黃
        error: '#B07A7A',       // 莫蘭迪紅
        info: '#7A93B0',        // 莫蘭迪藍
      },
      
      fontFamily: {
        sans: ['Noto Sans CJK TC', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'heartbeat': 'heartbeat 1.2s infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        heartbeat: {
          '0%, 40%, 80%, 100%': { transform: 'scale(1)' },
          '20%, 60%': { transform: 'scale(1.1)' },
        },
      },
      
      boxShadow: {
        'morandi': '0 4px 20px rgba(139, 124, 200, 0.15)',
        'morandi-lg': '0 8px 30px rgba(139, 124, 200, 0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
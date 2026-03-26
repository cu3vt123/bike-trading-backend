/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ["var(--font-sans)", "system-ui", "sans-serif"],
  			display: ["var(--font-sans)", "system-ui", "sans-serif"],
  		},
  		fontSize: {
  			xs: ["0.75rem", { lineHeight: "1rem" }],
  			sm: ["0.875rem", { lineHeight: "1.25rem" }],
  			base: ["1rem", { lineHeight: "1.5rem" }],
  			lg: ["1.125rem", { lineHeight: "1.75rem" }],
  			xl: ["1.25rem", { lineHeight: "1.75rem" }],
  			"2xl": ["1.5rem", { lineHeight: "2rem" }],
  			"3xl": ["1.875rem", { lineHeight: "2.25rem" }],
  			"4xl": ["2.25rem", { lineHeight: "2.5rem" }],
  		},
  		transitionDuration: {
  			DEFAULT: "200ms",
  			fast: "150ms",
  			normal: "200ms",
  			slow: "300ms",
  		},
  		colors: {
  			brand: {
  				DEFAULT: 'hsl(var(--brand))',
  				soft: 'hsl(168 55% 18%)',
  				dark: 'hsl(168 65% 35%)'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'bicycle-glide': {
  				'0%, 100%': { transform: 'translateX(0)' },
  				'50%': { transform: 'translateX(0.3rem)' },
  			},
  		},
  		animation: {
  			'bicycle-glide': 'bicycle-glide 1.35s ease-in-out infinite',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

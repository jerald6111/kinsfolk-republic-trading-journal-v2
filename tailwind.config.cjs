module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Refined "Obsidian & Gold" palette — warmer, deeper, less neon
        krblack: '#0A0B0D',                       // deepest base
        krbg: '#0E0F12',                          // raised base
        krgold: '#E8B341',                        // warm brass (was #F0B90B)
        kryellow: '#F6CF6A',                      // lighter gold (highlights only)
        krgray: '#1B1E24',                        // chips / subtle surfaces
        krwhite: '#F2F1EC',                       // warm off-white
        krcard: 'rgba(21, 24, 29, 0.85)',         // near-solid card (was glassy 0.7)
        krborder: '#23262D',                      // hairline
        krsuccess: '#3FBF8F',                     // desaturated green
        krdanger: '#E06A5C',                      // desaturated red
        krmuted: '#9097A1',
        krtext: '#F2F1EC',
        krpanel: '#111317',                       // new: panel tone
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        btn: '0 6px 20px rgba(232,179,65,0.22)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 30px rgba(0,0,0,0.45)',
        soft: '0 1px 0 rgba(255,255,255,0.03) inset, 0 2px 10px rgba(0,0,0,0.30)',
      },
      borderRadius: {
        xl: '0.9rem',
      },
    },
  },
  plugins: [],
}

module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        krblack: '#0B0E11',
        krgold: '#F0B90B',
        kryellow: '#FCD535',
        krgray: '#2B3139',
        krwhite: '#EAECEF',
        krbg: '#181A20',
        krcard: 'rgba(30, 35, 41, 0.6)', // More transparent glass effect
        krborder: '#2B3139',
        krsuccess: '#0ECB81',
        krdanger: '#F6465D',
        krmuted: '#848E9C',
        krtext: '#EAECEF'
      }
    }
  },
  plugins: [],
}

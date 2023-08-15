module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#d946ef",
          secondary: "#67e8f9",
          accent: "#a855f7",
          neutral: "#1D1820",
          "base-100": "#1f2937",
          info: "#60a5fa",
          success: "#5BD7BC",
          warning: "#E08610",
          error: "#EE3F53",
        },
      },
    ],
  },
};

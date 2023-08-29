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
          primary: "#e779c1",

          secondary: "#58c7f3",

          accent: "#f3cc30",

          neutral: "#221551",

          "base-100": "#1a103c",

          info: "#53c0f3",

          success: "#71ead2",

          warning: "#f3cc30",

          error: "#e24056",
        },
      },
    ],
  },
};

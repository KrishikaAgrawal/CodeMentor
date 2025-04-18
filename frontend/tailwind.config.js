import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      typography: ({ theme }) => ({
        invert: {
          css: {
            a: {
              color: theme("colors.indigo.400"),
              "&:hover": {
                color: theme("colors.pink.400"),
                textDecoration: "underline",
              },
              fontWeight: "600",
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

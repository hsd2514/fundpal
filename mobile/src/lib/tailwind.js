import { create } from 'twrnc';

// Create a tw instance with our custom theme
const tw = create({
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        surface: "#1a1a1a",
        primary: "#e2e2e2",
        secondary: "#a9a9a9",
        accent: {
          blue: "#3b82f6",
          green: "#10b981",
        },
      },
    },
  },
});

export default tw;

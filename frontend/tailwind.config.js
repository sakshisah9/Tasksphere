export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        cloud: "#f6f7f9",
        line: "#dfe3e8",
        brand: "#2563eb",
        mint: "#10b981",
        amber: "#f59e0b",
        coral: "#ef4444"
      },
      boxShadow: {
        panel: "0 12px 40px rgba(23, 32, 42, 0.08)"
      }
    }
  },
  plugins: []
};

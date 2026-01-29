import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    orange: "#FF8C00", // Approximate from screenshot
                    purple: "#6A0DAD", // Approximate
                    blue: "#007BFF",   // Approximate
                },
                secondary: "#f3f4f6",
            },
            backgroundImage: {
                "gradient-orange": "linear-gradient(135deg, #FFB700 0%, #FF8C00 100%)",
                "gradient-purple": "linear-gradient(135deg, #4B0082 0%, #800080 100%)",
            },
        },
    },
    plugins: [],
};
export default config;

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        visualizer({
            open: false,
            gzipSize: true,
            filename: "dist/bundle-analysis.html",
        }),
    ],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api/v1': {
                target: 'http://localhost:5000', // your backend
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // ── React core ────────────────────────────────────────────────
                    if (
                        id.includes("node_modules/react/") ||
                        id.includes("node_modules/react-dom/") ||
                        id.includes("node_modules/scheduler/")
                    ) {
                        return "vendor-react";
                    }

                    // ── Routing ───────────────────────────────────────────────────
                    if (
                        id.includes("node_modules/react-router-dom/") ||
                        id.includes("node_modules/react-router/") ||
                        id.includes("node_modules/@remix-run/")
                    ) {
                        return "vendor-router";
                    }

                    // ── Server state ──────────────────────────────────────────────
                    if (id.includes("node_modules/@tanstack/")) {
                        return "vendor-query";
                    }

                    // ── Charts (recharts bundles its own d3 internally) ───────────
                    if (id.includes("node_modules/recharts/")) {
                        return "vendor-charts";
                    }

                    // ── Drag and Drop ─────────────────────────────────────────────
                    if (id.includes("node_modules/@dnd-kit/")) {
                        return "vendor-dnd";
                    }

                    // ── Radix UI primitives ───────────────────────────────────────
                    if (id.includes("node_modules/@radix-ui/")) {
                        return "vendor-radix";
                    }

                    // ── Styling utilities ─────────────────────────────────────────
                    if (
                        id.includes("node_modules/class-variance-authority/") ||
                        id.includes("node_modules/clsx/") ||
                        id.includes("node_modules/tailwind-merge/") ||
                        id.includes("node_modules/tailwindcss-animate/")
                    ) {
                        return "vendor-styling";
                    }

                    // ── Date utilities ────────────────────────────────────────────
                    if (
                        id.includes("node_modules/date-fns/") ||
                        id.includes("node_modules/react-day-picker/")
                    ) {
                        return "vendor-dates";
                    }

                    // ── Small UI libs ─────────────────────────────────────────────
                    if (
                        id.includes("node_modules/lucide-react/") ||
                        id.includes("node_modules/sonner/") ||
                        id.includes("node_modules/next-themes/")
                    ) {
                        return "vendor-ui-misc";
                    }

                    // ── Network + state ───────────────────────────────────────────
                    if (
                        id.includes("node_modules/axios/") ||
                        id.includes("node_modules/zustand/")
                    ) {
                        return "vendor-utils";
                    }

                    // ── Catch-all for anything else in node_modules ───────────────
                    if (id.includes("node_modules/")) {
                        return "vendor-misc";
                    }
                },
            },
        },
    },
});
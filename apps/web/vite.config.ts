import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		{
			name: "dev-favicon",
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					if (req.url === "/favicon.ico") {
						res.statusCode = 204;
						res.end();
						return;
					}
					next();
				});
			},
		},
		tailwindcss(),
		tanstackRouter({}),
		react(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:7770",
				changeOrigin: true,
			},
			"/health": {
				target: "http://localhost:7770",
				changeOrigin: true,
			},
		},
	},
});

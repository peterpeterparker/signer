import { sveltekit } from '@sveltejs/kit/vite';
import environment from 'vite-plugin-environment';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	build: {
		emptyOutDir: true
	},
	plugins: [
		sveltekit(),
		environment('all', { prefix: 'CANISTER_', defineOn: 'import.meta.env' }),
		environment('all', { prefix: 'DFX_', defineOn: 'import.meta.env' })
	],
	server: {
		proxy: {
			'/api': 'http://localhost:4943'
		}
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis'
			}
		}
	},
	worker: {
		format: 'es'
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

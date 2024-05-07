import { sveltekit } from '@sveltejs/kit/vite';
import environment from 'vite-plugin-environment';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	build: {
		emptyOutDir: true
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis'
			}
		}
	},
	plugins: [
		sveltekit(),
		environment('all', { prefix: 'CANISTER_', defineOn: 'import.meta.env' }),
		environment('all', { prefix: 'DFX_', defineOn: 'import.meta.env' })
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

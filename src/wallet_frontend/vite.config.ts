import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv } from 'vite';
import environment from 'vite-plugin-environment';
import { defineConfig, type UserConfig } from 'vitest/config';

export default defineConfig((): UserConfig => {
	process.env = {
		...process.env,
		...loadEnv('development', '../../', 'CANISTER_'),
		...loadEnv('development', '../../', 'DFX_')
	};

	return {
		build: {
			emptyOutDir: true
		},
		plugins: [
			sveltekit(),
			environment('all', { prefix: 'CANISTER_', defineOn: 'import.meta.env' }),
			environment('all', { prefix: 'DFX_', defineOn: 'import.meta.env' })
		],
		server: {
			port: 5174,
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
	};
});

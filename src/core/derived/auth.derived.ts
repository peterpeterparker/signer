import { authStore } from '$core/stores/auth.store';
import { derived, type Readable } from 'svelte/store';

export const signedIn: Readable<boolean> = derived(
	authStore,
	({ identity }) => identity !== null && identity !== undefined
);

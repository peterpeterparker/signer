export const MODE = import.meta.env.DFX_NETWORK;
export const LOCAL = MODE === 'local';
export const STAGING = MODE === 'staging';
export const PROD = MODE === 'ic';

export const BACKEND_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_BACKEND;

console.log(import.meta.env, import.meta.env.VITE_CANISTER_ID_BACKEND);

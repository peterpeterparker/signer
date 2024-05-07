export const MODE = import.meta.env.DFX_NETWORK;
export const LOCAL = MODE === 'local';
export const STAGING = MODE === 'staging';
export const PROD = MODE === 'ic';

export const BACKEND_CANISTER_ID = import.meta.env.CANISTER_ID_RELYING_PARTY_BACKEND;

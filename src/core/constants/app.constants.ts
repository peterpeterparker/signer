export const MODE = import.meta.env.DFX_NETWORK;
export const LOCAL = MODE === 'local';
export const STAGING = MODE === 'staging';
export const PROD = MODE === 'ic';

export const RELYING_PARTY_BACKEND_CANISTER_ID = import.meta.env.CANISTER_ID_RELYING_PARTY_BACKEND;
export const WALLET_BACKEND_CANISTER_ID = import.meta.env.CANISTER_ID_WALLET_BACKEND;
export const INTERNET_IDENTITY_CANISTER_ID = import.meta.env.CANISTER_ID_INTERNET_IDENTITY;

// How long the delegation identity should remain valid?
// e.g. BigInt(60 * 60 * 1000 * 1000 * 1000) = 1 hour in nanoseconds
export const AUTH_MAX_TIME_TO_LIVE = BigInt(60 * 60 * 1000 * 1000 * 1000);

export const AUTH_POPUP_WIDTH = 576;
export const AUTH_POPUP_HEIGHT = 625;

export const WALLET_POPUP_WIDTH = 350;
export const WALLET_POPUP_HEIGHT = 600;

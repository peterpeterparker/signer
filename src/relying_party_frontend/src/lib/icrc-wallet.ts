import {
	ICP_LEDGER_CANISTER_ID, NANO_SECONDS_IN_MINUTE,
	WALLET_BACKEND_CANISTER_ID,
	WALLET_POPUP_HEIGHT,
	WALLET_POPUP_WIDTH
} from '$core/constants/app.constants';
import {
	ICRC25_REQUEST_PERMISSIONS,
	ICRC27_GET_ACCOUNTS,
	ICRC49_CALL_CANISTER,
	IcrcWalletGetAccountsResponse,
	IcrcWalletNotification,
	IcrcWalletPermissionsResponse,
	type IcrcGetAccountArrayType,
	type IcrcWalletCallCanisterParamsType,
	type IcrcWalletCallCanisterRequestType,
	type IcrcWalletGetAccountsRequestType,
	type IcrcWalletNotificationType,
	type IcrcWalletPermissionsRequestType,
	type IcrcWalletScopesArrayType,
	type IcrcWalletScopesType
} from '$core/types/icrc';
import {
	IcrcApproveResponse, type IcrcApproveResponseType,
	IcrcWalletGreetingsResponse,
	type IcrcWalletGreetingsResponseType
} from '$core/types/icrc-demo';
import { JSON_RPC_VERSION_2, RpcRequest } from '$core/types/rpc';
import { nowInBigIntNanoSeconds } from '$core/utils/date.utils';
import { toArray } from '$core/utils/did.utils';
import { popupTopRight } from '$core/utils/window.utils';
import { IDL } from '@dfinity/candid';
import type { Icrc1Account, Icrc2ApproveRequest } from '@dfinity/ledger-icp';
import { encodeIcrcAccount, type IcrcAccount } from '@dfinity/ledger-icrc';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish, uint8ArrayToArrayOfNumber } from '@dfinity/utils';

export class IcrcWallet {
	readonly #walletOrigin: string | undefined;
	readonly #accounts: IcrcAccount[] | undefined;
	readonly #scopes: IcrcWalletScopesArrayType | undefined;

	private constructor({
		origin,
		accounts,
		scopes
	}: {
		origin: string | undefined;
		accounts: IcrcGetAccountArrayType;
		scopes: IcrcWalletScopesArrayType | undefined;
	}) {
		this.#walletOrigin = origin;
		this.#accounts = accounts?.map(({ owner, subaccount }) => ({
			owner: Principal.fromText(owner),
			subaccount
		}));
		this.#scopes = scopes;
	}

	static connect(): Promise<IcrcWallet> {
		return new Promise<IcrcWallet>((resolve) => {
			const popup = window.open(
				'http://localhost:5174',
				'walletWindow',
				popupTopRight({ width: WALLET_POPUP_WIDTH, height: WALLET_POPUP_HEIGHT })
			);

			// TODO: that's ugly - find another way to keep those states till wallet is loaded
			let walletOrigin: string | undefined = undefined;
			let permissions: IcrcWalletScopesType | undefined = undefined;

			const onMessage = ({ data, origin }: MessageEvent<Partial<IcrcWalletNotificationType>>) => {
				console.log(data, origin);

				if (nonNullish(walletOrigin) && walletOrigin !== origin) {
					// TODO
					throw new Error('Invalid origin');
				} else if (isNullish(walletOrigin)) {
					walletOrigin = origin;
				}

				const { success: isWalletNotification } = IcrcWalletNotification.safeParse(data);

				// We got the ICRC29_READY message, we can request permissions.
				if (isWalletNotification) {
					const msg: IcrcWalletPermissionsRequestType = {
						jsonrpc: JSON_RPC_VERSION_2,
						method: ICRC25_REQUEST_PERMISSIONS,
						params: {
							scopes: [{ method: ICRC27_GET_ACCOUNTS }, { method: ICRC49_CALL_CANISTER }]
						}
					};

					popup?.postMessage(msg, { targetOrigin: origin });
					return;
				}

				const { success: isWalletPermissions } = IcrcWalletPermissionsResponse.safeParse(data);

				// We got the permissions, we can request the accounts
				// TODO: compare nanoid
				if (isWalletPermissions) {
					// TODO: try catch
					const { result } = IcrcWalletPermissionsResponse.parse(data);
					permissions = result;

					const msg: IcrcWalletGetAccountsRequestType = {
						jsonrpc: JSON_RPC_VERSION_2,
						method: ICRC27_GET_ACCOUNTS
					};

					popup?.postMessage(msg, { targetOrigin: origin });
					return;
				}

				// TODO: catch errors
				const { result, error: _ } = IcrcWalletGetAccountsResponse.parse(data);
				assertNonNullish(result);

				// TODO: I'm not convinced by this pattern. Really handy but, not beautiful
				popup?.close();

				window.removeEventListener('message', onMessage);

				const wallet = new IcrcWallet({
					origin,
					accounts: result.accounts,
					scopes: permissions?.scopes
				});
				resolve(wallet);
			};

			// TODO: create popup after registering this event
			window.addEventListener('message', onMessage);
		});
	}

	private callCanister = <T>({
		params,
		parse
	}: {
		params: IcrcWalletCallCanisterParamsType;
		parse: (data: Partial<IcrcWalletNotificationType>) => T;
	}): Promise<T> => {
		return new Promise<T>((resolve) => {
			const popup = window.open(
				'http://localhost:5174',
				'walletWindow',
				popupTopRight({ width: WALLET_POPUP_WIDTH, height: WALLET_POPUP_HEIGHT })
			);

			// TODO: assert popup non nullish

			const onMessage = ({ data, origin }: MessageEvent<Partial<IcrcWalletNotificationType>>) => {
				if (nonNullish(this.#walletOrigin) && this.#walletOrigin !== origin) {
					// TODO
					throw new Error('Invalid origin');
				}

				const { success: isRpcRequest } = RpcRequest.safeParse(data);

				if (isRpcRequest) {
					// TODO: Parse throw an error if not expected msg - wallet is ready
					const _notification = IcrcWalletNotification.parse(data);

					// TODO: id with nanoid back and forth
					const msg: IcrcWalletCallCanisterRequestType = {
						jsonrpc: JSON_RPC_VERSION_2,
						method: ICRC49_CALL_CANISTER,
						params
					};

					popup?.postMessage(msg, { targetOrigin: this.#walletOrigin });
					return;
				}

				// TODO: I'm not convinced by this pattern. Really handy but, not beautiful
				popup?.close();

				window.removeEventListener('message', onMessage);

				resolve(parse(data));
			};

			// TODO: create popup after registering this event
			window.addEventListener('message', onMessage);
		});
	};

	greetings = async ({ account }: { account: IcrcAccount }): Promise<string> => {
		const { result } = await this.callCanister({
			params: {
				canisterId: WALLET_BACKEND_CANISTER_ID,
				sender: encodeIcrcAccount(account),
				method: 'greet',
				arg: uint8ArrayToArrayOfNumber(new Uint8Array(IDL.encode([IDL.Text], ['Awesome Bobby'])))
			},
			parse: (data): IcrcWalletGreetingsResponseType => IcrcWalletGreetingsResponse.parse(data)
		});

		// TODO: handle error
		assertNonNullish(result);

		return result.message;
	};

	approve = async ({
		account,
		spender
	}: {
		account: IcrcAccount;
		spender: Icrc1Account;
	}): Promise<bigint> => {
		const arg: Icrc2ApproveRequest = {
			spender,
			amount: BigInt(5_000_000_000),
			expires_at: nowInBigIntNanoSeconds() + 5n * NANO_SECONDS_IN_MINUTE
		};

		const { result } = await this.callCanister({
			params: {
				canisterId: ICP_LEDGER_CANISTER_ID,
				sender: encodeIcrcAccount(account),
				method: 'icrc2_approve',
				arg: uint8ArrayToArrayOfNumber(await toArray(arg))
			},
			parse: (data): IcrcApproveResponseType => IcrcApproveResponse.parse(data)
		});

		// TODO: handle error
		assertNonNullish(result);

		return result.blockIndex;
	};

	get accounts(): IcrcAccount[] | undefined {
		return this.#accounts;
	}

	get scopes(): IcrcWalletScopesArrayType | undefined {
		return this.#scopes;
	}
}

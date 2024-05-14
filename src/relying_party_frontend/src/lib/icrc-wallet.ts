import { WALLET_POPUP_HEIGHT, WALLET_POPUP_WIDTH } from '$core/constants/app.constants';
import {
	ICRC25_REQUEST_PERMISSIONS,
	ICRC27_GET_ACCOUNTS,
	IcrcWalletGetAccountsResponse,
	IcrcWalletNotification,
	IcrcWalletPermissionsResponse,
	type IcrcGetAccountArrayType,
	type IcrcWalletGetAccountsRequestType,
	type IcrcWalletNotificationType,
	type IcrcWalletPermissionsRequestType
} from '$core/types/icrc';
import { JSON_RPC_VERSION_2, RpcRequest } from '$core/types/rpc';
import { popupTopRight } from '$core/utils/window.utils';
import type { IcrcAccount } from '@dfinity/ledger-icrc';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, nonNullish } from '@dfinity/utils';

export class IcrcWallet {
	readonly #walletOrigin: string | undefined;
	readonly #accounts: IcrcAccount[] | undefined;

	private constructor({
		origin,
		accounts
	}: {
		origin: string | undefined;
		accounts?: IcrcGetAccountArrayType;
	}) {
		this.#walletOrigin = origin;
		this.#accounts = accounts?.map(({ owner, subaccount }) => ({
			owner: Principal.fromText(owner),
			subaccount
		}));
	}

	static connect(): Promise<IcrcWallet> {
		return new Promise<IcrcWallet>((resolve) => {
			const popup = window.open(
				'http://localhost:5174',
				'walletWindow',
				popupTopRight({ width: WALLET_POPUP_WIDTH, height: WALLET_POPUP_HEIGHT })
			);

			let walletOrigin: string | undefined = undefined;

			const onMessage = ({ data, origin }: MessageEvent<Partial<IcrcWalletNotificationType>>) => {
				console.log(data, origin);

				if (nonNullish(walletOrigin) && walletOrigin !== origin) {
					// TODO
					throw new Error('Invalid origin');
				}

				walletOrigin = origin;

				const { success: isWalletNotification } = IcrcWalletNotification.safeParse(data);

				// We got the ICRC29_READY message, we can request permissions.
				if (isWalletNotification) {
					const msg: IcrcWalletPermissionsRequestType = {
						jsonrpc: JSON_RPC_VERSION_2,
						method: ICRC25_REQUEST_PERMISSIONS,
						params: {
							scopes: [{ method: ICRC27_GET_ACCOUNTS }]
						}
					};

					popup?.postMessage(msg, { targetOrigin: origin });
					return;
				}

				const { success: isWalletPermissions } = IcrcWalletPermissionsResponse.safeParse(data);

				// We got the permissions, we can request the accounts
				// TODO: compare nanoid
				if (isWalletPermissions) {
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

				const wallet = new IcrcWallet({ origin, accounts: result.accounts });
				resolve(wallet);
			};

			// TODO: create popup after registering this event
			window.addEventListener('message', onMessage);
		});
	}

	// TODO: deprecated?
	/**
	 * @deprecated
	 */
	getAccounts = (): Promise<IcrcAccount[]> => {
		return new Promise<IcrcAccount[]>((resolve) => {
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
					const msg: IcrcWalletGetAccountsRequestType = {
						jsonrpc: JSON_RPC_VERSION_2,
						method: ICRC27_GET_ACCOUNTS
					};

					popup?.postMessage(msg, { targetOrigin: this.#walletOrigin });
					return;
				}

				console.log(data);

				const response = IcrcWalletGetAccountsResponse.parse(data);

				console.log('RESULT ----> ', response.result);

				// TODO: I'm not convinced by this pattern. Really handy but, not beautiful
				popup?.close();

				window.removeEventListener('message', onMessage);

				resolve([]);
			};

			// TODO: create popup after registering this event
			window.addEventListener('message', onMessage);
		});
	};

	get accounts(): IcrcAccount[] | undefined {
		return this.#accounts;
	}
}

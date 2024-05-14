import { getWalletBackendActor } from '$core/actors/actors.ic';
import type { OptionIdentity } from '$core/types/identity';
import type {
	Icrc21ConsentMessageRequest,
	Result
} from '$declarations/wallet_backend/wallet_backend.did';

export const walletGreet = async ({
	identity,
	args
}: {
	identity: OptionIdentity;
	args: string;
}): Promise<string> => {
	const { greet } = await getWalletBackendActor({ identity });
	return greet(args);
};

export const walletConsentMessage = async ({
	identity,
	args
}: {
	identity: OptionIdentity;
	args: Icrc21ConsentMessageRequest;
}): Promise<Result> => {
	const { icrc21_canister_call_consent_message } = await getWalletBackendActor({
		identity
	});
	return icrc21_canister_call_consent_message(args);
};

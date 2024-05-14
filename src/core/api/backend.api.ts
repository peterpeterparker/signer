import { getWalletBackendActor } from '$core/actors/actors.ic';
import type { OptionIdentity } from '$core/types/identity';

export const walletGreet = async (identity: OptionIdentity): Promise<string> => {
	const { greet } = await getWalletBackendActor({ identity });
	return greet('Yolo');
};

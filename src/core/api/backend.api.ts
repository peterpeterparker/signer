import { getWalletBackendActor } from '$core/actors/actors.ic';
import type { OptionIdentity } from '$core/types/identity';

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

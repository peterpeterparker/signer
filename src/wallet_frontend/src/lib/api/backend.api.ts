import { getBackendActor } from '$lib/actors/actors.ic';
import type { OptionIdentity } from '$lib/types/identity';

export const whoAmI = async (identity: OptionIdentity): Promise<string> => {
	const { greet } = await getBackendActor({ identity });
	return greet('');
};

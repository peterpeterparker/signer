import { getBackendActor } from '$core/actors/actors.ic';
import type { OptionIdentity } from '$core/types/identity';

export const whoAmI = async (identity: OptionIdentity): Promise<string> => {
	const { greet } = await getBackendActor({ identity });
	return greet('');
};

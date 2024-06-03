import type { Account } from '$declarations/relying_party_backend/relying_party_backend.did';
import { getRelyingPartyBackendActor } from '../actors/actors.ic';
import type { OptionIdentity } from '../types/identity';

export const transfer = async ({
	identity,
	from,
	amount
}: {
	identity: OptionIdentity;
	from: Account;
	amount: bigint;
}): Promise<void> => {
	const { transfer } = await getRelyingPartyBackendActor({ identity });
	await transfer(from, amount);
};

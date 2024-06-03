import type { Account } from '$declarations/relying_party_backend/relying_party_backend.did';
import { getRelyingPartyBackendActor } from '../actors/actors.ic';
import type { OptionIdentity } from '../types/identity';

export const transfer = async ({
	identity,
	account,
	amount
}: {
	identity: OptionIdentity;
	account: Account;
	amount: bigint;
}): Promise<void> => {

	console.log(account);

	const { transfer } = await getRelyingPartyBackendActor({ identity });
	await transfer(account, amount);
};

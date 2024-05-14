import { WALLET_BACKEND_CANISTER_ID } from '$core/constants/app.constants';
import type { OptionIdentity } from '$core/types/identity';
import type { _SERVICE as WalletBackendActor } from '$declarations/wallet_backend/wallet_backend.did';
import { idlFactory as idlCertifiedFactoryWalletBackend } from '$declarations/wallet_backend/wallet_backend.factory.certified.did';
import { idlFactory as idlFactoryWalletBackend } from '$declarations/wallet_backend/wallet_backend.factory.did';
import {
	Actor,
	AnonymousIdentity,
	type ActorMethod,
	type ActorSubclass,
	type Identity
} from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import { getAgent } from './agents.ic';

let actors: { backend?: WalletBackendActor } | undefined | null = undefined;

export const getWalletBackendActor = async ({
	identity: actorIdentity,
	certified = true
}: {
	identity: OptionIdentity;
	certified?: boolean;
}): Promise<WalletBackendActor> => {
	const identity = actorIdentity ?? new AnonymousIdentity();

	const { backend } = actors ?? { backend: undefined };

	if (isNullish(backend)) {
		const actor = await createActor<WalletBackendActor>({
			canisterId: WALLET_BACKEND_CANISTER_ID,
			idlFactory: certified ? idlCertifiedFactoryWalletBackend : idlFactoryWalletBackend,
			identity
		});

		actors = {
			...(actors ?? {}),
			backend: actor
		};

		return actor;
	}

	return backend;
};

export const clearActors = () => (actors = null);

const createActor = async <T = Record<string, ActorMethod>>({
	canisterId,
	idlFactory,
	identity
}: {
	canisterId: string | Principal;
	idlFactory: IDL.InterfaceFactory;
	identity: Identity;
}): Promise<ActorSubclass<T>> => {
	const agent = await getAgent({ identity });

	// Creates an actor with using the candid interface and the HttpAgent
	return Actor.createActor(idlFactory, {
		agent,
		canisterId
	});
};

import { BACKEND_CANISTER_ID } from '$core/constants/app.constants';
import type { OptionIdentity } from '$core/types/identity';
import type { _SERVICE as BackendActor } from '$declarations/relying_party_backend/relying_party_backend.did';
import { idlFactory as idlCertifiedFactoryBackend } from '$declarations/relying_party_backend/relying_party_backend.factory.certified.did';
import { idlFactory as idlFactoryBackend } from '$declarations/relying_party_backend/relying_party_backend.factory.did';
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

let actors: { backend?: BackendActor } | undefined | null = undefined;

export const getBackendActor = async ({
	identity: actorIdentity,
	certified = true
}: {
	identity: OptionIdentity;
	certified?: boolean;
}): Promise<BackendActor> => {
	const identity = actorIdentity ?? new AnonymousIdentity();

	const { backend } = actors ?? { backend: undefined };

	if (isNullish(backend)) {
		const actor = await createActor<BackendActor>({
			canisterId: BACKEND_CANISTER_ID,
			idlFactory: certified ? idlCertifiedFactoryBackend : idlFactoryBackend,
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

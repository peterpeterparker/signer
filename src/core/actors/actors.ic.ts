import {
	ICP_LEDGER_CANISTER_ID,
	RELYING_PARTY_BACKEND_CANISTER_ID,
	WALLET_BACKEND_CANISTER_ID
} from '$core/constants/app.constants';
import type { OptionIdentity } from '$core/types/identity';
import type { _SERVICE as ICPLedgerActor } from '$declarations/icp_ledger/icp_ledger.did';
import { idlFactory as idlFactoryICPLedger } from '$declarations/icp_ledger/icp_ledger.factory.did';
import type { _SERVICE as RelyingPartyBackendActor } from '$declarations/relying_party_backend/relying_party_backend.did';
import { idlFactory as idlCertifiedFactoryRelyingPartyBackend } from '$declarations/relying_party_backend/relying_party_backend.factory.certified.did';
import { idlFactory as idlFactoryRelyingPartyBackend } from '$declarations/relying_party_backend/relying_party_backend.factory.did';
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

let actors:
	| {
			walletBackend?: WalletBackendActor;
			relyingPartyBackend?: RelyingPartyBackendActor;
			icpLedger?: ICPLedgerActor;
	  }
	| undefined
	| null = undefined;

export const getWalletBackendActor = async ({
	identity: actorIdentity,
	certified = true
}: {
	identity: OptionIdentity;
	certified?: boolean;
}): Promise<WalletBackendActor> => {
	const identity = actorIdentity ?? new AnonymousIdentity();

	const { walletBackend } = actors ?? { walletBackend: undefined };

	if (isNullish(walletBackend)) {
		const actor = await createActor<WalletBackendActor>({
			canisterId: WALLET_BACKEND_CANISTER_ID,
			idlFactory: certified ? idlCertifiedFactoryWalletBackend : idlFactoryWalletBackend,
			identity
		});

		actors = {
			...(actors ?? {}),
			walletBackend: actor
		};

		return actor;
	}

	return walletBackend;
};

export const getRelyingPartyBackendActor = async ({
	identity: actorIdentity,
	certified = true
}: {
	identity: OptionIdentity;
	certified?: boolean;
}): Promise<RelyingPartyBackendActor> => {
	const identity = actorIdentity ?? new AnonymousIdentity();

	const { relyingPartyBackend } = actors ?? { relyingPartyBackend: undefined };

	if (isNullish(relyingPartyBackend)) {
		const actor = await createActor<RelyingPartyBackendActor>({
			canisterId: RELYING_PARTY_BACKEND_CANISTER_ID,
			idlFactory: certified
				? idlCertifiedFactoryRelyingPartyBackend
				: idlFactoryRelyingPartyBackend,
			identity
		});

		actors = {
			...(actors ?? {}),
			relyingPartyBackend: actor
		};

		return actor;
	}

	return relyingPartyBackend;
};

export const getICPLedgerActor = async ({
	identity: actorIdentity
}: {
	identity: OptionIdentity;
}): Promise<ICPLedgerActor> => {
	const identity = actorIdentity ?? new AnonymousIdentity();

	const { icpLedger } = actors ?? { icpLedger: undefined };

	if (isNullish(icpLedger)) {
		const actor = await createActor<ICPLedgerActor>({
			canisterId: ICP_LEDGER_CANISTER_ID,
			idlFactory: idlFactoryICPLedger,
			identity
		});

		actors = {
			...(actors ?? {}),
			icpLedger: actor
		};

		return actor;
	}

	return icpLedger;
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

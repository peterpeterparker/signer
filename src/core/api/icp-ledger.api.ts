import type {
	Allowance,
	AllowanceArgs,
	icrc21_consent_message_request,
	icrc21_consent_message_response
} from '$declarations/icp_ledger/icp_ledger.did';
import { getICPLedgerActor } from '../actors/actors.ic';
import type { OptionIdentity } from '../types/identity';

export const icpLedgerConsentMessage = async ({
	identity,
	args
}: {
	identity: OptionIdentity;
	args: icrc21_consent_message_request;
}): Promise<icrc21_consent_message_response> => {
	const { icrc21_canister_call_consent_message } = await getICPLedgerActor({
		identity
	});
	return icrc21_canister_call_consent_message(args);
};

export const icpLedgerAllowance = async ({
	identity,
	...rest
}: {
	identity: OptionIdentity;
} & AllowanceArgs): Promise<Allowance> => {
	const { icrc2_allowance } = await getICPLedgerActor({
		identity
	});

	return icrc2_allowance(rest);
};

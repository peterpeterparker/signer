// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const Account = IDL.Record({
		owner: IDL.Principal,
		subaccount: IDL.Opt(IDL.Vec(IDL.Nat8))
	});
	return IDL.Service({
		greet: IDL.Func([IDL.Text], [IDL.Text], ['query']),
		transfer: IDL.Func([Account, IDL.Nat], [], [])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

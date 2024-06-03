use candid::Principal;
use ic_cdk::{call, caller, export_candid, id, query, trap, update};
use icrc_ledger_types::icrc1::transfer::{BlockIndex};
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};
use candid::{Nat};
use icrc_ledger_types::icrc1::account::{Account, Subaccount};

#[query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

fn principal_to_subaccount(principal_id: &Principal) -> Subaccount {
    let mut subaccount = [0; std::mem::size_of::<Subaccount>()];
    let principal_id = principal_id.as_slice();
    subaccount[0] = principal_id.len().try_into().unwrap();
    subaccount[1..1 + principal_id.len()].copy_from_slice(principal_id);
    subaccount
}

#[update]
async fn transfer(from: Account, amount: Nat) {
    let ledger_canister_id = Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap();

    let args: TransferFromArgs = TransferFromArgs {
        amount,
        created_at_time: None,
        fee: None,
        memo: None,
        spender_subaccount: None,
        to: Account {
            owner: id(),
            subaccount: Some(principal_to_subaccount(&caller()))
        },
        from
    };

    let (result,): (Result<BlockIndex, TransferFromError>,) =
        call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(ledger_canister_id, "icrc2_transfer_from", (args,))
            .await
            .map_err(|(_, e)| e)
            .unwrap();

    match result {
        Ok(_block_index) => (),
        Err(e) => trap(&e.to_string()),
    }
}

export_candid!();
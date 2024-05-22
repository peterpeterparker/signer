use crate::guards::caller_is_owner;
use crate::icrc21_types::{
    Icrc10SupportedStandard, Icrc21ConsentInfo, Icrc21ConsentMessage, Icrc21ConsentMessageMetadata,
    Icrc21ConsentMessageRequest, Icrc21DeviceSpec, Icrc21Error, Icrc21ErrorInfo,
    Icrc21LineDisplayPage,
};
use crate::wallet_types::{HeapState, State, WalletArgs};
use candid::decode_one;
use ic_cdk::api::call::{arg_data, ArgDecoderConfig};
use ic_cdk::storage::stable_restore;
use ic_cdk::{export_candid, init, post_upgrade, pre_upgrade, query, storage, update};
use itertools::Itertools;
use std::cell::RefCell;
use Icrc21DeviceSpec::GenericDisplay;
use Icrc21Error::UnsupportedCanisterCall;

mod guards;
mod icrc21_types;
mod wallet_types;

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();
}

#[init]
pub fn init() {
    let call_arg = arg_data::<(Option<WalletArgs>,)>(ArgDecoderConfig::default()).0;
    let WalletArgs { owners } = call_arg.unwrap();

    let heap = HeapState { owners };

    STATE.with(|state| {
        *state.borrow_mut() = State { heap };
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    STATE.with(|state| storage::stable_save((&state.borrow().heap,)).unwrap());
}

#[post_upgrade]
fn post_upgrade() {
    let (upgrade_stable,): (HeapState,) = stable_restore().unwrap();

    let heap = HeapState::from(upgrade_stable);

    STATE.with(|state| *state.borrow_mut() = State { heap });
}

#[query(guard = "caller_is_owner")]
fn greet(name: String) -> String {
    format!("Hello owner, {}!", name)
}

#[query]
fn icrc10_supported_standards() -> Vec<Icrc10SupportedStandard> {
    vec![Icrc10SupportedStandard {
        url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-21/ICRC-21.md".to_string(),
        name: "ICRC-21".to_string(),
    }]
}

#[update]
fn icrc21_canister_call_consent_message(
    consent_msg_request: Icrc21ConsentMessageRequest,
) -> Result<Icrc21ConsentInfo, Icrc21Error> {
    if consent_msg_request.method != "greet" {
        return Err(UnsupportedCanisterCall(Icrc21ErrorInfo {
            description: "Only the 'greet' method is supported".to_string(),
        }));
    }

    let Ok(name) = decode_one::<String>(&consent_msg_request.arg) else {
        return Err(UnsupportedCanisterCall(Icrc21ErrorInfo {
            description: "Failed to decode the argument".to_string(),
        }));
    };

    // only English supported
    let metadata = Icrc21ConsentMessageMetadata {
        language: "en".to_string(),
    };

    match consent_msg_request.user_preferences.device_spec {
        Some(Icrc21DeviceSpec::LineDisplay {
            characters_per_line,
            lines_per_page,
        }) => Ok(Icrc21ConsentInfo {
            metadata,
            consent_message: Icrc21ConsentMessage::LineDisplayMessage {
                pages: consent_msg_text_pages(
                    &greet(name.clone()),
                    characters_per_line,
                    lines_per_page,
                ),
            },
        }),
        Some(GenericDisplay) | None => Ok(Icrc21ConsentInfo {
            metadata,
            consent_message: Icrc21ConsentMessage::GenericDisplayMessage(consent_msg_text_md(
                &greet(name.clone()),
            )),
        }),
    }
}

fn consent_msg_text_md(greeting: &str) -> String {
    format!("Produce the following greeting text:\n> {}", greeting)
}

fn consent_msg_text_pages(
    greeting: &str,
    characters_per_line: u16,
    lines_per_page: u16,
) -> Vec<Icrc21LineDisplayPage> {
    let full_text = format!("Produce the following greeting text:\n \"{}\"", greeting);

    // Split text into word chunks that fit on a line (breaking long words)
    let words = full_text
        .split_whitespace()
        .flat_map(|word| {
            word.chars()
                .collect::<Vec<_>>()
                .into_iter()
                .chunks(characters_per_line as usize)
                .into_iter()
                .map(|chunk| chunk.collect::<String>())
                .collect::<Vec<String>>()
        })
        .collect::<Vec<String>>();

    // Add words to lines until the line is full
    let mut lines = vec![];
    let mut current_line = "".to_string();
    for word in words {
        if current_line.is_empty() {
            // all words are guaranteed to fit on a line
            current_line = word.to_string();
            continue;
        }
        if current_line.len() + word.len() < characters_per_line as usize {
            current_line.push(' ');
            current_line.push_str(word.as_str());
        } else {
            lines.push(current_line);
            current_line = word.to_string();
        }
    }
    lines.push(current_line);

    // Group lines into pages
    lines
        .into_iter()
        .chunks(lines_per_page as usize)
        .into_iter()
        .map(|page| Icrc21LineDisplayPage {
            lines: page.collect(),
        })
        .collect()
}

export_candid!();

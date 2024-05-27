#!/bin/bash

# Download ICP ledger and index canisters

DIR=target/ic

if [ ! -d "$DIR" ]; then
  mkdir "$DIR"
fi

IC_VERSION=ec35ebd252d4ffb151d2cfceba3a86c4fb87c6d6

curl -o "$DIR"/icp_index.wasm.gz "https://download.dfinity.systems/ic/$IC_VERSION/canisters/ic-icp-index-canister.wasm.gz"
gunzip "$DIR"/icp_index.wasm.gz
curl -o "$DIR"/icp_index.did "https://raw.githubusercontent.com/dfinity/ic/$IC_VERSION/rs/rosetta-api/icp_ledger/index/index.did"

curl -o "$DIR"/icp_ledger.wasm.gz "https://download.dfinity.systems/ic/$IC_VERSION/canisters/ledger-canister.wasm.gz"
gunzip "$DIR"/icp_ledger.wasm.gz
curl -o "$DIR"/icp_ledger.did "https://raw.githubusercontent.com/dfinity/ic/$IC_VERSION/rs/rosetta-api/icp_ledger/ledger.did"

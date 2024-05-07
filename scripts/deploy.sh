#!/usr/bin/env bash

dfx deploy internet_identity --specified-id rdmx6-jaaaa-aaaaa-aaadq-cai

dfx deploy relying_party_backend
dfx deploy relying_party_frontend



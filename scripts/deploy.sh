#!/usr/bin/env bash

# dfx deploy internet_identity --specified-id rdmx6-jaaaa-aaaaa-aaadq-cai

# dfx deploy relying_party_backend
# dfx deploy relying_party_frontend

PRINCIPAL="wy6iz-qxyam-djk6v-vehsy-uniub-pvsg3-pibn2-33s47-evnpw-xgyyw-zae"
dfx deploy wallet_backend --argument "$(didc encode '(record {owners = vec { principal"'${PRINCIPAL}'";}})' --format hex)" --argument-type raw



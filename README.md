# node-red-contrib-opentok (beta)

Support for the OpenTok serverside functionality from within NodeRED

## Features

- Create Sessions
- Generate Tokens
- Archiving
- SIP Interconnect
- Send Signals

## Account Setup

The first time you use a node you will need to create OpenTok authentication parameters.
You can get an API key and Secret by creating a new application in the OpenTok dashboard


## Testing
This repository contains a file named `opentok_test.html` which can be used as a basic web client for 1-1 video calls with signals.
You can save this file to you local filesystem and then serve it from within nodered it will make a request to /session on the same host to get a JSON object containing the API Key, Sessioid and token for the connection.


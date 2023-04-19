"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

/**
 * @module ledger
 */

/********************************************************************************
 *   Binance Chain Ledger App Interface
 *   (c) 2018-2019 Binance
 *   (c) 2018 ZondaX GmbH
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *******************************************************************************
 */
var DEFAULT_LEDGER_INTERACTIVE_TIMEOUT = 50000;
var DEFAULT_LEDGER_NONINTERACTIVE_TIMEOUT = 3000;
var CLA = 0xBC;
var SCRAMBLE_KEY = "CSM";
var ACCEPT_STATUSES = [0x9000]; // throw if not

var CHUNK_SIZE = 250;
var INS_GET_VERSION = 0x00;
var INS_PUBLIC_KEY_SECP256K1 = 0x01;
var INS_SIGN_SECP256K1 = 0x02;
var INS_SHOW_ADDR_SECP256K1 = 0x03; // const INS_GET_ADDR_SECP256K1 = 0x04
// The general structure of commands and responses is as follows:
// #### Commands
// | Field   | Type     | Content                | Note |
// |:------- |:-------- |:---------------------- | ---- |
// | CLA     | byte (1) | Application Identifier | 0xBC |
// | INS     | byte (1) | Instruction ID         |      |
// | P1      | byte (1) | Parameter 1            |      |
// | P2      | byte (1) | Parameter 2            |      |
// | L       | byte (1) | Bytes in payload       |      |
// | PAYLOAD | byte (L) | Payload                |      |
// #### Response
// | Field   | Type     | Content     | Note                     |
// | ------- | -------- | ----------- | ------------------------ |
// | ANSWER  | byte (?) | Answer      | depends on the command   |
// | SW1-SW2 | byte (2) | Return code | see list of return codes |

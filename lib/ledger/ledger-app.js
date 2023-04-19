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

/**
 * Ledger app interface.
 * @static
 */

var LedgerApp = /*#__PURE__*/function () {
  /**
   * Constructs a new LedgerApp.
   * @param {Transport} transport Ledger Transport, a subclass of ledgerjs Transport.
   * @param {Number} interactiveTimeout The interactive (user input) timeout in ms. Default 45s.
   * @param {Number} nonInteractiveTimeout The non-interactive timeout in ms. Default 3s.
   */
  function LedgerApp(transport) {
    var interactiveTimeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_LEDGER_INTERACTIVE_TIMEOUT;
    var nonInteractiveTimeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_LEDGER_NONINTERACTIVE_TIMEOUT;
    (0, _classCallCheck2["default"])(this, LedgerApp);

    if (!transport || !transport.send) {
      throw new Error("LedgerApp expected a Transport");
    }

    this._transport = transport;

    if (typeof interactiveTimeout === "number") {
      this._interactiveTimeout = interactiveTimeout;
    }

    if (typeof nonInteractiveTimeout === "number") {
      this._nonInteractiveTimeout = nonInteractiveTimeout;
    }

    this._transport.setScrambleKey(SCRAMBLE_KEY);
  }

  (0, _createClass2["default"])(LedgerApp, [{
    key: "_serialize",
    value: function _serialize(CLA, INS) {
      var p1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var p2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var data = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
      var size = 5;

      if (data != null) {
        if (data.length > 255) {
          throw new Error("maximum data size = 255");
        }

        size += data.length;
      }

      var buffer = Buffer.alloc(size);
      buffer[0] = CLA;
      buffer[1] = INS;
      buffer[2] = p1;
      buffer[3] = p2;
      buffer[4] = 0;

      if (data != null) {
        buffer[4] = data.length;
        buffer.set(data, 5);
      }

      return buffer;
    }
  }, {
    key: "_serializeHRP",
    value: function _serializeHRP(hrp) {
      if (hrp == null || hrp.length < 3 || hrp.length > 83) {
        throw new Error("Invalid HRP");
      }

      var buf = Buffer.alloc(1 + hrp.length);
      buf.writeUInt8(hrp.length, 0);
      buf.write(hrp, 1);
      return buf;
    }
  }, {
    key: "_serializeHDPath",
    value: function _serializeHDPath(path) {
      if (path == null || path.length < 3) {
        throw new Error("Invalid path.");
      }

      if (path.length > 10) {
        throw new Error("Invalid path. Length should be <= 10");
      }

      var buf = Buffer.alloc(1 + 4 * path.length);
      buf.writeUInt8(path.length);

      for (var i = 0; i < path.length; i++) {
        var v = path[i];

        if (i < 3) {
          v |= 0x80000000; // Harden
        }

        buf.writeInt32LE(v, 1 + i * 4);
      }

      return buf;
    }
  }, {
    key: "_errorMessage",
    value: function _errorMessage(code) {
      switch (code) {
        case 1:
          return "U2F: Unknown";

        case 2:
          return "U2F: Bad request";

        case 3:
          return "U2F: Configuration unsupported";

        case 4:
          return "U2F: Device Ineligible";

        case 5:
          return "U2F: Timeout";

        case 14:
          return "Timeout";

        case 0x9000:
          return "No errors";

        case 0x9001:
          return "Device is busy";

        case 0x6400:
          return "Execution Error";

        case 0x6700:
          return "Wrong Length";

        case 0x6982:
          return "Empty Buffer";

        case 0x6983:
          return "Output buffer too small";

        case 0x6984:
          return "Data is invalid";

        case 0x6985:
          return "Conditions not satisfied";

        case 0x6986:
          return "Transaction rejected";

        case 0x6A80:
          return "Bad key handle";

        case 0x6B00:
          return "Invalid P1/P2";

        case 0x6D00:
          return "Instruction not supported";

        case 0x6E00:
          return "The app does not seem to be open";

        case 0x6F00:
          return "Unknown error";

        case 0x6F01:
          return "Sign/verify error";

        default:
          return "Unknown error code";
      }
    }
    /* GET_VERSION */
    // #### Payload
    // | Field | Type     | Content                | Expected |
    // | ----- | -------- | ---------------------- | -------- |
    // | CLA   | byte (1) | Application Identifier | 0xBC     |
    // | INS   | byte (1) | Instruction ID         | 0x00     |
    // | P1    | byte (1) | Parameter 1            | ignored  |
    // | P2    | byte (1) | Parameter 2            | ignored  |
    // | L     | byte (1) | Bytes in payload       | 0        |
    // #### Response
    // | Field   | Type     | Content       | Note                            |
    // | ------- | -------- | ------------- | ------------------------------- |
    // | CLA     | byte (1) | Test Mode     | 0xFF means test mode is enabled |
    // | MAJOR   | byte (1) | Version Major |                                 |
    // | MINOR   | byte (1) | Version Minor |                                 |
    // | PATCH   | byte (1) | Version Patch |                                 |
    // | LOCKED  | byte (1) | Device Locked | boolean                         |
    // | SW1-SW2 | byte (2) | Return code   | see list of return codes        |

    /**
     * Gets the version of the Ledger app that is currently open on the device.
     * @throws Will throw Error if a transport error occurs, or if the firmware app is not open.
     */

  }, {
    key: "getVersion",
    value: function () {
      var _getVersion = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var result, apduResponse, returnCode, statusCode, statusText, message, stack;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                result = {};
                _context.prev = 1;

                this._transport.setExchangeTimeout(this._nonInteractiveTimeout);

                _context.next = 5;
                return this._transport.send(CLA, INS_GET_VERSION, 0, 0, Buffer.alloc(0), ACCEPT_STATUSES);

              case 5:
                apduResponse = _context.sent;

                if (Buffer.isBuffer(apduResponse)) {
                  _context.next = 8;
                  break;
                }

                throw new Error("expected apduResponse to be Buffer");

              case 8:
                returnCode = apduResponse.slice(-2);
                result["test_mode"] = apduResponse[0] !== 0;
                result["major"] = apduResponse[1];
                result["minor"] = apduResponse[2];
                result["patch"] = apduResponse[3];
                result["device_locked"] = apduResponse[4] === 1;
                result["return_code"] = returnCode[0] * 256 + returnCode[1];
                result["error_message"] = this._errorMessage(result["return_code"]);
                _context.next = 23;
                break;

              case 18:
                _context.prev = 18;
                _context.t0 = _context["catch"](1);
                statusCode = _context.t0.statusCode, statusText = _context.t0.statusText, message = _context.t0.message, stack = _context.t0.stack;
                console.warn("Ledger getVersion error:", this._errorMessage(statusCode), message, statusText, stack);
                throw _context.t0;

              case 23:
                return _context.abrupt("return", result);

              case 24:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 18]]);
      }));

      function getVersion() {
        return _getVersion.apply(this, arguments);
      }
      
return getVersion;
    }()
    /* PUBLIC_KEY_SECP256K1 */
    // #### Payload
    // | Field | Type     | Content                 | Expected |
    // | ----- | -------- | ----------------------  | -------- |
    // | CLA   | byte (1) | Application Identifier  | 0xBC     |
    // | INS   | byte (1) | Instruction ID          | 0x01     |
    // | P1    | byte (1) | Parameter 1             | ignored  |
    // | P2    | byte (1) | Parameter 2             | ignored  |
    // | L     | byte (1) | Bytes in payload        | (depends) |
    // | PL    | byte (1) | Derivation Path Length  | 3<=PL<=10 |
    // | Path[0] | byte (4) | Derivation Path Data    | 44 |
    // | Path[1] | byte (4) | Derivation Path Data    | 118 |
    // | ..  | byte (4) | Derivation Path Data    |  |
    // | Path[PL-1]  | byte (4) | Derivation Path Data    |  |
    // First three items in the derivation path will be hardened automatically hardened
    // #### Response
    // | Field   | Type      | Content       | Note                            |
    // | ------- | --------- | ------------- | ------------------------------- |
    // | PK      | byte (65) | Public Key    |  |
    // | SW1-SW2 | byte (2)  | Return code   | see list of return codes        |

    /**
     * Gets the public key from the Ledger app that is currently open on the device.
     * @param {array} hdPath The HD path to use to get the public key. Default is [44, 714, 0, 0, 0]
     * @throws Will throw Error if a transport error occurs, or if the firmware app is not open.
     */

  }, {
    key: "publicKeySecp256k1",
    value: function () {
      var _publicKeySecp256k = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var hdPath,
            result,
            apduResponse,
            returnCode,
            statusCode,
            statusText,
            message,
            stack,
            _args2 = arguments;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                hdPath = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : [44, 714, 0, 0, 0];
                result = {};
                _context2.prev = 2;

                this._transport.setExchangeTimeout(this._nonInteractiveTimeout);

                _context2.next = 6;
                return this._transport.send(CLA, INS_PUBLIC_KEY_SECP256K1, 0, 0, this._serializeHDPath(hdPath), ACCEPT_STATUSES);

              case 6:
                apduResponse = _context2.sent;
                
                
if (Buffer.isBuffer(apduResponse)) {
                  _context2.next = 9;
                  break;
                }

                throw new Error("expected apduResponse to be Buffer");

              case 9:
                returnCode = apduResponse.slice(-2);
                result["pk"] = apduResponse.slice(0, 1 + 64);
                result["return_code"] = returnCode[0] * 256 + returnCode[1];
                result["error_message"] = this._errorMessage(result["return_code"]);
                _context2.next = 20;
                break;

              case 15:
                _context2.prev = 15;
                _context2.t0 = _context2["catch"](2);
                statusCode = _context2.t0.statusCode, statusText = _context2.t0.statusText, message = _context2.t0.message, stack = _context2.t0.stack;
                console.warn("Ledger publicKeySecp256k1 error:", this._errorMessage(statusCode), message, statusText, stack);
                throw _context2.t0;

              case 20:
                return _context2.abrupt("return", result);

              case 21:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[2, 15]]);
      }));

      function publicKeySecp256k1() {
        return _publicKeySecp256k.apply(this, arguments);
      }

      return publicKeySecp256k1;
    }()
    /* SIGN_SECP256K1 */
    // #### Payload
    // | Field | Type     | Content                | Expected |
    // | ----- | -------- | ---------------------- | -------- |
    // | CLA   | byte (1) | Application Identifier | 0xBC     |
    // | INS   | byte (1) | Instruction ID         | 0x02     |
    // | P1    | byte (1) | Packet Current Index   |   |
    // | P2    | byte (1) | Packet Total Count     |
    //   |
    // | L     | byte (1) | Bytes in payload       | (depends)        |
    // The first packet/chunk includes only the derivation path
    // All other packets/chunks should contain message to sign
    // *First Packet*
    // | Field | Type     | Content                | Expected |
    // | ----- | -------- | ---------------------- | -------- |
    // | PL    | byte (1) | Derivation Path Length  | 3<=PL<=10 |
    // | Path[0] | byte (4) | Derivation Path Data    | 44 |
    // | Path[1] | byte (4) | Derivation Path Data    | 118 |
    // | ..  | byte (4) | Derivation Path Data    |  |
    // | Path[PL-1]  | byte (4) | Derivation Path Data    |  |
    // | Message | bytes... | Message to Sign | |
    // *Other Chunks/Packets*
    // | Field | Type     | Content                | Expected |
    // | ----- | -------- | ---------------------- | -------- |
    // | Message | bytes... | Message to Sign | |
    // #### Response
    // | Field   | Type      | Content       | Note                            |
    // | ------- | --------- | ------------- | ------------------------------- |
    // | SIG     | byte (~71) | Signature     | DER encoded (length prefixed parts) |
    // | SW1-SW2 | byte (2)  | Return code   | see list of return codes        |
    
    

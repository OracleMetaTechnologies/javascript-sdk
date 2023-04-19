"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BncClient = exports.LedgerSigningDelegate = exports.DefaultBroadcastDelegate = exports.DefaultSigningDelegate = exports.api = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var crypto = _interopRequireWildcard(require("../crypto"));

var _tx = _interopRequireDefault(require("../tx"));

var _request = _interopRequireDefault(require("../utils/request"));

var _validateHelper = require("../utils/validateHelper");

var _token = _interopRequireDefault(require("../token/"));

var _swap = _interopRequireDefault(require("../swap/"));

var _gov = _interopRequireDefault(require("../gov/"));

var _big = _interopRequireDefault(require("big.js"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var BASENUMBER = Math.pow(10, 8);
var api = {
  broadcast: "/api/v1/broadcast",
  nodeInfo: "/api/v1/node-info",
  getAccount: "/api/v1/account",
  getMarkets: "/api/v1/markets",
  getSwaps: "/api/v1/atomic-swaps",
  getOpenOrders: "/api/v1/orders/open",
  getDepth: "/api/v1/depth",
  getTransactions: "/api/v1/transactions",
  getTx: "/api/v1/tx"
};
exports.api = api;
var NETWORK_PREFIX_MAPPING = {
  "testnet": "tbnb",
  "mainnet": "bnb"
};
/**
 * The default signing delegate which uses the local private key.
 * @param  {Transaction} tx      the transaction
 * @param  {Object}      signMsg the canonical sign bytes for the msg
 * @return {Transaction}
 */

var DefaultSigningDelegate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(tx, signMsg) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", tx.sign(this.privateKey, signMsg));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function DefaultSigningDelegate(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * The default broadcast delegate which immediately broadcasts a transaction.
 * @param {Transaction} signedTx the signed transaction
 */


exports.DefaultSigningDelegate = DefaultSigningDelegate;

var DefaultBroadcastDelegate = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(signedTx) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", this.sendTransaction(signedTx));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function DefaultBroadcastDelegate(_x3) {
    return _ref2.apply(this, arguments);
  };
}();
/**
 * The Ledger signing delegate.
 * @param  {LedgerApp}  ledgerApp
 * @param  {preSignCb}  function
 * @param  {postSignCb} function
 * @param  {errCb} function
 * @return {function}
 */


exports.DefaultBroadcastDelegate = DefaultBroadcastDelegate;

var LedgerSigningDelegate = function LedgerSigningDelegate(ledgerApp, preSignCb, postSignCb, errCb, hdPath) {
  return /*#__PURE__*/function () {
    var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(tx, signMsg) {
      var signBytes, pubKeyResp, sigResp, pubKey;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              signBytes = tx.getSignBytes(signMsg);
              preSignCb && preSignCb(signBytes);
              _context3.prev = 2;
              _context3.next = 5;
              return ledgerApp.getPublicKey(hdPath);

            case 5:
              pubKeyResp = _context3.sent;
              _context3.next = 8;
              return ledgerApp.sign(signBytes, hdPath);

            case 8:
              sigResp = _context3.sent;
              postSignCb && postSignCb(pubKeyResp, sigResp);
              _context3.next = 16;
              break;

            case 12:
              _context3.prev = 12;
              _context3.t0 = _context3["catch"](2);
              console.warn("LedgerSigningDelegate error", _context3.t0);
              errCb && errCb(_context3.t0);

            case 16:
              if (!(sigResp && sigResp.signature)) {
                _context3.next = 19;
                break;
              }

              pubKey = crypto.getPublicKey(pubKeyResp.pk.toString("hex"));
              return _context3.abrupt("return", tx.addSignature(pubKey, sigResp.signature));

            case 19:
              return _context3.abrupt("return", tx);

            case 20:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[2, 12]]);
    }));

    return function (_x4, _x5) {
      return _ref3.apply(this, arguments);
    };
  }();
};
/**
 * validate the input number.
 * @param {Array} outputs
 */


exports.LedgerSigningDelegate = LedgerSigningDelegate;

var checkOutputs = function checkOutputs(outputs) {
  outputs.forEach(function (transfer) {
    var coins = transfer.coins || [];
    coins.forEach(function (coin) {
      (0, _validateHelper.checkNumber)(coin.amount);

      if (!coin.denom) {
        throw new Error("invalid denmon");
      }
    });
  });
};
/**
 * sum corresponding input coin
 * @param {Array} inputs
 * @param {Array} coins
 */


var calInputCoins = function calInputCoins(inputs, coins) {
  coins.forEach(function (coin) {
    var existCoin = inputs[0].coins.find(function (c) {
      return c.denom === coin.denom;
    });

    if (existCoin) {
      var existAmount = new _big["default"](existCoin.amount);
      existCoin.amount = Number(existAmount.plus(coin.amount).toString());
    } else {
      inputs[0].coins.push(_objectSpread({}, coin));
    }
  });
};
/**
 * The Binance Chain client.
 */


var BncClient = /*#__PURE__*/function () {
  /**
   * @param {String} server Binance Chain public url
   * @param {Boolean} useAsyncBroadcast use async broadcast mode, faster but less guarantees (default off)
   * @param {Number} source where does this transaction come from (default 0)
   */
  function BncClient(server) {
    var useAsyncBroadcast = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    (0, _classCallCheck2["default"])(this, BncClient);

    if (!server) {
      throw new Error("Binance chain server should not be null");
    }

    this._httpClient = new _request["default"](server);
    this._signingDelegate = DefaultSigningDelegate;
    this._broadcastDelegate = DefaultBroadcastDelegate;
    this._useAsyncBroadcast = useAsyncBroadcast;
    this._source = source;
    this.tokens = new _token["default"](this);
    this.swap = new _swap["default"](this);
    this.gov = new _gov["default"](this);
  }
  /**
   * Initialize the client with the chain's ID. Asynchronous.
   * @return {Promise}
   */


  (0, _createClass2["default"])(BncClient, [{
    key: "initChain",
    value: function () {
      var _initChain = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        var data;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (this.chainId) {
                  _context4.next = 5;
                  break;
                }

                _context4.next = 3;
                return this._httpClient.request("get", api.nodeInfo);

              case 3:
                data = _context4.sent;
                this.chainId = data.result.node_info && data.result.node_info.network;

              case 5:
                return _context4.abrupt("return", this);

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function initChain() {
        return _initChain.apply(this, arguments);
      }

      return initChain;
    }()
    /**
     * Sets the client network (testnet or mainnet).
     * @param {String} network Indicate testnet or mainnet
     */

  }, {
    key: "chooseNetwork",
    value: function chooseNetwork(network) {
      this.addressPrefix = NETWORK_PREFIX_MAPPING[network] || "tbnb";
      this.network = NETWORK_PREFIX_MAPPING[network] ? network : "testnet";
    }
    /**
     * Sets the client's private key for calls made by this client. Asynchronous.
     * @param {string} privateKey the private key hexstring
     * @param {boolean} localOnly set this to true if you will supply an account_number yourself via `setAccountNumber`. Warning: You must do that if you set this to true!
     * @return {Promise}
     */

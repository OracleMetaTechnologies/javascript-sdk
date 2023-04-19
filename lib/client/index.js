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

     }, {
    key: "setPrivateKey",
    value: function () {
      var _setPrivateKey = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(privateKey) {
        var localOnly,
            address,
            promise,
            data,
            _args5 = arguments;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                localOnly = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : false;

                if (!(privateKey !== this.privateKey)) {
                  _context5.next = 21;
                  break;
                }

                address = crypto.getAddressFromPrivateKey(privateKey, this.addressPrefix);

                if (address) {
                  _context5.next = 5;
                  break;
                }

                throw new Error("address is falsy: ".concat(address, ". invalid private key?"));

              case 5:
                if (!(address === this.address)) {
                  _context5.next = 7;
                  break;
                }

                return _context5.abrupt("return", this);

              case 7:
                // safety
                this.privateKey = privateKey;
                this.address = address;

                if (localOnly) {
                  _context5.next = 21;
                  break;
                }

                _context5.prev = 10;
                promise = this._setPkPromise = this._httpClient.request("get", "".concat(api.getAccount, "/").concat(address));
                _context5.next = 14;
                return promise;

              case 14:
                data = _context5.sent;
                this.account_number = data.result.account_number;
                _context5.next = 21;
                break;

              case 18:
                _context5.prev = 18;
                _context5.t0 = _context5["catch"](10);
                throw new Error("unable to query the address on the blockchain. try sending it some funds first: ".concat(address));

              case 21:
                return _context5.abrupt("return", this);

              case 22:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[10, 18]]);
      }));

      function setPrivateKey(_x6) {
        return _setPrivateKey.apply(this, arguments);
      }

      return setPrivateKey;
    }()
    /**
     * Sets the client's account number.
     * @param {boolean} accountNumber
     */

  }, {
    key: "setAccountNumber",
    value: function setAccountNumber(accountNumber) {
      this.account_number = accountNumber;
    }
    /**
     * Use async broadcast mode. Broadcasts faster with less guarantees (default off)
     * @param {Boolean} useAsyncBroadcast
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "useAsyncBroadcast",
    value: function useAsyncBroadcast() {
      var _useAsyncBroadcast = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this._useAsyncBroadcast = _useAsyncBroadcast;
      return this;
    }
    /**
     * Sets the signing delegate (for wallet integrations).
     * @param {function} delegate
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "setSigningDelegate",
    value: function setSigningDelegate(delegate) {
      if (typeof delegate !== "function") throw new Error("signing delegate must be a function");
      this._signingDelegate = delegate;
      return this;
    }
    /**
     * Sets the broadcast delegate (for wallet integrations).
     * @param {function} delegate
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "setBroadcastDelegate",
    value: function setBroadcastDelegate(delegate) {
      if (typeof delegate !== "function") throw new Error("broadcast delegate must be a function");
      this._broadcastDelegate = delegate;
      return this;
    }
    /**
     * Applies the default signing delegate.
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "useDefaultSigningDelegate",
    value: function useDefaultSigningDelegate() {
      this._signingDelegate = DefaultSigningDelegate;
      return this;
    }
    /**
     * Applies the default broadcast delegate.
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "useDefaultBroadcastDelegate",
    value: function useDefaultBroadcastDelegate() {
      this._broadcastDelegate = DefaultBroadcastDelegate;
      return this;
    }
    /**
     * Applies the Ledger signing delegate.
     * @param {function} ledgerApp
     * @param {function} preSignCb
     * @param {function} postSignCb
     * @param {function} errCb
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "useLedgerSigningDelegate",
    value: function useLedgerSigningDelegate(ledgerApp, preSignCb, postSignCb, errCb, hdPath) {
      this._signingDelegate = LedgerSigningDelegate(ledgerApp, preSignCb, postSignCb, errCb, hdPath);
      return this;
    }
    /**
     * Transfer tokens from one address to another.
     * @param {String} fromAddress
     * @param {String} toAddress
     * @param {Number} amount
     * @param {String} asset
     * @param {String} memo optional memo
     * @param {Number} sequence optional sequence
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "transfer",
    value: function () {
      var _transfer = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(fromAddress, toAddress, amount, asset) {
        var memo,
            sequence,
            accCode,
            toAccCode,
            coin,
            msg,
            signMsg,
            signedTx,
            _args6 = arguments;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                memo = _args6.length > 4 && _args6[4] !== undefined ? _args6[4] : "";
                sequence = _args6.length > 5 && _args6[5] !== undefined ? _args6[5] : null;
                accCode = crypto.decodeAddress(fromAddress);
                toAccCode = crypto.decodeAddress(toAddress);
                amount = new _big["default"](amount);
                amount = Number(amount.mul(BASENUMBER).toString());
                (0, _validateHelper.checkNumber)(amount, "amount");
                coin = {
                  denom: asset,
                  amount: amount
                };
                msg = {
                  inputs: [{
                    address: accCode,
                    coins: [coin]
                  }],
                  outputs: [{
                    address: toAccCode,
                    coins: [coin]
                  }],
                  msgType: "MsgSend"
                };
                signMsg = {
                  inputs: [{
                    address: fromAddress,
                    coins: [{
                      amount: amount,
                      denom: asset
                    }]
                  }],
                  outputs: [{
                    address: toAddress,
                    coins: [{
                      amount: amount,
                      denom: asset
                    }]
                  }]
                };
                _context6.next = 12;
                return this._prepareTransaction(msg, signMsg, fromAddress, sequence, memo);

              case 12:
                signedTx = _context6.sent;
                return _context6.abrupt("return", this._broadcastDelegate(signedTx));

              case 14:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function transfer(_x7, _x8, _x9, _x10) {
        return _transfer.apply(this, arguments);
      }

      return transfer;
    }()
    /**
     * Create and sign a multi send tx
     * @param {String} fromAddress
     * @param {Array} outputs
     * @example
     * const outputs = [
     * {
     *   "to": "tbnb1p4kpnj5qz5spsaf0d2555h6ctngse0me5q57qe",
     *   "coins": [{
     *     "denom": "BNB",
     *     "amount": 10
     *   },{
      *     "denom": "BTC",
      *     "amount": 10
      *   }]
     * },
     * {
     *   "to": "tbnb1scjj8chhhp7lngdeflltzex22yaf9ep59ls4gk",
     *   "coins": [{
     *     "denom": "BTC",
     *     "amount": 10
     *   },{
      *     "denom": "BNB",
      *     "amount": 10
      *   }]
     * }]
     * @param {String} memo optional memo
     * @param {Number} sequence optional sequence
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "multiSend",
    value: function () {
      var _multiSend = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(fromAddress, outputs) {
        var memo,
            sequence,
            fromAddrCode,
            inputs,
            transfers,
            msg,
            signInputs,
            signOutputs,
            signMsg,
            signedTx,
            _args7 = arguments;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                memo = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : "";
                sequence = _args7.length > 3 && _args7[3] !== undefined ? _args7[3] : null;

                if (fromAddress) {
                  _context7.next = 4;
                  break;
                }

                throw new Error("fromAddress should not be falsy");

              case 4:
                if (Array.isArray(outputs)) {
                  _context7.next = 6;
                  break;
                }

                throw new Error("outputs should be array");

              case 6:
                checkOutputs(outputs); //sort denom by alphbet and init amount

                outputs.forEach(function (item) {
                  item.coins = item.coins.sort(function (a, b) {
                    return a.denom.localeCompare(b.denom);
                  });
                  item.coins.forEach(function (coin) {
                    var amount = new _big["default"](coin.amount);
                    coin.amount = Number(amount.mul(BASENUMBER).toString());
                  });
                });
                fromAddrCode = crypto.decodeAddress(fromAddress);
                inputs = [{
                  address: fromAddrCode,
                  coins: []
                }];
                transfers = [];
                outputs.forEach(function (item) {
                  var toAddcCode = crypto.decodeAddress(item.to);
                  calInputCoins(inputs, item.coins);
                  transfers.push({
                    address: toAddcCode,
                    coins: item.coins
                  });
                });
                msg = {
                  inputs: inputs,
                  outputs: transfers,
                  msgType: "MsgSend"
                };
                signInputs = [{
                  address: fromAddress,
                  coins: []
                }];
                signOutputs = [];
                outputs.forEach(function (item, index) {
                  signOutputs.push({
                    address: item.to,
                    coins: []
                  });
                  item.coins.forEach(function (c) {
                    signOutputs[index].coins.push(c);
                  });
                  calInputCoins(signInputs, item.coins);
                });
                signMsg = {
                  inputs: signInputs,
                  outputs: signOutputs
                };
                _context7.next = 19;
                return this._prepareTransaction(msg, signMsg, fromAddress, sequence, memo);

              case 19:
                signedTx = _context7.sent;
                return _context7.abrupt("return", this._broadcastDelegate(signedTx));

              case 21:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function multiSend(_x11, _x12) {
        return _multiSend.apply(this, arguments);
      }

      return multiSend;
    }()
    /**
     * Cancel an order.
     * @param {String} fromAddress
     * @param {String} symbol the market pair
     * @param {String} refid the order ID of the order to cancel
     * @param {Number} sequence optional sequence
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "cancelOrder",
    value: function () {
      var _cancelOrder = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(fromAddress, symbol, refid) {
        var sequence,
            accCode,
            msg,
            signMsg,
            signedTx,
            _args8 = arguments;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                sequence = _args8.length > 3 && _args8[3] !== undefined ? _args8[3] : null;
                accCode = crypto.decodeAddress(fromAddress);
                msg = {
                  sender: accCode,
                  symbol: symbol,
                  refid: refid,
                  msgType: "CancelOrderMsg"
                };
                signMsg = {
                  refid: refid,
                  sender: fromAddress,
                  symbol: symbol
                };
                _context8.next = 6;
                return this._prepareTransaction(msg, signMsg, fromAddress, sequence, "");

              case 6:
                signedTx = _context8.sent;
                return _context8.abrupt("return", this._broadcastDelegate(signedTx));

              case 8:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function cancelOrder(_x13, _x14, _x15) {
        return _cancelOrder.apply(this, arguments);
      }

      return cancelOrder;
    }()
    /**
     * Place an order.
     * @param {String} address
     * @param {String} symbol the market pair
     * @param {Number} side (1-Buy, 2-Sell)
     * @param {Number} price
     * @param {Number} quantity
     * @param {Number} sequence optional sequence
     * @param {Number} timeinforce (1-GTC(Good Till Expire), 3-IOC(Immediate or Cancel))
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "placeOrder",
    value: function () {
      var _placeOrder = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9() {
        var address,
            symbol,
            side,
            price,
            quantity,
            sequence,
            timeinforce,
            accCode,
            data,
            bigPrice,
            bigQuantity,
            placeOrderMsg,
            signMsg,
            signedTx,
            _args9 = arguments;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                address = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : this.address;
                symbol = _args9.length > 1 ? _args9[1] : undefined;
                side = _args9.length > 2 ? _args9[2] : undefined;
                price = _args9.length > 3 ? _args9[3] : undefined;
                quantity = _args9.length > 4 ? _args9[4] : undefined;
                sequence = _args9.length > 5 && _args9[5] !== undefined ? _args9[5] : null;
                timeinforce = _args9.length > 6 && _args9[6] !== undefined ? _args9[6] : 1;

                if (address) {
                  _context9.next = 9;
                  break;
                }

                throw new Error("address should not be falsy");

              case 9:
                if (symbol) {
                  _context9.next = 11;
                  break;
                }

                throw new Error("symbol should not be falsy");

              case 11:
                if (!(side !== 1 && side !== 2)) {
                  _context9.next = 13;
                  break;
                }

                throw new Error("side can only be 1 or 2");

              case 13:
                if (!(timeinforce !== 1 && timeinforce !== 3)) {
                  _context9.next = 15;
                  break;
                }

                throw new Error("timeinforce can only be 1 or 3");

              case 15:
                accCode = crypto.decodeAddress(address);

                if (!(sequence !== 0 && !sequence)) {
                  _context9.next = 21;
                  break;
                }

                _context9.next = 19;
                return this._httpClient.request("get", "".concat(api.getAccount, "/").concat(address));

              case 19:
                data = _context9.sent;
                sequence = data.result && data.result.sequence;

              case 21:
                bigPrice = new _big["default"](price);
                bigQuantity = new _big["default"](quantity);
                placeOrderMsg = {
                  sender: accCode,
                  id: "".concat(accCode.toString("hex"), "-").concat(sequence + 1).toUpperCase(),
                  symbol: symbol,
                  ordertype: 2,
                  side: side,
                  price: parseFloat(bigPrice.mul(BASENUMBER).toString(), 10),
                  quantity: parseFloat(bigQuantity.mul(BASENUMBER).toString(), 10),
                  timeinforce: timeinforce,
                  msgType: "NewOrderMsg"
                };
                signMsg = {
                  id: placeOrderMsg.id,
                  ordertype: placeOrderMsg.ordertype,
                  price: placeOrderMsg.price,
                  quantity: placeOrderMsg.quantity,
                  sender: address,
                  side: placeOrderMsg.side,
                  symbol: placeOrderMsg.symbol,
                  timeinforce: timeinforce
                };
                (0, _validateHelper.checkNumber)(placeOrderMsg.price, "price");
                (0, _validateHelper.checkNumber)(placeOrderMsg.quantity, "quantity");
                _context9.next = 29;
                return this._prepareTransaction(placeOrderMsg, signMsg, address, sequence, "");

              case 29:
                signedTx = _context9.sent;
                return _context9.abrupt("return", this._broadcastDelegate(signedTx));

              case 31:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function placeOrder() {
        return _placeOrder.apply(this, arguments);
      }

      return placeOrder;
    }()
    /**
     * @param {String} address
     * @param {Number} proposalId
     * @param {String} baseAsset
     * @param {String} quoteAsset
     * @param {Number} initPrice
     * @param {Number} sequence optional sequence
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "list",
    value: function () {
      var _list = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(address, proposalId, baseAsset, quoteAsset, initPrice) {
        var sequence,
            accCode,
            init_price,
            listMsg,
            signMsg,
            signedTx,
            _args10 = arguments;
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                sequence = _args10.length > 5 && _args10[5] !== undefined ? _args10[5] : null;
                accCode = crypto.decodeAddress(address);

                if (address) {
                  _context10.next = 4;
                  break;
                }

                throw new Error("address should not be falsy");

              case 4:
                if (!(proposalId <= 0)) {
                  _context10.next = 6;
                  break;
                }

                throw new Error("proposal id should larger than 0");

              case 6:
                if (!(initPrice <= 0)) {
                  _context10.next = 8;
                  break;
                }

                throw new Error("price should larger than 0");

              case 8:
                if (baseAsset) {
                  _context10.next = 10;
                  break;
                }

                throw new Error("baseAsset should not be falsy");

              case 10:
                if (quoteAsset) {
                  _context10.next = 12;
                  break;
                }

                throw new Error("quoteAsset should not be falsy");

              case 12:
                init_price = Number(new _big["default"](initPrice).mul(BASENUMBER).toString());
                listMsg = {
                  from: accCode,
                  proposal_id: proposalId,
                  base_asset_symbol: baseAsset,
                  quote_asset_symbol: quoteAsset,
                  init_price: init_price,
                  msgType: "ListMsg"
                };
                signMsg = {
                  base_asset_symbol: baseAsset,
                  from: address,
                  init_price: init_price,
                  proposal_id: proposalId,
                  quote_asset_symbol: quoteAsset
                };
                _context10.next = 17;
                return this._prepareTransaction(listMsg, signMsg, address, sequence, "");

              case 17:
                signedTx = _context10.sent;
                return _context10.abrupt("return", this._broadcastDelegate(signedTx));

              case 19:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));
      

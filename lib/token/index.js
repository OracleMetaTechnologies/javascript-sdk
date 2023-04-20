"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _big = _interopRequireDefault(require("big.js"));

var _tx = require("../tx/");

var crypto = _interopRequireWildcard(require("../crypto/"));

var _client = require("../client/");

var _validateHelper = require("../utils/validateHelper");

/**
 * @module Token
 */
var MAXTOTALSUPPLY = 9000000000000000000;

var validateNonZeroAmount = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(amount, symbol, fromAddress, httpClient) {
    var type,
        _yield$httpClient$req,
        result,
        balance,
        _args = arguments;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            type = _args.length > 4 && _args[4] !== undefined ? _args[4] : "free";

            if (!(amount <= 0 || amount > MAXTOTALSUPPLY)) {
              _context.next = 3;
              break;
            }

            throw new Error("invalid amount");

          case 3:
            _context.prev = 3;
            _context.next = 6;
            return httpClient.request("get", "".concat(_client.api.getAccount, "/").concat(fromAddress));

          case 6:
            _yield$httpClient$req = _context.sent;
            result = _yield$httpClient$req.result;
            balance = result.balances.find(function (b) {
              return b.symbol.toUpperCase() === symbol.toUpperCase();
            });

            if (balance) {
              _context.next = 11;
              break;
            }

            throw new Error("the account doesn't have ".concat(symbol));

          case 11:
            if (!(Number(balance[type]) < Number(amount))) {
              _context.next = 13;
              break;
            }

            throw new Error("the account doesn't have enougth balance");

          case 13:
            _context.next = 18;
            break;

          case 15:
            _context.prev = 15;
            _context.t0 = _context["catch"](3);
            //if get account failed. still broadcast
            console.log(_context.t0);

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 15]]);
  }));

  return function validateNonZeroAmount(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

var TokenManagement = /*#__PURE__*/function () {
  /**
   * @param {Object} bncClient
   */
  function TokenManagement(bncClient) {
    (0, _classCallCheck2["default"])(this, TokenManagement);

    if (!TokenManagement.instance) {
      this._bncClient = bncClient;
      TokenManagement.instance = this;
    }

    return TokenManagement.instance;
  }
  /**
   * create a new asset on Binance Chain
   * @param {String} - senderAddress
   * @param {String} - tokenName
   * @param {String} - symbol
   * @param {Number} - totalSupply
   * @param {Boolean} - mintable
   * @returns {Promise} resolves with response (success or fail)
   */

  
  (0, _createClass2["default"])(TokenManagement, [{
    key: "issue",
    value: function () {
      var _issue = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(senderAddress, tokenName, symbol) {
        var totalSupply,
            mintable,
            issueMsg,
            signIssueMsg,
            signedTx,
            _args2 = arguments;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                totalSupply = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : 0;
                mintable = _args2.length > 4 && _args2[4] !== undefined ? _args2[4] : false;

                if (senderAddress) {
                  _context2.next = 4;
                  break;
                }

                throw new Error("sender address cannot be empty");

              case 4:
                if (!(tokenName.length > 32)) {
                  _context2.next = 6;
                  break;
                }

                throw new Error("token name is limited to 32 characters");

              case 6:
                if (/^[a-zA-z\d]{3,8}$/.test(symbol)) {
                  _context2.next = 8;
                  break;
                }

                throw new Error("symbol should be alphanumeric and length is limited to 3~8");

              case 8:
                if (!(totalSupply <= 0 || totalSupply > MAXTOTALSUPPLY)) {
                  _context2.next = 10;
                  break;
                }

                throw new Error("invalid supply amount");

              case 10:
                totalSupply = new _big["default"](totalSupply);
                totalSupply = Number(totalSupply.mul(Math.pow(10, 8)).toString());
                issueMsg = {
                  from: crypto.decodeAddress(senderAddress),
                  name: tokenName,
                  symbol: symbol,
                  total_supply: totalSupply,
                  mintable: mintable,
                  msgType: _tx.TxTypes.IssueMsg
                };
                signIssueMsg = {
                  from: senderAddress,
                  name: tokenName,
                  symbol: symbol,
                  total_supply: totalSupply,
                  mintable: mintable
                };
                _context2.next = 16;
                return this._bncClient._prepareTransaction(issueMsg, signIssueMsg, senderAddress);

              case 16:
                signedTx = _context2.sent;
                return _context2.abrupt("return", this._bncClient._broadcastDelegate(signedTx));

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function issue(_x5, _x6, _x7) {
        return _issue.apply(this, arguments);
      }

      return issue;
    }()
    /**
     * freeze some amount of token
     * @param {String} fromAddress
     * @param {String} symbol
     * @param {String} amount
     * @returns {Promise}  resolves with response (success or fail)
     */
    

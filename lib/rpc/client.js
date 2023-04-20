"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _big = _interopRequireDefault(require("big.js"));

var _types = require("../decoder/types");

var decoder = _interopRequireWildcard(require("../decoder"));

var crypto = _interopRequireWildcard(require("../crypto"));

var _ = _interopRequireDefault(require("."));

var _validateHelper = require("../utils/validateHelper");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var BASENUMBER = Math.pow(10, 8);

var divide = function divide(num) {
  return +new _big["default"](num).div(BASENUMBER).toString();
};

var convertObjectArrayNum = function convertObjectArrayNum(objArr, keys) {
  objArr.forEach(function (item) {
    keys.forEach(function (key) {
      item[key] = divide(item[key]);
    });
  });
};
/**
 * The Binance Chain Node rpc client
 */


var Client = /*#__PURE__*/function (_BaseRpc) {
  (0, _inherits2["default"])(Client, _BaseRpc);

  var _super = _createSuper(Client);

  /**
   * @param {String} uriString dataseed address
   * @param {String} netWork Binance Chain network
   */
  function Client() {
    var _this;

    var uriString = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "localhost:27146";
    var netWork = arguments.length > 1 ? arguments[1] : undefined;
    (0, _classCallCheck2["default"])(this, Client);
    _this = _super.call(this, uriString);
    _this.netWork = netWork || "mainnet";
    return _this;
  }
  /**
   * The RPC broadcast delegate broadcasts a transaction via RPC. This is intended for optional use as BncClient's broadcast delegate.
   * @param {Transaction} signedTx the signed transaction
   * @return {Promise}
   */
  
  
  (0, _createClass2["default"])(Client, [{
    key: "broadcastDelegate",
    value: function () {
      var _broadcastDelegate = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(signedTx) {
        var encoded, res;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // amino encode the signed TX
                encoded = signedTx.serialize(); // broadcast it via RPC; we have to use a promise here because that's
                // what the BncClient expects as the return value of this function.

                _context.next = 3;
                return this.broadcastTxSync({
                  tx: Buffer.from(encoded, "hex")
                });

              case 3:
                res = _context.sent;

                if (!("".concat(res.code) === "0")) {
                  _context.next = 8;
                  break;
                }

                return _context.abrupt("return", res);

              case 8:
                throw new Error("broadcastDelegate: non-zero status code ".concat(res.code));

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function broadcastDelegate(_x) {
        return _broadcastDelegate.apply(this, arguments);
      }
      

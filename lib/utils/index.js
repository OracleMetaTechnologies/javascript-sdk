"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateSwapID = exports.calculateRandomNumberHash = exports.sha3 = exports.sha256 = exports.sha256ripemd160 = exports.ensureHex = exports.isHex = exports.reverseHex = exports.reverseArray = exports.hexXor = exports.num2VarInt = exports.num2hexstring = exports.int2hex = exports.hexstring2str = exports.str2hexstring = exports.ab2hexstring = exports.hexstring2ab = exports.str2ab = exports.ab2str = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _encHex = _interopRequireDefault(require("crypto-js/enc-hex"));

var _sha = _interopRequireDefault(require("crypto-js/sha3"));

var _sha2 = _interopRequireDefault(require("crypto-js/sha256"));

var _ripemd = _interopRequireDefault(require("crypto-js/ripemd160"));

var crypto = _interopRequireWildcard(require("../crypto"));

/**
 * @module utils
 */

/**
 * @param {arrayBuffer} buf
 * @returns {string} ASCII string
 */
var ab2str = function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
};
/**
 * @param {string} str - ASCII string
 * @returns {arrayBuffer}
 */


exports.ab2str = ab2str;

var str2ab = function str2ab(str) {
  if (typeof str !== "string") {
    throw new Error("str2ab expects a string");
  }

  var result = new Uint8Array(str.length);

  for (var i = 0, strLen = str.length; i < strLen; i++) {
    result[i] = str.charCodeAt(i);
  }

  return result;
};
/**
 * @param {string} str - HEX string
 * @returns {number[]}
 */


exports.str2ab = str2ab;

var hexstring2ab = function hexstring2ab(str) {
  ensureHex(str);
  if (!str.length) return new Uint8Array();
  var iters = str.length / 2;
  var result = new Uint8Array(iters);

  for (var i = 0; i < iters; i++) {
    result[i] = parseInt(str.substring(0, 2), 16);
    str = str.substring(2);
  }

  return result;
};
/**
 * @param {arrayBuffer} arr
 * @returns {string} HEX string
 */

exports.hexstring2ab = hexstring2ab;

var ab2hexstring = function ab2hexstring(arr) {
  if ((0, _typeof2["default"])(arr) !== "object") {
    throw new Error("ab2hexstring expects an array");
  }

  var result = "";

  for (var i = 0; i < arr.length; i++) {
    var str = arr[i].toString(16);
    str = str.length === 0 ? "00" : str.length === 1 ? "0" + str : str;
    result += str;
  }

  return result;
};
/**
 * @param {string} str - ASCII string
 * @returns {string} HEX string
 */

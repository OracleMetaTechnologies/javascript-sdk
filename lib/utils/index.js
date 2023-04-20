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

exports.ab2hexstring = ab2hexstring;

var str2hexstring = function str2hexstring(str) {
  return ab2hexstring(str2ab(str));
};
/**
 * @param {string} hexstring - HEX string
 * @returns {string} ASCII string
 */


exports.str2hexstring = str2hexstring;

var hexstring2str = function hexstring2str(hexstring) {
  return ab2str(hexstring2ab(hexstring));
};
/**
 * convert an integer to big endian hex and add leading zeros
 * @param {Number} num
 * @returns {string}
 */


exports.hexstring2str = hexstring2str;

var int2hex = function int2hex(num) {
  if (typeof num !== "number") {
    throw new Error("int2hex expects a number");
  }

  var h = num.toString(16);
  return h.length % 2 ? "0" + h : h;
};
/**
 * Converts a number to a big endian hexstring of a suitable size, optionally little endian
 * @param {Number} num
 * @param {Number} size - The required size in bytes, eg 1 for Uint8, 2 for Uint16. Defaults to 1.
 * @param {Boolean} littleEndian - Encode the hex in little endian form
 * @return {string}
 */

exports.int2hex = int2hex;

var num2hexstring = function num2hexstring(num) {
  var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var littleEndian = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (typeof num !== "number") throw new Error("num must be numeric");
  if (num < 0) throw new RangeError("num is unsigned (>= 0)");
  if (size % 1 !== 0) throw new Error("size must be a whole integer");
  if (!Number.isSafeInteger(num)) throw new RangeError("num (".concat(num, ") must be a safe integer"));
  size = size * 2;
  var hexstring = num.toString(16);
  hexstring = hexstring.length % size === 0 ? hexstring : ("0".repeat(size) + hexstring).substring(hexstring.length);
  if (littleEndian) hexstring = reverseHex(hexstring);
  return hexstring;
};
/**
 * Converts a number to a variable length Int. Used for array length header
 * @param {Number} num - The number
 * @returns {string} hexstring of the variable Int.
 */


"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SubmitProposalMsg = exports.OrderBook = exports.OrderBookLevel = exports.TradingPair = exports.OpenOrder = exports.TokenBalance = exports.AppAccount = exports.BaseAccount = exports.Coin = exports.TokenOfList = exports.Token = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var addMsgType = function addMsgType(type, msgTypeName) {
  type.prototype.msgType = msgTypeName;
};

var Token = function Token(opts) {
  (0, _classCallCheck2["default"])(this, Token);
  opts = opts || {};
  this.name = opts.name || "";
  this.symbol = opts.symbol || "";
  this.original_symbol = opts.original_symbol || "";
  this.total_supply = opts.total_supply || 0;
  this.owner = opts.owner || Buffer.alloc(0);
  this.mintable = opts.mintable || false;
};

exports.Token = Token;

var TokenOfList = function TokenOfList(opts) {
  (0, _classCallCheck2["default"])(this, TokenOfList);
  opts = opts || {};
  this.name = opts.name || "";
  this.symbol = opts.symbol || "";
  this.original_symbol = opts.original_symbol || "";
  this.total_supply = opts.total_supply || 0;
  this.owner = opts.owner || Buffer.alloc(0);
  this.mintable = opts.mintable || false;
};

exports.TokenOfList = TokenOfList;

var Coin = function Coin(opts) {
  (0, _classCallCheck2["default"])(this, Coin);
  opts = opts || {};
  this.denom = opts.denom || "";
  this.amount = opts.amount || 0;
};

exports.Coin = Coin;

var BaseAccount = function BaseAccount(opts) {
  (0, _classCallCheck2["default"])(this, BaseAccount);
  opts = opts || {};
  this.address = opts.address || Buffer.alloc(0);
  this.coins = opts.coins || [new Coin()];
  this.public_key = opts.public_key || Buffer.alloc(0);
  this.account_number = opts.account_number || 0;
  this.sequence = opts.sequence || 0;
};

exports.BaseAccount = BaseAccount;

var AppAccount = function AppAccount(opts) {
  (0, _classCallCheck2["default"])(this, AppAccount);
  opts = opts || {};
  this.base = opts.base || new BaseAccount();
  this.name = opts.name || "";
  this.locked = opts.locked || [new Coin()];
  this.frozen = opts.frozen || [new Coin()];
};

exports.AppAccount = AppAccount;

var TokenBalance = function TokenBalance(opts) {
  (0, _classCallCheck2["default"])(this, TokenBalance);
  opts = opts || {};
  this.symbol = opts.symbol || "";
  this.free = opts.free || 0;
  this.locked = opts.locked || 0;
  this.frozen = opts.frozen || 0;
};

exports.TokenBalance = TokenBalance;

var OpenOrder = function OpenOrder(opts) {
  (0, _classCallCheck2["default"])(this, OpenOrder);
  opts = opts || {};
  this.id = opts.id || "";
  this.symbol = opts.symbol || "";
  this.price = opts.price || 0;
  this.quantity = opts.quantity || 0;
  this.cumQty = opts.cumQty || 0;
  this.createdHeight = opts.createdHeight || 0;
  this.createdTimestamp = opts.createdTimestamp || 0;
  this.lastUpdatedHeight = opts.lastUpdatedHeight || 0;
  this.lastUpdatedTimestamp = opts.lastUpdatedTimestamp || 0;
};

exports.OpenOrder = OpenOrder;

var TradingPair = function TradingPair(opts) {
  (0, _classCallCheck2["default"])(this, TradingPair);
  opts = opts || {};
  this.base_asset_symbol = opts.base_asset_symbol || "";
  this.quote_asset_symbol = opts.quote_asset_symbol || "";
  this.list_price = opts.list_price || 0;
  this.tick_size = opts.tick_size || 0;
  this.lot_size = opts.lot_size || 0;
};

exports.TradingPair = TradingPair;

var OrderBookLevel = function OrderBookLevel(opts) {
  (0, _classCallCheck2["default"])(this, OrderBookLevel);
  opts = opts || {};
  this.buyQty = opts.buyQty || 0;
  this.buyPrice = opts.buyPrice || 0;
  this.sellQty = opts.sellQty || 0;
  this.sellPrice = opts.sellPrice || 0;
};

exports.OrderBookLevel = OrderBookLevel;

var OrderBook = function OrderBook(opts) {
  (0, _classCallCheck2["default"])(this, OrderBook);
  opts = opts || {};
  this.height = opts.height || 0;
  this.levels = opts.levels || [new OrderBookLevel()];
};

exports.OrderBook = OrderBook;

var SubmitProposalMsg = function SubmitProposalMsg(opts) {
  (0, _classCallCheck2["default"])(this, SubmitProposalMsg);
  opts = opts || {};
  this.title = opts.title || "";
  this.description = opts.description || "";
  this.proposal_type = opts.proposal_type || 0;
  this.proposer = opts.proposer || Buffer.alloc(0);
  this.initial_deposit = opts.initial_deposit || [];
  this.voting_period = opts.voting_period || 0;
};

exports.SubmitProposalMsg = SubmitProposalMsg;
addMsgType(Token, "Token");
addMsgType(AppAccount, "bnbchain/Account");
addMsgType(SubmitProposalMsg, "MsgSubmitProposal");

/* global QUnit */

const { test } = QUnit

const LONG_TIMEOUT = 15000

const EXPECTED_VERSION_MAJOR = 1
const EXPECTED_VERSION_MINOR = 1

let isBrowser
let Ledger, crypto
let app, response

// tests support both browser and node. find out which we're in
if (typeof window !== "undefined") {
  isBrowser = true
  crypto = window.SDK.crypto
  Ledger = window.SDK.Ledger
  window.Buffer = Buffer.Buffer // it's polyfilled
} else {
  isBrowser = false // is node.js
  Ledger = require("../lib/ledger")
  crypto = require("../lib/crypto")
}

//#region Init Connection

const getApp = async function(timeout = LONG_TIMEOUT) {
  const transClass = isBrowser ? Ledger.transports.u2f : Ledger.transports.node
  const transport = await transClass.create(timeout)
  app = new Ledger.app(transport)

  return app
}

QUnit.begin(async function() {
  console.log(
    "Attempting to connect to hardware wallet, please ensure that it is plugged in and the app is open."
  )
  console.log(
    "If the device is not connected or the app is not open, exit and rerun this test when it is."
  )
  try {
    app = await getApp()
  } catch (err) {
    console.error(
      "Unable to connect to hardware wallet. Please connect it and open the app.",
      err
    )
  }
})

//#endregion

//#region GET_VERSION

QUnit.module("GET_VERSION", {
  before: async function() {
    response = {} // clear
    try {
      const version = await app.getVersion()
      response = version
      console.log(response)
    } catch (err) {
      console.error(
        "Error invoking GET_VERSION. Please connect it and open the app.",
        err
      )
    }
  }
})

test("status code is 0x9000", function(assert) {
  assert.equal(response.return_code, 0x9000, "Status code is 0x9000")
})

test("has property test_mode", function(assert) {
  assert.ok(response.test_mode !== undefined, "Passed")
})

test("has property major", function(assert) {
  assert.ok(response.major !== undefined, "Passed")
})

test("has property minor", function(assert) {
  assert.ok(response.minor !== undefined, "Passed")
})

test("has property patch", function(assert) {
  assert.ok(response.patch !== undefined, "Passed")
})

test("app has matching version", function(assert) {
  assert.ok(response.major === EXPECTED_VERSION_MAJOR, "Passed")
  assert.ok(response.minor === EXPECTED_VERSION_MINOR, "Passed")
})

//#endregion

//#region PUBLIC_KEY_SECP256K1

QUnit.module("PUBLIC_KEY_SECP256K1", {
  before: async function() {
    response = {} // clear
    try {
      const hdPath = [44, 714, 0, 0, 0]
      response = await app.getPublicKey(hdPath)
      console.log(response)
    } catch (err) {
      console.error(
        "Error invoking PUBLIC_KEY_SECP256K1. Please connect it and open the app.",
        err
      )
    }
  }
})

test("status code is 0x9000", function(assert) {
  assert.equal(response.return_code, 0x9000, "Status code is 0x9000")
})

test("has property pk", function(assert) {
  assert.ok(response.pk !== undefined, "Passed")
})

test("pk is the correct size", function(assert) {
  assert.equal(response.pk.length, 1 + 64, "Passed") // 1 byte PK prefix
})

// the 0x04 prefix represents an uncompressed pubkey
// https://github.com/libbitcoin/libbitcoin-system/wiki/Elliptic-Curve-Operations#point-operations-on-the-elliptic-curve
test("pk is prefixed with 0x04", function(assert) {
  console.log("device public key:", response.pk.toString("hex"))
  assert.equal(response.pk[0], 0x04, "Passed")
})

// the 0x9000 suffix was being incorrectly appended, this test checks that it's not there now
test("pk does not end in 0x9000", function(assert) {
  assert.notOk(response.pk.toString("hex").endsWith("9000"), "Passed")
})

//#endregion

//#region PUBLIC_KEY_SECP256K1 (bad hdPath throws #1)

let badPkErrored, badPkErrorMsg, badPkErrorCode
QUnit.module("PUBLIC_KEY_SECP256K1 - bad path 1", {
  before: async function() {
    response = {} // clear
    try {
      const hdPath = [44, 714, 0] // too short
      response = await app.getPublicKey(hdPath)
      badPkErrored = false
    } catch (err) {
      badPkErrored = true
      badPkErrorMsg = err.message
      badPkErrorCode = err.statusCode
    }
  }
})

test("did throw an error", function(assert) {
  assert.ok(badPkErrored, "Passed")
})

test("error message is 'Ledger device: UNKNOWN_ERROR (0x6984)'", function(assert) {
  assert.equal(
    badPkErrorMsg,
    "Ledger device: UNKNOWN_ERROR (0x6984)",
    "Error message is 'Ledger device: UNKNOWN_ERROR (0x6984)'"
  )
})

test("status code is 0x6984", function(assert) {
  assert.equal(badPkErrorCode, 0x6984, "Status code is 0x6984")
})

//#endregion

//#region PUBLIC_KEY_SECP256K1 (bad hdPath throws #2)

QUnit.module("PUBLIC_KEY_SECP256K1 - bad path 2", {
  before: async function() {
    response = {} // clear
    try {
      const hdPath = [44, 714, 0, 1, 0] // `change` node must be 0
      response = await app.getPublicKey(hdPath)
      badPkErrored = false
    } catch (err) {
      badPkErrored = true
      badPkErrorMsg = err.message
    }
  }
})

test("did throw an error", function(assert) {
  assert.ok(badPkErrored, "Passed")
})

test("error message is 'Ledger device: UNKNOWN_ERROR (0x6984)'", function(assert) {
  assert.equal(
    badPkErrorMsg,
    "Ledger device: UNKNOWN_ERROR (0x6984)",
    "Error message is 'Ledger device: UNKNOWN_ERROR (0x6984)'"
  )
})

test("status code is 0x6984", function(assert) {
  assert.equal(badPkErrorCode, 0x6984, "Status code is 0x6984")
})

module.exports = {
  parserOptions: {
    parser: require.resolve("babel-eslint"),
    ecmaVersion: 2018,
    sourceType: "module"
  },
env: {
    es6: true,
    node: true,
    browser: true,
    jest: true
  },

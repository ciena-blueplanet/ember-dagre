module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  extends: 'frost-standard',
  env: {
    browser: true
  },
  rules: {
    "ocd/sort-import-declarations": [
      1,
      {
        "localPrefixes": [
          "../",
          "./",
          "dummy/",
          "ember-frost-test"
        ]
      }
    ]
  }
}

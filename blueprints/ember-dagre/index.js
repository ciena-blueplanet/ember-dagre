module.exports = {
  afterInstall: function () {
    return this.addAddonsToProject({
      packages: [
        {name: 'ember-graphlib', target: '>=0.1.0 <2.0.0'},
        {name: 'ember-lodash-shim', target: '0.1.2'}
      ]
    })
  },

  normalizeEntityName: function () {
    // this prevents an error when the entityName is not specified
  }
}

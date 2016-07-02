module.exports = {
  afterInstall: function () {
    return this.addAddonsToProject({
      packages: [
        {name: 'ember-graphlib', target: '>=0.0.5 <2.0.0'},
        {name: 'ember-lodash', target: '>=0.0.9 <2.0.0'}
      ]
    })
  },

  normalizeEntityName: function () {
    // this prevents an error when the entityName is not specified
  }
}

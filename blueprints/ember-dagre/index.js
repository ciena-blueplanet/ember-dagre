module.exports = {
  afterInstall: function () {
    return this.addPackagesToProject([
      {name: 'ciena-dagre', target: '^1.0.9'}
    ])
      .then(() => {
        return this.addAddonsToProject({
          packages: [
            {name: 'ember-graphlib', target: '^2.2.3'},
            {name: 'ember-lodash-shim', target: '^2.0.5'}
          ]
        })
      })
  },

  normalizeEntityName: function () {
    // this prevents an error when the entityName is not specified
  }
}

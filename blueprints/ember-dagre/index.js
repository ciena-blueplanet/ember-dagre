module.exports = {
  afterInstall: function () {
    return this.addPackagesToProject([
      {name: 'dagre'}
    ])
      .then(() => {
        return this.addAddonsToProject({
          packages: [
            {name: 'ember-lodash', target: '>=0.0.9 <2.0.0'}
          })
      })
  },

  normalizeEntityName: function () {
    // this prevents an error when the entityName is not specified
  }
}

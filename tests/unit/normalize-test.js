import {expect} from 'chai'
import normalize from 'ciena-dagre/normalize'
import {Graph} from 'ciena-graphlib'
import {sortByProps} from 'dummy/tests/helpers/array-helpers'
import {beforeEach, describe, it} from 'mocha'

describe('normalize', function () {
  let g

  beforeEach(function () {
    g = new Graph({multigraph: true, compound: true}).setGraph({})
  })

  describe('run', function () {
    it('should not change a short edge', function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 1})
      g.setEdge('a', 'b', {})

      normalize.run(g)

      expect(g.edges().map(incidentNodes)).to.eql([{v: 'a', w: 'b'}])
      expect(g.node('a').rank).to.equal(0)
      expect(g.node('b').rank).to.equal(1)
    })

    it('should split a two layer edge into two segments', function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 2})
      g.setEdge('a', 'b', {})

      normalize.run(g)

      expect(g.successors('a')).to.have.length(1)
      const successor = g.successors('a')[0]
      expect(g.node(successor).dummy).to.equal('edge')
      expect(g.node(successor).rank).to.equal(1)
      expect(g.successors(successor)).to.eql(['b'])
      expect(g.node('a').rank).to.equal(0)
      expect(g.node('b').rank).to.equal(2)

      expect(g.graph().dummyChains).to.have.length(1)
      expect(g.graph().dummyChains[0]).to.equal(successor)
    })

    it('should assign width = 0, height = 0 to dummy nodes by default', function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 2})
      g.setEdge('a', 'b', {width: 10, height: 10})

      normalize.run(g)

      expect(g.successors('a')).to.have.length(1)
      const successor = g.successors('a')[0]
      expect(g.node(successor).width).to.equal(0)
      expect(g.node(successor).height).to.equal(0)
    })

    it('should assign width and height from the edge for the node on labelRank', function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 4})
      g.setEdge('a', 'b', {width: 20, height: 10, labelRank: 2})

      normalize.run(g)

      const labelV = g.successors(g.successors('a')[0])[0]
      const labelNode = g.node(labelV)
      expect(labelNode.width).to.equal(20)
      expect(labelNode.height).to.equal(10)
    })

    it('should preserve the weight for the edge', function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 2})
      g.setEdge('a', 'b', {weight: 2})

      normalize.run(g)

      expect(g.successors('a')).to.have.length(1)
      expect(g.edge('a', g.successors('a')[0]).weight).to.equal(2)
    })
  })

  describe('undo', function () {
    it('should reverse the run operation', function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 2})
      g.setEdge('a', 'b', {})

      normalize.run(g)
      normalize.undo(g)

      expect(g.edges().map(incidentNodes)).to.eql([{v: 'a', w: 'b'}])
      expect(g.node('a').rank).to.equal(0)
      expect(g.node('b').rank).to.equal(2)
    })

    it('should restore previous edge labels', function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 2})
      g.setEdge('a', 'b', {foo: 'bar'})

      normalize.run(g)
      normalize.undo(g)

      expect(g.edge('a', 'b').foo).equals('bar')
    })

    it("should collect assigned coordinates into the 'points' attribute", function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 2})
      g.setEdge('a', 'b', {})

      normalize.run(g)

      let dummyLabel = g.node(g.neighbors('a')[0])
      dummyLabel.x = 5
      dummyLabel.y = 10

      normalize.undo(g)

      expect(g.edge('a', 'b').points).eqls([{x: 5, y: 10}])
    })

    it("should merge assigned coordinates into the 'points' attribute", function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 4})
      g.setEdge('a', 'b', {})

      normalize.run(g)

      let aSucLabel = g.node(g.neighbors('a')[0])
      aSucLabel.x = 5
      aSucLabel.y = 10

      let midLabel = g.node(g.successors(g.successors('a')[0])[0])
      midLabel.x = 20
      midLabel.y = 25

      let bPredLabel = g.node(g.neighbors('b')[0])
      bPredLabel.x = 100
      bPredLabel.y = 200

      normalize.undo(g)

      expect(g.edge('a', 'b').points)
        .eqls([{x: 5, y: 10}, {x: 20, y: 25}, {x: 100, y: 200}])
    })

    it('should set coords and dims for the label, if the edge has one', function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 2})
      g.setEdge('a', 'b', {width: 10, height: 20, labelRank: 1})

      normalize.run(g)

      let labelNode = g.node(g.successors('a')[0])
      labelNode.x = 50
      labelNode.y = 60
      labelNode.width = 20
      labelNode.height = 10

      normalize.undo(g)

      expect(['x', 'y', 'width', 'height'].reduce((acc, key) => ({...acc, [key]: g.edge('a', 'b')[key]}), {})).eqls({
        x: 50, y: 60, width: 20, height: 10
      })
    })

    it('should set coords and dims for the label, if the long edge has one', function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 4})
      g.setEdge('a', 'b', {width: 10, height: 20, labelRank: 2})

      normalize.run(g)

      let labelNode = g.node(g.successors(g.successors('a')[0])[0])
      labelNode.x = 50
      labelNode.y = 60
      labelNode.width = 20
      labelNode.height = 10

      normalize.undo(g)

      expect(['x', 'y', 'width', 'height'].reduce((acc, key) => ({...acc, [key]: g.edge('a', 'b')[key]}), {})).eqls({
        x: 50, y: 60, width: 20, height: 10
      })
    })

    it('should restore multi-edges', function () {
      g.setNode('a', {rank: 0})
      g.setNode('b', {rank: 2})
      g.setEdge('a', 'b', {}, 'bar')
      g.setEdge('a', 'b', {}, 'foo')

      normalize.run(g)

      const outEdges = g.outEdges('a').sort(sortByProps(['name']))
      expect(outEdges).to.have.length(2)

      let barDummy = g.node(outEdges[0].w)
      barDummy.x = 5
      barDummy.y = 10

      let fooDummy = g.node(outEdges[1].w)
      fooDummy.x = 15
      fooDummy.y = 20

      normalize.undo(g)

      expect(g.hasEdge('a', 'b')).to.equal(false)
      expect(g.edge('a', 'b', 'bar').points).eqls([{x: 5, y: 10}])
      expect(g.edge('a', 'b', 'foo').points).eqls([{x: 15, y: 20}])
    })
  })
})

function incidentNodes (edge) {
  return {v: edge.v, w: edge.w}
}

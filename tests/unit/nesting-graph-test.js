import {expect} from 'chai'
import nestingGraph from 'ciena-dagre/nesting-graph'
import {Graph, alg} from 'ciena-graphlib'
const {components} = alg
import {beforeEach, describe, it} from 'mocha'

describe('rank/nestingGraph', function () {
  let g

  beforeEach(function () {
    g = new Graph({compound: true})
      .setGraph({})
      .setDefaultNodeLabel(function () { return {} })
  })

  describe('run', function () {
    it('should connect a disconnected graph', function () {
      g.setNode('a')
      g.setNode('b')
      expect(components(g)).to.have.length(2)
      nestingGraph.run(g)
      expect(components(g)).to.have.length(1)
      expect(g.hasNode('a'))
      expect(g.hasNode('b'))
    })

    it('should add border nodes to the top and bottom of a subgraph', function () {
      g.setParent('a', 'sg1')
      nestingGraph.run(g)

      const borderTop = g.node('sg1').borderTop
      const borderBottom = g.node('sg1').borderBottom
      expect(borderTop).not.to.be.oneOf([null, undefined])
      expect(borderBottom).not.to.be.oneOf([null, undefined])
      expect(g.parent(borderTop)).to.equal('sg1')
      expect(g.parent(borderBottom)).to.equal('sg1')
      expect(g.outEdges(borderTop, 'a')).to.have.length(1)
      expect(g.edge(g.outEdges(borderTop, 'a')[0]).minlen).equals(1)
      expect(g.outEdges('a', borderBottom)).to.have.length(1)
      expect(g.edge(g.outEdges('a', borderBottom)[0]).minlen).equals(1)
      expect(g.node(borderTop)).eqls({width: 0, height: 0, dummy: 'border'})
      expect(g.node(borderBottom)).eqls({width: 0, height: 0, dummy: 'border'})
    })

    it('should add edges between borders of nested subgraphs', function () {
      g.setParent('sg2', 'sg1')
      g.setParent('a', 'sg2')
      nestingGraph.run(g)

      const sg1Top = g.node('sg1').borderTop
      const sg1Bottom = g.node('sg1').borderBottom
      const sg2Top = g.node('sg2').borderTop
      const sg2Bottom = g.node('sg2').borderBottom
      expect(sg1Top).not.to.be.oneOf([null, undefined])
      expect(sg1Bottom).not.to.be.oneOf([null, undefined])
      expect(sg2Top).not.to.be.oneOf([null, undefined])
      expect(sg2Bottom).not.to.be.oneOf([null, undefined])
      expect(g.outEdges(sg1Top, sg2Top)).to.have.length(1)
      expect(g.edge(g.outEdges(sg1Top, sg2Top)[0]).minlen).equals(1)
      expect(g.outEdges(sg2Bottom, sg1Bottom)).to.have.length(1)
      expect(g.edge(g.outEdges(sg2Bottom, sg1Bottom)[0]).minlen).equals(1)
    })

    it('should add sufficient weight to border to node edges', function () {
      // We want to keep subgraphs tight, so we should ensure that the weight for
      // the edge between the top (and bottom) border nodes and nodes in the
      // subgraph have weights exceeding anything in the graph.
      g.setParent('x', 'sg')
      g.setEdge('a', 'x', {weight: 100})
      g.setEdge('x', 'b', {weight: 200})
      nestingGraph.run(g)

      const top = g.node('sg').borderTop
      const bot = g.node('sg').borderBottom
      expect(g.edge(top, 'x').weight).to.be.gt(300)
      expect(g.edge('x', bot).weight).to.be.gt(300)
    })

    it('should add an edge from the root to the tops of top-level subgraphs', function () {
      g.setParent('a', 'sg1')
      nestingGraph.run(g)

      const root = g.graph().nestingRoot
      const borderTop = g.node('sg1').borderTop
      expect(root).not.to.be.oneOf([null, undefined])
      expect(borderTop).not.to.be.oneOf([null, undefined])
      expect(g.outEdges(root, borderTop)).to.have.length(1)
      expect(g.hasEdge(g.outEdges(root, borderTop)[0])).to.equal(true)
    })

    it('should add an edge from root to each node with the correct minlen #1', function () {
      g.setNode('a')
      nestingGraph.run(g)

      const root = g.graph().nestingRoot
      expect(root).not.to.be.oneOf([null, undefined])
      expect(g.outEdges(root, 'a')).to.have.length(1)
      expect(g.edge(g.outEdges(root, 'a')[0])).eqls({weight: 0, minlen: 1})
    })

    it('should add an edge from root to each node with the correct minlen #2', function () {
      g.setParent('a', 'sg1')
      nestingGraph.run(g)

      const root = g.graph().nestingRoot
      expect(root).not.to.be.oneOf([null, undefined])
      expect(g.outEdges(root, 'a')).to.have.length(1)
      expect(g.edge(g.outEdges(root, 'a')[0])).eqls({weight: 0, minlen: 3})
    })

    it('should add an edge from root to each node with the correct minlen #3', function () {
      g.setParent('sg2', 'sg1')
      g.setParent('a', 'sg2')
      nestingGraph.run(g)

      const root = g.graph().nestingRoot
      expect(root).not.to.be.oneOf([null, undefined])
      expect(g.outEdges(root, 'a')).to.have.length(1)
      expect(g.edge(g.outEdges(root, 'a')[0])).eqls({weight: 0, minlen: 5})
    })

    it('should not add an edge from the root to itself', function () {
      g.setNode('a')
      nestingGraph.run(g)

      const root = g.graph().nestingRoot
      expect(g.outEdges(root, root)).eqls([])
    })

    it('should expand inter-node edges to separate SG border and nodes #1', function () {
      g.setEdge('a', 'b', {minlen: 1})
      nestingGraph.run(g)
      expect(g.edge('a', 'b').minlen).equals(1)
    })

    it('should expand inter-node edges to separate SG border and nodes #2', function () {
      g.setParent('a', 'sg1')
      g.setEdge('a', 'b', {minlen: 1})
      nestingGraph.run(g)
      expect(g.edge('a', 'b').minlen).equals(3)
    })

    it('should expand inter-node edges to separate SG border and nodes #3', function () {
      g.setParent('sg2', 'sg1')
      g.setParent('a', 'sg2')
      g.setEdge('a', 'b', {minlen: 1})
      nestingGraph.run(g)
      expect(g.edge('a', 'b').minlen).equals(5)
    })

    it('should set minlen correctly for nested SG boder to children', function () {
      g.setParent('a', 'sg1')
      g.setParent('sg2', 'sg1')
      g.setParent('b', 'sg2')
      nestingGraph.run(g)

      // We expect the following layering:
      //
      // 0: root
      // 1: empty (close sg2)
      // 2: empty (close sg1)
      // 3: open sg1
      // 4: open sg2
      // 5: a, b
      // 6: close sg2
      // 7: close sg1

      const root = g.graph().nestingRoot
      const sg1Top = g.node('sg1').borderTop
      const sg1Bot = g.node('sg1').borderBottom
      const sg2Top = g.node('sg2').borderTop
      const sg2Bot = g.node('sg2').borderBottom

      expect(g.edge(root, sg1Top).minlen).equals(3)
      expect(g.edge(sg1Top, sg2Top).minlen).equals(1)
      expect(g.edge(sg1Top, 'a').minlen).equals(2)
      expect(g.edge('a', sg1Bot).minlen).equals(2)
      expect(g.edge(sg2Top, 'b').minlen).equals(1)
      expect(g.edge('b', sg2Bot).minlen).equals(1)
      expect(g.edge(sg2Bot, sg1Bot).minlen).equals(1)
    })
  })

  describe('cleanup', function () {
    it('should remove nesting graph edges', function () {
      g.setParent('a', 'sg1')
      g.setEdge('a', 'b', {minlen: 1})
      nestingGraph.run(g)
      nestingGraph.cleanup(g)
      expect(g.successors('a')).eqls(['b'])
    })

    it('should remove the root node', function () {
      g.setParent('a', 'sg1')
      nestingGraph.run(g)
      nestingGraph.cleanup(g)
      expect(g.nodeCount()).to.equal(4) // sg1 + sg1Top + sg1Bottom + "a"
    })
  })
})

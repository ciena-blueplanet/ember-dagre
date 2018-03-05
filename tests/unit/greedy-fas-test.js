import {expect} from 'chai'
import greedyFAS from 'ciena-dagre/greedy-fas'
import {Graph, alg} from 'ciena-graphlib'
const {findCycles} = alg
import {sortByProps} from 'dummy/tests/helpers/array-helpers'
import {beforeEach, describe, it} from 'mocha'

describe('greedyFAS', function () {
  let g

  beforeEach(function () {
    g = new Graph()
  })

  it('should return the empty set for empty graphs', function () {
    expect(greedyFAS(g)).to.eql([])
  })

  it('should return the empty set for single-node graphs', function () {
    g.setNode('a')
    expect(greedyFAS(g)).to.eql([])
  })

  it('should return an empty set if the input graph is acyclic', function () {
    let g = new Graph()
    g.setEdge('a', 'b')
    g.setEdge('b', 'c')
    g.setEdge('b', 'd')
    g.setEdge('a', 'e')
    expect(greedyFAS(g)).to.eql([])
  })

  it('should return a single edge with a simple cycle', function () {
    let g = new Graph()
    g.setEdge('a', 'b')
    g.setEdge('b', 'a')
    checkFAS(g, greedyFAS(g))
  })

  it('should return a single edge in a 4-node cycle', function () {
    let g = new Graph()
    g.setEdge('n1', 'n2')
    g.setPath(['n2', 'n3', 'n4', 'n5', 'n2'])
    g.setEdge('n3', 'n5')
    g.setEdge('n4', 'n2')
    g.setEdge('n4', 'n6')
    checkFAS(g, greedyFAS(g))
  })

  it('should return two edges for two 4-node cycles', function () {
    let g = new Graph()
    g.setEdge('n1', 'n2')
    g.setPath(['n2', 'n3', 'n4', 'n5', 'n2'])
    g.setEdge('n3', 'n5')
    g.setEdge('n4', 'n2')
    g.setEdge('n4', 'n6')
    g.setPath(['n6', 'n7', 'n8', 'n9', 'n6'])
    g.setEdge('n7', 'n9')
    g.setEdge('n8', 'n6')
    g.setEdge('n8', 'n10')
    checkFAS(g, greedyFAS(g))
  })

  it('should work with arbitrarily weighted edges', function () {
    // Our algorithm should also work for graphs with multi-edges, a graph
    // where more than one edge can be pointing in the same direction between
    // the same pair of incident nodes. We try this by assigning weights to
    // our edges representing the number of edges from one node to the other.

    let g1 = new Graph()
    g1.setEdge('n1', 'n2', 2)
    g1.setEdge('n2', 'n1', 1)
    expect(greedyFAS(g1, weightFn(g1))).to.eql([{v: 'n2', w: 'n1'}])

    let g2 = new Graph()
    g2.setEdge('n1', 'n2', 1)
    g2.setEdge('n2', 'n1', 2)
    expect(greedyFAS(g2, weightFn(g2))).to.eql([{v: 'n1', w: 'n2'}])
  })

  it('should work for multigraphs', function () {
    let g = new Graph({multigraph: true})
    g.setEdge('a', 'b', 5, 'foo')
    g.setEdge('b', 'a', 2, 'bar')
    g.setEdge('b', 'a', 2, 'baz')
    expect(greedyFAS(g, weightFn(g)).sort(sortByProps(['name']))).to.eql([
      {v: 'b', w: 'a', name: 'bar'},
      {v: 'b', w: 'a', name: 'baz'}
    ])
  })
})

function checkFAS (g, fas) {
  const n = g.nodeCount()
  const m = g.edgeCount()
  fas.forEach(edge => {
    g.removeEdge(edge.v, edge.w)
  })
  expect(findCycles(g)).to.eql([])
  // The more direct m/2 - n/6 fails for the simple cycle A <-> B, where one
  // edge must be reversed, but the performance bound implies that only 2/3rds
  // of an edge can be reversed. I'm using floors to acount for this.
  expect(fas.length).to.be.lte(Math.floor(m / 2) - Math.floor(n / 6))
}

function weightFn (g) {
  return function (e) {
    return g.edge(e)
  }
}

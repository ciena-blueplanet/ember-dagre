import {expect} from 'chai'
import addSubgraphConstraints from 'ciena-dagre/order/add-subgraph-constraints'
import {Graph} from 'ciena-graphlib'
import {sortByProps} from 'dummy/tests/helpers/array-helpers'
import {beforeEach, describe, it} from 'mocha'

describe('order/addSubgraphConstraints', function () {
  let g
  let cg

  beforeEach(function () {
    g = new Graph({compound: true})
    cg = new Graph()
  })

  it('should not change CG for a flat set of nodes', function () {
    const vs = ['a', 'b', 'c', 'd']
    vs.forEach(v => g.setNode(v))
    addSubgraphConstraints(g, cg, vs)
    expect(cg.nodeCount()).equals(0)
    expect(cg.edgeCount()).equals(0)
  })

  it("shouldn't create a constraint for contiguous subgraph nodes", function () {
    const vs = ['a', 'b', 'c']
    vs.forEach(v => g.setParent(v, 'sg'))
    addSubgraphConstraints(g, cg, vs)
    expect(cg.nodeCount()).equals(0)
    expect(cg.edgeCount()).equals(0)
  })

  it('should add a constraint when the parents for adjacent nodes are different', function () {
    const vs = ['a', 'b']
    g.setParent('a', 'sg1')
    g.setParent('b', 'sg2')
    addSubgraphConstraints(g, cg, vs)
    expect(cg.edges()).eqls([{v: 'sg1', w: 'sg2'}])
  })

  it('should work for multiple levels', function () {
    const vs = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    vs.forEach(v => g.setNode(v))
    g.setParent('b', 'sg2')
    g.setParent('sg2', 'sg1')
    g.setParent('c', 'sg1')
    g.setParent('d', 'sg3')
    g.setParent('sg3', 'sg1')
    g.setParent('f', 'sg4')
    g.setParent('g', 'sg5')
    g.setParent('sg5', 'sg4')
    addSubgraphConstraints(g, cg, vs)
    expect(cg.edges().sort(sortByProps(['v']))).eqls([
      {v: 'sg1', w: 'sg4'},
      {v: 'sg2', w: 'sg3'}
    ])
  })
})

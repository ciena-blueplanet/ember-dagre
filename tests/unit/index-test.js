import {expect} from 'chai'
import dagre from 'ciena-dagre'
import graphlib from 'ciena-graphlib'
import {describe, it} from 'mocha'

describe('index', function () {
  it('should export dagre', function () {
    expect(dagre).to.be.an('object')
    expect(dagre.graphlib).to.be.an('object')
    expect(dagre.layout).to.be.a('function')
    expect(dagre.util).to.be.an('object')
  })

  it('should do trivial layout', function () {
    let g = new graphlib.Graph().setGraph({})
    g.setNode('a', {label: 'a', width: 50, height: 100})
    g.setNode('b', {label: 'b', width: 50, height: 100})
    g.setEdge('a', 'b', {label: 'ab', width: 50, height: 100})

    dagre.layout(g)
    expect(g.node('a')).to.have.property('x')
    expect(g.node('a')).to.have.property('y')
    expect(g.node('a').x).to.be.gte(0)
    expect(g.node('a').y).to.be.gte(0)
    expect(g.edge('a', 'b')).to.have.property('x')
    expect(g.edge('a', 'b')).to.have.property('y')
    expect(g.edge('a', 'b').x).to.be.gte(0)
    expect(g.edge('a', 'b').y).to.be.gte(0)
  })
})

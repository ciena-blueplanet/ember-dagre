import {expect} from 'chai'
import {describe, it} from 'mocha'
import {debug, layout, util, version} from 'dagre'

describe('dagre', () => {
  it('exports debug', () => {
    expect(debug).to.be.defined
  })

  it('exports layout', () => {
    expect(layout).to.be.defined
  })

  it('exports util', () => {
    expect(util).to.be.defined
  })

  it('exports version', () => {
    expect(version).to.be.defined
  })
})

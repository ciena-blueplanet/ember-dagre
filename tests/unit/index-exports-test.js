import {expect} from 'chai'
import {it} from 'mocha'
import dagre from 'dagre'

it('dagre is a single module that has been exported', function () {
  expect(typeof dagre).to.equal('object')
})

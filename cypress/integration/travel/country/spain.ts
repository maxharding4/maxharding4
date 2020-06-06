import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'spain'], () => {
  describe('Spain landing page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/travel/spain')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Spanish cities', function () {
      cy.get('@page-header').should('contain', 'Spain')
      cy.get('@city-card').should('have.length', 2)
      cy.get('[city-card=alicante]').should('be.visible')
      cy.get('[city-card=javea]').should('be.visible')
    })

    it('Navigate to Alicante pictures', function () {
      cy.get('[city-card=alicante]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Alicante, Spain')
    })

    it('Navigate to Javea pictures', function () {
      cy.get('[city-card=javea]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Javea, Spain')
    })
  })
})
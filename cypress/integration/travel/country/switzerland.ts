import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'switzerland'], () => {
  describe('Switzerland landing page', () => {
    beforeEach(() => {
      cy.visit('/travel/switzerland')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Swiss cities', function () {
      cy.get('@page-header').should('contain', 'Switzerland')
      cy.get('@city-card').should('have.length', 1)
      cy.get('[city-card=basel]').should('be.visible')
    })

    it('Navigate to Basel pictures', function () {
      cy.get('[city-card=basel]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Basel, Switzerland')
    })
  })
})
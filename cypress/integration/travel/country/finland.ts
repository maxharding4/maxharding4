import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'finland'], () => {
  describe('Finland landing page', () => {
    beforeEach(() => {
      cy.visit('/travel/finland')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Finnish cities', function () {
      cy.get('@page-header').should('contain', 'Finland')
      cy.get('@city-card').should('have.length', 1)
      cy.get('[city-card=helsinki]').should('be.visible')
    })

    it('Navigate to Helsinki pictures', function () {
      cy.get('[city-card=helsinki]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Helsinki, Finland')
    })
  })
})
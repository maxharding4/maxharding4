import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'estonia'], () => {
  describe('Estonia landing page', () => {
    beforeEach(() => {
      cy.visit('/travel/estonia')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Estonian cities', function () {
      cy.get('@page-header').should('contain', 'Estonia')
      cy.get('@city-card').should('have.length', 1)
      cy.get('[city-card=tallinn]').should('be.visible')
    })

    it('Navigate to Tallinn pictures', function () {
      cy.get('[city-card=tallinn]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Tallinn, Estonia')
    })
  })
})
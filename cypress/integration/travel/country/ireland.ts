import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'ireland'], () => {
  describe('Ireland landing page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/travel/ireland')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Irish cities', function () {
      cy.get('@page-header').should('contain', 'Ireland')
      cy.get('@city-card').should('have.length', 2)
      cy.get('[city-card=dublin]').should('be.visible')
      cy.get('[city-card=galway]').should('be.visible')
    })

    it('Navigate to Dublin pictures', function () {
      cy.get('[city-card=dublin]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Dublin, Ireland')
    })

    it('Navigate to Galway pictures', function () {
      cy.get('[city-card=galway]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Galway, Ireland')
    })
  })
})
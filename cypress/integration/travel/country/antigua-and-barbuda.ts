import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'austria'], () => {
  describe('Antigua & Barbuda landing page', () => {
    beforeEach(() => {
      cy.visit('/travel/antigua-and-barbuda')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Antigua & Barbuda locations', function () {
      cy.get('@page-header').should('contain', 'Antigua & Barbuda')
      cy.get('@city-card').should('have.length', 4)
      cy.get('[city-card=antigua-accommodation]').should('be.visible')
      cy.get('[city-card=antigua-beaches]').should('be.visible')
      cy.get('[city-card=antigua-historic]').should('be.visible')
      cy.get('[city-card=barbuda]').should('be.visible')
    })

    it('Navigate to Antigua Accom. pictures', function () {
      cy.get('[city-card=antigua-accommodation]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Antigua accomodation')
    })

    it('Navigate to Antigua Beaches pictures', function () {
      cy.get('[city-card=antigua-beaches]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Antigua beaches')
    })

    it('Navigate to Antigua Historic pictures', function () {
      cy.get('[city-card=antigua-historic]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Antigua historic sites')
    })

    it('Navigate to Barbuda pictures', function () {
      cy.get('[city-card=barbuda]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Barbuda')
    })
  })
})
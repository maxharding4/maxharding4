import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'france'], () => {
  describe('France landing page', () => {
    beforeEach(() => {
      cy.visit('/travel/france')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check French cities', function () {
      cy.get('@page-header').should('contain', 'France')
      cy.get('@city-card').should('have.length', 3)
      cy.get('[city-card=bethune]').should('be.visible')
      cy.get('[city-card=dijon]').should('be.visible')
      cy.get('[city-card=marseille]').should('be.visible')
    })

    it('Navigate to Bethune pictures', function () {
      cy.get('[city-card=bethune]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Bethune, France')
    })

    it('Navigate to Dijon pictures', function () {
      cy.get('[city-card=dijon]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Dijon, France')
    })

    it('Navigate to Marseille pictures', function () {
      cy.get('[city-card=marseille]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Marseille, France')
    })
  })
})
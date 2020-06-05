import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'brazil'], () => {
  describe('Brazil landing page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/travel/brazil')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Brazilian cities', function () {
      cy.get('@page-header').should('contain', 'Brazil')
      cy.get('@city-card').should('have.length', 3)
      cy.get('[city-card=iguazu-falls]').should('be.visible')
      cy.get('[city-card=pantanal]').should('be.visible')
      cy.get('[city-card=rio-de-janeiro]').should('be.visible')
    })

    it('Navigate to Iguazu Falls pictures', function () {
      cy.get('[city-card=iguazu-falls]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Iguazu Falls, Brazil')
    })

    it('Navigate to Pantanal pictures', function () {
      cy.get('[city-card=pantanal]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Pantanal, Brazil')
    })

    it('Navigate to Rio de Janeiro pictures', function () {
      cy.get('[city-card=rio-de-janeiro]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Rio de Janeiro, Brazil')
    })
  })
})
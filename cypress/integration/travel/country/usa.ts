import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'usa'], () => {
  describe('United States landing page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/travel/usa')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check American cities', function () {
      cy.get('@page-header').should('contain', 'United States')
      cy.get('@city-card').should('have.length', 5)
      cy.get('[city-card=cape-cod]').should('be.visible')
      cy.get('[city-card=miami]').should('be.visible')
      cy.get('[city-card=new-york]').should('be.visible')
      cy.get('[city-card=providence]').should('be.visible')
      cy.get('[city-card=washington-dc]').should('be.visible')
    })

    it('Navigate to Cape Cod pictures', function () {
      cy.get('[city-card=cape-cod]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Cape Cod, United States')
    })

    it('Navigate to Miami pictures', function () {
      cy.get('[city-card=miami]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Miami, United States')
    })

    it('Navigate to New York pictures', function () {
      cy.get('[city-card=new-york]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'New York, United States')
    })

    it('Navigate to Providence pictures', function () {
      cy.get('[city-card=providence]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Providence, United States')
    })

    it('Navigate to Washington D.C pictures', function () {
      cy.get('[city-card=washington-dc]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Washington D.C, United States')
    })
  })
})
import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'italy'], () => {
  describe('Italy landing page', () => {
    beforeEach(() => {
      cy.visit('/travel/italy')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Italian cities', function () {
      cy.get('@page-header').should('contain', 'Italy')
      cy.get('@city-card').should('have.length', 7)
      cy.get('[city-card=como]').should('be.visible')
      cy.get('[city-card=florence]').should('be.visible')
      cy.get('[city-card=monza]').should('be.visible')
      cy.get('[city-card=pisa]').should('be.visible')
      cy.get('[city-card=rome]').should('be.visible')
      cy.get('[city-card=trieste]').should('be.visible')
      cy.get('[city-card=turin]').should('be.visible')
    })

    it('Navigate to Lake Como pictures', function () {
      cy.get('[city-card=como]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Lake Como, Italy')
    })

    it('Navigate to Florence pictures', function () {
      cy.get('[city-card=florence]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Florence, Italy')
    })

    it('Navigate to Monza pictures', function () {
      cy.get('[city-card=monza]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Monza, Italy')
    })

    it('Navigate to Pisa pictures', function () {
      cy.get('[city-card=pisa]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Pisa, Italy')
    })

    it('Navigate to Rome pictures', function () {
      cy.get('[city-card=rome]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Rome, Italy')
    })

    it('Navigate to Trieste pictures', function () {
      cy.get('[city-card=trieste]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Trieste, Italy')
    })

    it('Navigate to Turin pictures', function () {
      cy.get('[city-card=turin]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Turin, Italy')
    })
  })
})
import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'cuba'], () => {
  describe('Cuba landing page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/travel/cuba')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Cuban cities', function () {
      cy.get('@page-header').should('contain', 'Cuba')
      cy.get('@city-card').should('have.length', 2)
      cy.get('[city-card=havana]').should('be.visible')
      cy.get('[city-card=veradero]').should('be.visible')
    })

    it('Navigate to Havana pictures', function () {
      cy.get('[city-card=havana]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Havana, Cuba')
    })

    it('Navigate to Veradero pictures', function () {
      cy.get('[city-card=havana]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Veradero, Cuba')
    })
  })
})
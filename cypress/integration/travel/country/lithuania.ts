import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'lithuania'], () => {
  describe('Lithuania landing page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/travel/lithuania')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Lithuanian cities', function () {
      cy.get('@page-header').should('contain', 'Lithuania')
      cy.get('@city-card').should('have.length', 1)
      cy.get('[city-card=vilnius]').should('be.visible')
    })

    it('Navigate to Vilnius pictures', function () {
      cy.get('[city-card=vilnius]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Vilnius, Lithuania')
    })

  })
})
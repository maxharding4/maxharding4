import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'scotland'], () => {
  describe('Scotland landing page', () => {
    beforeEach(() => {
      cy.visit('/travel/scotland')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Scottish cities', function () {
      cy.get('@page-header').should('contain', 'Scotland')
      cy.get('@city-card').should('have.length', 1)
      cy.get('[city-card=edinburgh]').should('be.visible')
    })

    it('Navigate to Edinburgh pictures', function () {
      cy.get('[city-card=edinburgh]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Edinburgh, Scotland')
    })

  })
})
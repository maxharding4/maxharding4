import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'maldives'], () => {
  describe('Maldives landing page', () => {
    beforeEach(() => {
      cy.visit('/travel/maldives')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Maldivian islands', function () {
      cy.get('@page-header').should('contain', 'Maldives')
      cy.get('@city-card').should('have.length', 1)
      cy.get('[city-card=helengeli]').should('be.visible')
    })

    it('Navigate to Helengeli pictures', function () {
      cy.get('[city-card=helengeli]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Helengeli, Maldives')
    })

  })
})
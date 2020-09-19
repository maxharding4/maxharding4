import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'slovenia'], () => {
  describe('Slovenia landing page', () => {
    beforeEach(() => {
      cy.visit('/travel/slovenia')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Slovenian cities', function () {
      cy.get('@page-header').should('contain', 'Slovenia')
      cy.get('@city-card').should('have.length', 1)
      cy.get('[city-card=ljubljana]').should('be.visible')
    })

    it('Navigate to Ljubljana pictures', function () {
      cy.get('[city-card=ljubljana]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Ljubljana, Slovenia')
    })

  })
})
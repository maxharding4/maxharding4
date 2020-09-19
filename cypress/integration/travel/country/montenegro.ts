import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'montenegro'], () => {
  describe('Montenegro landing page', () => {
    beforeEach(() => {
      cy.visit('/travel/montenegro')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Montenegro cities', function () {
      cy.get('@page-header').should('contain', 'Montenegro')
      cy.get('@city-card').should('have.length', 1)
      cy.get('[city-card=budva]').should('be.visible')
    })

    it('Navigate to Budva pictures', function () {
      cy.get('[city-card=budva]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Budva, Montenegro')
    })

  })
})
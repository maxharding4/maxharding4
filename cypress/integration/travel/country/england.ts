import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'england'], () => {
  describe('England landing page', () => {
    beforeEach(() => {
      cy.visit('/travel/england')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check English cities', function () {
      cy.get('@page-header').should('contain', 'England')
      cy.get('@city-card').should('have.length', 5)
      cy.get('[city-card=buxton]').should('be.visible')
      cy.get('[city-card=ilkley]').should('be.visible')
      cy.get('[city-card=lympne]').should('be.visible')
      cy.get('[city-card=margate]').should('be.visible')
      cy.get('[city-card=york]').should('be.visible')
    })

    it('Navigate to Buxton pictures', function () {
      cy.get('[city-card=buxton]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Buxton, England')
    })

    it('Navigate to Ilkley pictures', function () {
      cy.get('[city-card=ilkley]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Ilkley, England')
    })

    it('Navigate to Lympne pictures', function () {
      cy.get('[city-card=lympne]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Lympne, England')
    })

    it('Navigate to Margate pictures', function () {
      cy.get('[city-card=margate]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Margate, England')
    })

    it('Navigate to York pictures', function () {
      cy.get('[city-card=york]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'York, England')
    })
  })
})
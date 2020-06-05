import TestFilter from '../../../support/testFilter';

TestFilter(['regression', 'travel', 'canada'], () => {
  describe('Canada landing page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/travel/canada')
      cy.get('[data-test=page-header]').as('page-header')
      cy.get('[data-test=city-card').as('city-card')
      cy.get('[data-test=search-box--input').as('search-box-input')
    })

    it('Check Canadian cities', function () {
      cy.get('@page-header').should('contain', 'Canada')
      cy.get('@city-card').should('have.length', 12)
      cy.get('[city-card=banff]').should('be.visible')
      cy.get('[city-card=bowen]').should('be.visible')
      cy.get('[city-card=drumheller]').should('be.visible')
      cy.get('[city-card=duffey]').should('be.visible')
      cy.get('[city-card=icefields]').should('be.visible')
      cy.get('[city-card=jasper]').should('be.visible')
      cy.get('[city-card=joffre]').should('be.visible')
      cy.get('[city-card=louise]').should('be.visible')
      cy.get('[city-card=moraine]').should('be.visible')
      cy.get('[city-card=ottawa]').should('be.visible')
      cy.get('[city-card=squamish]').should('be.visible')
      cy.get('[city-card=yellowhead]').should('be.visible')
    })

    it('Navigate to Banff pictures', function () {
      cy.get('[city-card=banff]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Banff, Canada')
    })

    it('Navigate to Bowen Island pictures', function () {
      cy.get('[city-card=bowen]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Bowen Island, Canada')
    })

    it('Navigate to Drumheller pictures', function () {
      cy.get('[city-card=drumheller]').should('be.visible').click()
      cy.get('@page-header').should('contain', 'Drumheller, Canada')
    })
  })
})
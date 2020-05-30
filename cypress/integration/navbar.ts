import TestFilter from '../support/testFilter';

TestFilter(['regression', 'navbar'], () => {
  describe('Navbar', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000')
      cy.get('#navbar').as('navbar')
      cy.get('#navbar > a').as('navbar-link')
      cy.get('#navbar > a > button').as('navbar-button')
      cy.get('[data-test=page-header]').as('page-header')
    })

    it('check that the navbar contains the correct links', () => {
      cy.get('@navbar-link').should('have.length', 2)
      cy.get('@navbar-link').eq(0).should('contain', 'home').should('have.attr', 'href').and('include', '/')
      cy.get('@navbar-link').eq(1).should('contain', 'travel').should('have.attr', 'href').and('include', '/travel')
    })

    it('check the navbar navigation is working', () => {
      cy.get('@navbar-button').eq(1).click()
      cy.get('@page-header').contains('Travel Album')
      cy.get('@navbar-button').eq(0).click()
      cy.get('@page-header').contains('Home')
    })
  })
})
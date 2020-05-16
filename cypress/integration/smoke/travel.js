import chaiColors from 'chai-colors'
chai.use(chaiColors)

describe('Travel album landing page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/travel')
    cy.get('#navbar').as('navbar')
    cy.get('[data-test=page-header]').as('page-header')
    cy.get('[data-test=search-box').as('search-box')
    cy.get('[data-test=search-box--input').as('search-box-input')
    cy.get('[data-test=country-list]').as('country-list')
    cy.get('[data-test=country-card').as('country-card')
    cy.get('[data-test=footer]').as('footer')
    cy.get('@navbar').should('be.visible')
  })

  it('check if app is rendering the travel album landing page', () => {
    cy.get('@navbar').should('be.visible')
    cy.get('@page-header').contains('Travel Album')
    cy.get('@search-box').should('be.visible')
    cy.get('@country-list')
    cy.get('@footer').contains('© maxharding4')  
  })

  it('check the number of country cards displayed', () => {
    cy.get('@country-card').should('have.length', 20)
  })

  it('check the search-box functionality works', () => {
    cy.get('@search-box-input').type('italy')
    cy.get('@country-card').should('have.length', 1)
    cy.get('[country-card=italy]').should('be.visible')
    cy.get('@search-box-input').clear()
    cy.get('@search-box-input').type('en')
    cy.get('@country-card').should('have.length', 3)
    cy.get('[country-card=england]').should('be.visible')
    cy.get('[country-card=montenegro]').should('be.visible')
    cy.get('[country-card=slovenia]').should('be.visible')
    cy.get('@search-box-input').clear().type('noland')
    cy.get('@country-card').should('have.length', 0)
  })
})
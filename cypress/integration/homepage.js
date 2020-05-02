describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.get('#navbar').as('navbar')
    cy.get('[data-test=page-header]').as('page-header')
    cy.get('[data-test=footer]').as('footer')
  })

  it('check if app is rendering the homepage', () => {
    cy.visit('http://localhost:3000')
    cy.get('@navbar').should('be.visible')
    cy.get('@page-header').contains('Home')
    cy.get('@footer').contains('© maxharding4')
  })
})
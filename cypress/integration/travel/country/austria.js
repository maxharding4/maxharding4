import chaiColors from 'chai-colors'
chai.use(chaiColors)

describe('Austria landing page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/travel/austria')
    cy.get('[data-test=page-header]').as('page-header')
    cy.get('[data-test=city-card').as('city-card')
    cy.get('[data-test=search-box--input').as('search-box-input')
  })

  it('Check Austrian cities', () => {
    cy.get('@page-header').should('contain', 'Austria')
    cy.get('@city-card').should('have.length', 1)
    cy.get('[city-card=vienna]').should('be.visible')
  })

  it('Navigate to Vienna pictures', () => { 
    cy.get('[city-card=vienna]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Vienna, Austria')
  })
})
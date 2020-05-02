import chaiColors from 'chai-colors'
chai.use(chaiColors)

describe('Searching and navigating to countries', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/travel')
    cy.get('#navbar').as('navbar')
    cy.get('[data-test=page-header]').as('page-header')
    cy.get('[data-test=country-card').as('country-card')
    cy.get('[data-test=search-box--input').as('search-box-input')
  })
  
  it('Searching for and navigating to Austria', () => {
    cy.get('@search-box-input').type('austria')
    cy.get('[country-card=austria]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Austria')
  })

  it('Searching for and navigating to Brazil', () => {
    cy.get('@search-box-input').type('brazil')
    cy.get('[country-card=brazil]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Brazil')
  })

  it('Searching for and navigating to Canada', () => {
    cy.get('@search-box-input').type('canada')
    cy.get('[country-card=canada]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Canada')
  })

  it('Searching for and navigating to Colombia', () => {
    cy.get('@search-box-input').type('colombia')
    cy.get('[country-card=colombia]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Colombia')
  })

  it('Searching for and navigating to Cuba', () => {
    cy.get('@search-box-input').type('cuba')
    cy.get('[country-card=cuba]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Cuba')
  })

  it('Searching for and navigating to England', () => {
    cy.get('@search-box-input').type('england')
    cy.get('[country-card=england]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'England')
  })

  it('Searching for and navigating to Estonia', () => {
    cy.get('@search-box-input').type('estonia')
    cy.get('[country-card=estonia]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Estonia')
  })

  it('Searching for and navigating to Finland', () => {
    cy.get('@search-box-input').type('finland')
    cy.get('[country-card=finland]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Finland')
  })

  it('Searching for and navigating to France', () => {
    cy.get('@search-box-input').type('france')
    cy.get('[country-card=france]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'France')
  })

  it('Searching for and navigating to Ireland', () => {
    cy.get('@search-box-input').type('ireland')
    cy.get('[country-card=ireland]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Ireland')
  })

  it('Searching for and navigating to Italy', () => {
    cy.get('@search-box-input').type('italy')
    cy.get('[country-card=italy]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Italy')
  })

  it('Searching for and navigating to Lithuania', () => {
    cy.get('@search-box-input').type('lithuania')
    cy.get('[country-card=lithuania]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Lithuania')
  })

  it('Searching for and navigating to Maldives', () => {
    cy.get('@search-box-input').type('maldives')
    cy.get('[country-card=maldives]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Maldives')
  })

  it('Searching for and navigating to Montenegro', () => {
    cy.get('@search-box-input').type('montenegro')
    cy.get('[country-card=montenegro]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Montenegro')
  })

  it('Searching for and navigating to Scotland', () => {
    cy.get('@search-box-input').type('scotland')
    cy.get('[country-card=scotland]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Scotland')
  })

  it('Searching for and navigating to Slovenia', () => {
    cy.get('@search-box-input').type('slovenia')
    cy.get('[country-card=slovenia]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Slovenia')
  })

  it('Searching for and navigating to Spain', () => {
    cy.get('@search-box-input').type('spain')
    cy.get('[country-card=spain]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Spain')
  })

  it('Searching for and navigating to Switzerland', () => {
    cy.get('@search-box-input').type('switzerland')
    cy.get('[country-card=switzerland]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'Switzerland')
  })

  it('Searching for and navigating to United States', () => {
    cy.get('@search-box-input').type('united states')
    cy.get('[country-card=usa]').should('be.visible').click()
    cy.get('@page-header').should('contain', 'United States')
  })
  
})
describe('Artist Browsing Flow', () => {
  beforeEach(() => {
    cy.setupBackend();
    cy.visit('/artists');
    cy.wait('@api_GetArtists');
  });

  it('should retrieve artists from backend and display complete artist information', () => {
    cy.screenshot('artists/artists-page-loaded');

    cy.get('@api_GetArtists').then((interception) => {
      const apiArtists = interception?.response?.body;
      if (apiArtists) {
        expect(apiArtists).to.be.an('array').and.have.length.greaterThan(0);
      }

      cy.get('.artist-card').should('have.length.greaterThan', 0);
      cy.get('.artist-card').first().within(() => {
        cy.get('#artist-name').should('be.visible');
        cy.get('img').should('be.visible');
      });

      // Capture first artist visually for report
      cy.get('.artist-card').first().screenshot('artists/first-artist-card');
    });
  });

  it('should display error when artist API fails', () => {
    cy.intercept('GET', '**/api/artists', {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }).as('api_GetArtistsFail');

    cy.reload();
    cy.wait('@api_GetArtistsFail');

    cy.contains(/error|failed/i).should('be.visible');
    cy.get('.artist-card').should('not.exist');
    cy.screenshot('artists/artists-api-error-state');
  });
});

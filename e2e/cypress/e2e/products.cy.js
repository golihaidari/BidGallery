describe('Product Browsing and Bid Flow', () => {
  beforeEach(() => {
    cy.setupBackend();
    cy.visit('/');
    cy.wait('@api_GetProducts');
  });

  it('should display products correctly and navigate to bid page', () => {
    cy.screenshot('products/products-page-loaded');

    cy.get('@api_GetProducts').then((interception) => {
      const apiProducts = interception?.response?.body;
      expect(apiProducts).to.be.an('array').and.have.length.greaterThan(0);

      const firstProduct = apiProducts[0];

      cy.get('.product-card').should('have.length.greaterThan', 0);
      cy.get('.product-card').first().within(() => {
        cy.get('#title').should('contain', firstProduct.title);
        cy.get('img').should('be.visible');
      });

      cy.get('.product-card').first().screenshot('products/first-product-card');

      cy.contains('button', 'PLACE BID').click();
      cy.url().should('include', '/giveBid');
      cy.screenshot('products/bid-page-loaded');

      cy.contains(firstProduct.title).should('be.visible');
      cy.contains(firstProduct.artistFirstName).should('be.visible');
    });
  });

  it('should show error message when product API fails', () => {
    cy.intercept('GET', '**/api/products/available', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('api_GetProductsFail');

    cy.reload();
    cy.wait('@api_GetProductsFail');

    cy.contains(/error|failed/i).should('be.visible');
    cy.screenshot('products/products-api-error-state');
  });
});

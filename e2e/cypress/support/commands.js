//------------------ API COMMANDS (REAL CALLS) ---------------
Cypress.Commands.add('setupBackend', () => {
  cy.log('Waiting for backend to be ready...');
  
  cy.request({
    method: 'GET',
    url: 'http://localhost:8080/actuator/health',
    timeout: 30000,
    retryOnStatusCodeFailure: true,
    retryOnNetworkFailure: true
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.status).to.eq('UP');
    cy.log('Backend is healthy');
  });

  cy.intercept('POST', 'https://eobr8yycab7ojzy.m.pipedream.net', {
    statusCode: 200, body: 'Payment processed'
  }).as('externalPayment');
  
  // Real backend endpoints
  cy.intercept('GET', '**/api/products/available').as('api_GetProducts');
  cy.intercept('POST', '**/api/checkout/placebid').as('api_PlaceBid');
  cy.intercept('GET', '**/api/auth/address').as('api_GetUserAddress');
  cy.intercept('POST', '**/api/checkout/placeorder').as('api_PlaceOrder');
  cy.intercept('POST', '**/api/auth/register').as('api_RegisterUser');
  cy.intercept('POST', '**/api/auth/login').as('api_LoginUser');
  cy.intercept('GET', '**/api/auth/logout').as('api_LogoutUser'); 
  cy.intercept('GET', '**/api/artists').as('api_GetArtists'); 

  // FAILURE intercept (different alias)
  cy.intercept('POST', '**/api/checkout/placeorder', {
     statusCode: 400,
     body: { success: false, error: 'Payment validation failed' }
  }).as('api_PlaceOrderFail');
});

//------------------ WAIT COMMANDS -----------------
Cypress.Commands.add('waitForBackend', () => {
  cy.log('Waiting for backend to be ready...');
  
  cy.request({
    method: 'GET',
    url: 'http://localhost:8080/actuator/health',
    timeout: 30000,
    retryOnStatusCodeFailure: true,
    retryOnNetworkFailure: true
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.status).to.eq('UP');
    cy.log('Backend is healthy');
  });
});

//------------------ AUTH COMMANDS -----------------
Cypress.Commands.add('registerUser', (userData) => {
  cy.get('input[name="firstName"]', { timeout: 5000 }).type(userData.firstName);
  cy.get('input[name="lastName"]').type(userData.lastName);
  cy.get('input[name="email"]').type(userData.email);
  cy.get('input[name="password"]').type(userData.password);
  cy.get('input[name="rePassword"]').type(userData.password);
  cy.get('[name="mobileNr"]').type(userData.mobileNr);
  cy.get('[name="postalCode"]').type(userData.postalCode);
  cy.get('[name="city"]').type(userData.city);
  cy.get('[name="address1"]').type(userData.address);

  cy.contains('button', 'Sign Up').click();
});

Cypress.Commands.add('loginUser', (email, password) => {  
  cy.get('input[type="email"]', { timeout: 5000 }).type(email);
  cy.get('input[type="password"]').type(password);

  cy.contains('button', 'Login').click();
});

Cypress.Commands.add('logoutUser', () => {
  cy.contains('button', 'Logout').click();
});

//----------------------- CHECKOUT COMMANDS -------------------
Cypress.Commands.add('placeBid', (bidAmount) => {
  cy.get('.product-card').first().within(() => {
    cy.contains('PLACE BID').click();
  });
  //cy.url().should('include', '/giveBid');
  cy.get('input[type="number"]').type(bidAmount);

  cy.get('form').submit();
});

Cypress.Commands.add('retryBid', (bidAmount) => {
  cy.get('input[type="number"]', { timeout: 5000 })
    .should('be.visible')
    .clear()
    .type(bidAmount);
  cy.get('form').submit();
});

// when want to add more item to the cart
Cypress.Commands.add('placeBidProduct2', (bidAmount) => {
  cy.get('.product-card').eq(1).within(() => {
    cy.contains('PLACE BID').click();
  });
  //cy.url().should('include', '/giveBid');
  cy.get('input[type="number"]').type(bidAmount);

  cy.get('form').submit();
});


Cypress.Commands.add('fillShippingAddress', (addressData) => {
  cy.url().should('include', '/delivery');
  cy.get('input[name="firstName"]', { timeout: 5000 }).type(addressData.firstName);
  cy.get('input[name="lastName"]').type(addressData.lastName);
  cy.get('input[name="email"]').type(addressData.email);
  cy.get('input[name="mobileNr"]').type(addressData.mobileNr);
  cy.get('input[name="postalCode"]').type(addressData.postalCode);
  cy.get('input[name="city"]').type(addressData.city);
  cy.get('input[name="address1"]').type(addressData.address1);
  cy.get('input[name="address2"]').type(addressData.address2 || '');

  cy.contains('Next').click();
});

Cypress.Commands.add('payWithCreditCard', (cardData) => {
  cy.url().should('include', '/payment');
  cy.get('input[value="CreditCard"]').click();
  cy.get('input[name="cardHolder"]').type(cardData.cardHolder);
  cy.get('input[name="cardNumber"]').type(cardData.cardNumber);
  cy.get('select[name="expiryMonth"]').select(cardData.expiryMonth);
  cy.get('select[name="expiryYear"]').select(cardData.expiryYear);
  cy.get('input[name="cvcNumber"]').type(cardData.cvcNumber);

  cy.contains('Confirm Payment').click();
});

Cypress.Commands.add('payWithMobilePay', (mobileNr) => {
  cy.url().should('include', '/payment');
  cy.get('input[value="MobilePay"]').click();
  cy.get('.react-tel-input input').type(mobileNr);

  cy.contains('Confirm Payment').click();
});

Cypress.Commands.add('payWithGiftCard', (cardData) => {
  cy.url().should('include', '/payment');
  cy.get('input[value="GiftCard"]').click();
  cy.get('input[name="giftCardnumber"]').type(cardData.giftCardnumber);
  cy.get('input[name="securityCode"]').type(cardData.securityCode);
  cy.contains('Confirm Payment').click();
});

Cypress.Commands.add('completeOrder', () => {
  cy.url().should('include', '/submit');
  cy.contains('Confirm Order').click();
});
describe('Complete Checkout Flow', () => {
  beforeEach(() => {
    cy.setupBackend();
    cy.visit('/');
    cy.wait('@api_GetProducts');
  });

  const addressData = {
    firstName: 'goli',
    lastName: 'haidari',
    email: 'goli@test.com',
    mobileNr: '12345678',
    postalCode: '1000',
    city: 'Copenhagen',
    address1: 'Test Street 123',
    address2: '3th floor, door 3'
  };

  const mobileNr = '12345678';

  const giftCardData = {
    giftCardnumber: '1234567890123456',
    securityCode: '123'
  };

  it('complete checkout with gift card', () => {
    cy.placeBid('1000');
    cy.wait('@api_PlaceBid', {timeout: 10000}).then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.message).to.match(/Bid for product Id: .* is accepted\./);
    });
    cy.screenshot('checkout/bid-accepted'); // screenshot after bid accepted

    cy.contains('Continue to Checkout').click();
    cy.contains('Proceed to Checkout').click();
    cy.fillShippingAddress(addressData); 
    cy.payWithGiftCard(giftCardData);
    cy.wait('@externalPayment');
    cy.screenshot('checkout/payment-confirmation'); // screenshot after payment
    cy.completeOrder();
    cy.screenshot('checkout/order-success'); // screenshot on success
  });

  it('complete checkout with mobile pay', () => {
    cy.placeBid('1000');
    cy.wait('@api_PlaceBid', {timeout: 10000}).then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.message).to.match(/Bid for product Id: .* is accepted\./);
    });
    cy.screenshot('checkout/bid-accepted-mobilepay'); 

    cy.contains('Continue to Checkout').click();
    cy.contains('Proceed to Checkout').click();
    cy.fillShippingAddress(addressData);
    cy.payWithMobilePay(mobileNr);
    cy.wait('@externalPayment');
    cy.screenshot('checkout/payment-confirmation-mobilepay');
    cy.completeOrder();
    cy.screenshot('checkout/order-success-mobilepay');
  });

  it('bid rejection and retry', () => {
    cy.placeBid('100');
    cy.wait('@api_PlaceBid').then((interception) => {
      expect(interception.response.statusCode).to.equal(400);
      expect(interception.response.body.message).to.equal('Bid too low. Retry agaian.');
    });
    cy.screenshot('checkout/bid-rejected'); // screenshot on bid rejection

    cy.contains('Error!').should('be.visible');
    cy.contains('Bid too low').should('be.visible');
    cy.contains('button', 'Retry').click();

    cy.retryBid('1000');
    cy.wait('@api_PlaceBid').its('response.statusCode').should('eq', 200);
    cy.screenshot('checkout/bid-retry-success'); // screenshot after retry bid

    cy.contains('Success!').should('be.visible');
    cy.contains('Continue to Checkout').click();
    cy.contains('Your Cart').should('be.visible');
    cy.contains('Proceed to Checkout').click();
    cy.fillShippingAddress(addressData);
    cy.payWithMobilePay(mobileNr);
    cy.wait('@externalPayment');
    cy.completeOrder();
    cy.screenshot('checkout/order-success-after-bid-retry'); // final success screenshot
  });

  it('order submission failure and retry', () => {
    cy.placeBid('1000');
    cy.wait('@api_PlaceBid').its('response.statusCode').should('eq', 200);
    cy.contains('Success!').should('be.visible');
    cy.screenshot('checkout/bid-accepted-before-order'); 

    cy.contains('Continue to Checkout').click();
    cy.contains('Your Cart').should('be.visible');
    cy.contains('Proceed to Checkout').click();
    cy.fillShippingAddress(addressData);
    cy.payWithMobilePay(mobileNr);
    cy.wait('@externalPayment').its('response.statusCode').should('eq', 200);
    cy.screenshot('checkout/payment-before-order'); 

    // First attempt: fail
    cy.contains('Confirm Order').click();    
    cy.wait('@api_PlaceOrderFail', {timeout: 5000}).its('response.statusCode').should('eq', 400);
    cy.screenshot('checkout/order-failure'); // screenshot of failure

    cy.contains('Error!').should('be.visible');
    cy.contains('Payment validation failed').should('be.visible');
    cy.contains('Retry').click();

    // Retry with real backend
    cy.intercept('POST', '**/api/checkout/placeorder', (req) => req.continue()).as('api_PlaceOrder');
    cy.contains('Order Receipt').should('be.visible');
    cy.contains('Confirm Order').click();
    cy.wait('@api_PlaceOrder', {timeout: 10000}).then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.success).to.be.true;
      expect(interception.response.body.message).to.match(/OrderId .* placed successfully\./);
    });
    cy.screenshot('checkout/order-success-after-retry'); // screenshot on success after retry

    cy.contains('Success!').should('be.visible');
    cy.contains(/OrderId .* placed successfully\./).should('be.visible');
    cy.contains('Continue Shopping').click();
    cy.url().should('include', '/');
  });
});

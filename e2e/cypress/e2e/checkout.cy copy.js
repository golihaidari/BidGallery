// cypress/e2e/checkout-flow.cy.js

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

    cy.wait('@api_PlaceBid', {timeout: '10000'}).then((interception) => {
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
    cy.wait('@api_PlaceBid', {timeout: '10000'}).then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.message).to.match(/Bid for product Id: .* is accepted\./);
    });
    cy.contains('Continue to Checkout').click();
    cy.contains('Proceed to Checkout').click();
    cy.fillShippingAddress(addressData);
    cy.payWithMobilePay(mobileNr);
    cy.wait('@externalPayment');
    cy.completeOrder();
  });

  it('bid rejection and retry', () => {
    // First bid
    cy.placeBid('100');
    
    cy.wait('@api_PlaceBid').then((interception) => {
      expect(interception.response.statusCode).to.equal(400);
      expect(interception.response.body.message).to.equal('Bid too low. Retry agaian.');
    });
    cy.screenshot('checkout/bid-rejected'); // screenshot on bid rejection

    // Bid rejected - retry
    cy.contains('Error!').should('be.visible');
    cy.contains('Bid too low').should('be.visible');
    cy.contains('button', 'Retry').click();

     // Use the new retryBid command
    cy.retryBid('1000');

    cy.wait('@api_PlaceBid').its('response.statusCode').should('eq', 200);
    cy.screenshot('checkout/bid-retry-success'); // screenshot after retry bid

    // Bid accepted
    cy.contains('Success!').should('be.visible');
    cy.contains('Continue to Checkout').click();
        
    // Complete checkout
    cy.contains('Your Cart').should('be.visible');
    cy.contains('Proceed to Checkout').click();
    cy.fillShippingAddress(addressData);
    cy.payWithMobilePay(mobileNr);
    cy.wait('@externalPayment');
    cy.completeOrder();
    cy.screenshot('checkout/order-success-after-bid-retry'); // final success screenshot
  }); 

  it('add multiple products and remove from cart', () => {
    // Add first product
    cy.placeBid('1000');
    cy.wait('@api_PlaceBid').its('response.statusCode').should('eq', 200);

    cy.contains('Success!').should('be.visible');
    cy.contains('Add More Items').click();

    // Add second product - use placeBid command
    cy.placeBidProduct2('1200');
    cy.wait('@api_PlaceBid').its('response.statusCode').should('eq', 200);

    cy.contains('Success!').should('be.visible');
    cy.contains('Continue to Checkout').click();

    // Verify cart has 2 items and remove one
    cy.get('[data-id="cart-item"]').should('have.length', 2);
    
    cy.get('[data-id="cart-item"]').eq(1).within(() => {
      cy.contains('Remove').click();
    });

    cy.get('[data-id="cart-item"]').should('have.length', 1);
    cy.contains('Proceed to Checkout').click();

    cy.fillShippingAddress(addressData);
    cy.payWithMobilePay(mobileNr);
    cy.wait('@externalPayment').its('response.statusCode').should('eq', 200);
    cy.completeOrder();
  }); 
  
  it('empty cart scenario', () => {
    cy.visit('/cart');
    cy.contains('Your cart is empty').should('be.visible');
    cy.contains('Please select product first.').should('be.visible');
    cy.contains('Go Back to Products').click();
    cy.url().should('include', '/');
  })

  it('order submission failure and retry', () => {

    cy.placeBid('1000');
    cy.wait('@api_PlaceBid').its('response.statusCode').should('eq', 200);
    
    //show success Infocard
    cy.contains('Success!').should('be.visible');
    cy.contains('Continue to Checkout').click();

    //show cart items
    cy.contains('Your Cart').should('be.visible');
    cy.contains('Proceed to Checkout').click();

    cy.fillShippingAddress(addressData);
    cy.payWithMobilePay(mobileNr);
    cy.wait('@externalPayment').its('response.statusCode').should('eq', 200);

    // This should fail first time
    cy.contains('Confirm Order').click();

    //mock api endpoint to fail the request
    cy.intercept('POST', '**/api/checkout/placeorder', {
      statusCode: 400,
      body: { success: false, error: 'Payment validation failed' }
    }).as('api_PlaceOrderFail');

    cy.wait('@api_PlaceOrderFail', {timeout:'5000'}).its('response.statusCode').should('eq', 400);
    cy.screenshot('checkout/order-failure'); // screenshot of failure

    //InfoCard: show error message 
    cy.contains('Error!').should('be.visible');
    cy.contains('Payment validation failed').should('be.visible');
    cy.contains('Retry').click();

    // Remove the failure intercept and restore normal set up for real API call
    cy.intercept('POST', '**/api/checkout/placeorder', (req) => {
      req.continue(); // Let it go to real backend
    }).as('api_PlaceOrder');

    //show submit page again 
    cy.contains('Order Receipt').should('be.visible');
    cy.contains('Confirm Order').click();    

    cy.wait('@api_PlaceOrder', {timeout: '10000'}).then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.success).to.be.true;
      expect(interception.response.body.message).to.match(/OrderId .* placed successfully\./);
    });
    cy.screenshot('checkout/order-success-after-retry'); // screenshot on success after retry


    //InfoCard: success for the second time
    cy.contains('Success!').should('be.visible');
    cy.contains(/OrderId .* placed successfully\./).should('be.visible');
    cy.contains('Continue Shopping').click();

    cy.url().should('include', '/');
  })
});

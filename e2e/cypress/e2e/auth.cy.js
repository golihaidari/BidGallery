describe('Authentication Flows - E2E', () => {
  beforeEach(() => {
    cy.setupBackend();
    cy.visit('/login');
  });

  const userData = {
    firstName: 'Test',
    lastName: 'User',
    email: `testuser${Date.now()}@example.com`,
    password: 'password123',
    mobileNr: '1234567890',
    postalCode: '1000',
    city: 'Copenhagen',
    address: 'Test Street 123'
  };

  it('should register new user successfully', () => {
    cy.contains('Create account here').click();
    cy.screenshot('auth/register-page-loaded');

    cy.registerUser(userData);
    cy.wait('@api_RegisterUser');

    cy.url().should('include', '/login');
    cy.contains('Welcome Back').should('be.visible');
    cy.screenshot('auth/register-success');
  });

  it('should login successfully', () => {
    cy.loginUser(userData.email, userData.password);
    cy.wait('@api_LoginUser');
    cy.url().should('include', '/');
    cy.screenshot('auth/login-success');
  });

  it('should show error for invalid credentials', () => {
    cy.loginUser('wrong@example.com', 'wrongpassword');
    cy.wait('@api_LoginUser');
    cy.contains('Invalid credentials').should('be.visible');
    cy.screenshot('auth/login-failed');
  });

  it('should logout successfully', () => {
  
    cy.loginUser(userData.email, userData.password);
    cy.wait('@api_LoginUser');
    cy.contains('button', 'Logout', { timeout: 10000 }).should('be.visible');
    
    // The logoutUser command clicks the button AND triggers the API call
    cy.logoutUser();


    
    // Wait for the API call that was triggered by the click
    cy.wait('@api_LogoutUser', {timeout: 5000});
    
    cy.contains('button', 'Login', { timeout: 10000 }).should('be.visible');
  });
});

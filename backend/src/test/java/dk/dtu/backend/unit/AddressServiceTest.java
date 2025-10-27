package dk.dtu.backend.unit;

import dk.dtu.backend.TestDataFactory;
import dk.dtu.backend.persistence.entity.Address;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.entity.AccountType;
import dk.dtu.backend.persistence.repository.AddressRepository;
import dk.dtu.backend.service.AddressService;
import dk.dtu.backend.service.LoggingService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AddressServiceTest {

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private LoggingService loggingService;

    @InjectMocks
    private AddressService addressService;

    private User testUser;
    private Address testAddress;
    private String requestId;

    @BeforeEach
    public void setup() {
        // Create test data using TestDataFactory
        testUser = TestDataFactory.createUser("test@example.com", AccountType.CUSTOMER);
        testUser.setId(1);
        
        testAddress = TestDataFactory.createAddress();
        testAddress.setId(1);
        testAddress.setUser(testUser);
        testAddress.setEmail(testUser.getEmail());
        
        requestId = "test-request-123";
    }

    @Test
    public void getUserAddress_WithExistingAddress_ReturnsAddress() {
        // Arrange
        when(addressRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testAddress));

        // Act
        Optional<Address> result = addressService.getUserAddress(testUser.getId(), requestId);

        // Assert
        assertTrue(result.isPresent(), "Address should be present");
        assertEquals(testAddress, result.get(), "Returned address should match the mock");
        
        // Verify repository was called with correct parameter
        verify(addressRepository).findByUserId(testUser.getId());
    }

    @Test
    public void getUserAddress_NoAddress_ReturnsEmpty() {
        // Arrange
        when(addressRepository.findByUserId(testUser.getId())).thenReturn(Optional.empty());

        // Act
        Optional<Address> result = addressService.getUserAddress(testUser.getId(), requestId);

        // Assert
        assertFalse(result.isPresent(), "Address should not be present");
        
        // Verify repository was called with correct parameter
        verify(addressRepository).findByUserId(testUser.getId());
    }
}
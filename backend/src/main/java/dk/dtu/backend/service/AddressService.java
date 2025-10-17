package dk.dtu.backend.service;

import dk.dtu.backend.persistence.entity.Address;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.repository.AddressRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private LoggingService loggingService;

    // ------------------ CREATE -----------------------
    public Address saveAddress(Address address) {
        try {
            Address saved = addressRepository.save(address);
            loggingService.info("Address saved successfully", Map.of(
                "addressId", String.valueOf(saved.getId()),
                "city", saved.getCity(),
                "action", "create"
            ));
            return saved;
        } catch (Exception e) {
            loggingService.error("Error saving address", Map.of(
                "city", address.getCity(),
                "error", e.getMessage()
            ));
            throw e;
        }
    }

    // ------------------ READ -----------------------
    public Optional<Address> getAddressById(Integer id) {
        Optional<Address> addressOpt = addressRepository.findById(id);
        loggingService.info("Fetched address by ID", Map.of(
            "addressId", id.toString(),
            "found", String.valueOf(addressOpt.isPresent())
        ));
        return addressOpt;
    }

    public List<Address> getAddressesByUser(User user) {
        List<Address> addresses = addressRepository.findByUser(user);
        loggingService.info("Fetched addresses by user", Map.of(
            "userId", String.valueOf(user.getId()),
            "count", String.valueOf(addresses.size())
        ));
        return addresses;
    }

    public List<Address> getAllAddresses() {
        List<Address> addresses = addressRepository.findAll();
        loggingService.info("Fetched all addresses", Map.of(
            "count", String.valueOf(addresses.size())
        ));
        return addresses;
    }

    public Optional<Address> findByAddressFields(String address1, String city, String postalCode) {
        Optional<Address> addressOpt = addressRepository.findByAddress1AndCityAndPostalCode(address1, city, postalCode);
        loggingService.info("Checked address existence by fields", Map.of(
            "address1", address1,
            "city", city,
            "postalCode", postalCode,
            "found", String.valueOf(addressOpt.isPresent())
        ));
        return addressOpt;
    }

    public Optional<Address> findByUserAndAddress(User user, String address1, String city, String postalCode) {
        Optional<Address> addressOpt = addressRepository.findByUserAndAddress1AndCityAndPostalCode(user, address1, city, postalCode);
        loggingService.info("Fetched address by user and fields", Map.of(
            "userId", String.valueOf(user.getId()),
            "address1", address1,
            "city", city,
            "postalCode", postalCode,
            "found", String.valueOf(addressOpt.isPresent())
        ));
        return addressOpt;
    }

    // ------------------ UPDATE -----------------------
    public Optional<Address> updateAddress(Integer id, Address updatedAddress) {
        Optional<Address> addressOpt = addressRepository.findById(id);
        if (addressOpt.isEmpty()) {
            loggingService.warn("Attempted to update non-existing address", Map.of("addressId", id.toString()));
            return Optional.empty();
        }

        Address address = addressOpt.get();
        address.setFirstName(updatedAddress.getFirstName());
        address.setLastName(updatedAddress.getLastName());
        address.setEmail(updatedAddress.getEmail());
        address.setMobileNr(updatedAddress.getMobileNr());
        address.setCountry(updatedAddress.getCountry());
        address.setPostalCode(updatedAddress.getPostalCode());
        address.setCity(updatedAddress.getCity());
        address.setAddress1(updatedAddress.getAddress1());
        address.setAddress2(updatedAddress.getAddress2());

        Address saved = addressRepository.save(address);
        loggingService.info("Address updated successfully", Map.of(
            "addressId", String.valueOf(id),
            "city", saved.getCity(),
            "action", "update"
        ));
        return Optional.of(saved);
    }

    // ------------------ DELETE -----------------------
    public boolean deleteAddress(Integer id) {
        if (!addressRepository.existsById(id)) {
            loggingService.warn("Attempted to delete non-existing address", Map.of("addressId", id.toString()));
            return false;
        }

        addressRepository.deleteById(id);
        loggingService.info("Address deleted successfully", Map.of(
            "addressId", id.toString(),
            "action", "delete"
        ));
        return true;
    }
}

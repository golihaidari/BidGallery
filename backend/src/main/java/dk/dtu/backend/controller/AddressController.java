package dk.dtu.backend.controller;

import dk.dtu.backend.persistence.entity.Address;
import dk.dtu.backend.persistence.entity.AccountType;
import dk.dtu.backend.security.Protected;
import dk.dtu.backend.security.RoleProtected;
import dk.dtu.backend.service.AddressService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    // -------------------CREATE------------------------------
    @PostMapping
    @Protected
    @RoleProtected(roles = {AccountType.ADMIN, AccountType.CUSTOMER})
    public ResponseEntity<Address> createAddress(@RequestBody Address address) {
        return ResponseEntity.ok(addressService.saveAddress(address));
    }

     // -------------------READ------------------------------
    @GetMapping
    @Protected
    @RoleProtected(roles = {AccountType.ADMIN})
    public ResponseEntity<List<Address>> getAllAddresses() {
        return ResponseEntity.ok(addressService.getAllAddresses());
    }

    // -------------------UPDATE------------------------------
    @PutMapping("/{id}")
    @Protected
    @RoleProtected(roles = {AccountType.ADMIN, AccountType.CUSTOMER})
    public ResponseEntity<?> updateAddress(@PathVariable Integer id, @RequestBody Address updated) {
        try {
            return ResponseEntity.ok(addressService.updateAddress(id, updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------DELETE------------------------------
    @DeleteMapping("/{id}")
    @Protected
    @RoleProtected(roles = {AccountType.ADMIN, AccountType.CUSTOMER})
    public ResponseEntity<?> deleteAddress(@PathVariable Integer id) {
        try {
            addressService.deleteAddress(id);
            return ResponseEntity.ok("Address deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

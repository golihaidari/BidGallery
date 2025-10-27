package dk.dtu.backend.dto.responses;

public class AddressDTO {
    private int id;
    private int userId;       // FK after user is created
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNr;
    private String country;
    private String postalCode;
    private String city;
    private String address1;
    private String address2;

    // ---------- Getters and Setters ----------
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileNr() { return mobileNr; }
    public void setMobileNr(String mobileNr) { this.mobileNr = mobileNr; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAddress1() { return address1; }
    public void setAddress1(String address1) { this.address1 = address1; }

    public String getAddress2() { return address2; }
    public void setAddress2(String address2) { this.address2 = address2; }
}

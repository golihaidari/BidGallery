import { useState } from "react";
import { Box, TextField, Autocomplete } from "@mui/material";
import countries from "world-countries";
import { useCheckout } from "@context/CheckoutContext";
import type { Address } from "@interfaces/Address";
import FormTemplate from "@utils/FormTemplate";
import FormValidator, {type FormValues} from "@utils/UserFormValidator";
import { useNavigate } from "react-router-dom";

// Sorted country list
const countryList = countries.map((c) => c.name.common).sort();

export default function ShippingAddress() {
  const { dispatch, state } = useCheckout();

  const navigate = useNavigate();

  const [address, setAddress] = useState<Address>(
    state.address || {
      firstName: "",
      lastName: "",
      email: "",
      mobileNr: "",
      country: "Denmark ",
      postalCode: "",
      city: "",
      address1: "",
      address2: "",
    }
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error on change
  };

  const onBlur = (field: keyof Address) => (e: React.FocusEvent<HTMLInputElement>) => {
    const error = FormValidator.validateField(field, e.target.value, address as unknown as FormValues);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = () => {
    const fieldErrors: { [key: string]: string } = {
      firstName: FormValidator.validateField("firstName", address.firstName),
      lastName: FormValidator.validateField("lastName", address.lastName),
      email: FormValidator.validateField("email", address.email),
      mobileNr: FormValidator.validateField("mobileNr", address.mobileNr),
      postalCode: FormValidator.validateField("postalCode", address.postalCode),
      city: FormValidator.validateField("city", address.city),
      address1: FormValidator.validateField("address1", address.address1),
    };

    setErrors(fieldErrors);

    if (Object.values(fieldErrors).some(Boolean)) return; // stop if any error

    dispatch({ type: "SET_ADDRESS", address });
    navigate("/payment");
  };

  return (
    <FormTemplate
      title="Shipping Address"
      onSubmit={handleSubmit}
      error="" // this page does not send data to api, so there is no api error.
      submitLabel="Next"
      disableSubmit ={!address.firstName ||
                      !address.lastName ||
                      !address.email ||
                      !address.mobileNr ||
                      !address.country ||
                      !address.postalCode ||
                      !address.city ||
                      
                      !address.address1}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
        }}
      >
        <TextField
          label="First Name"
          name="firstName"
          value={address.firstName}
          onChange={handleChange}
          onBlur={onBlur("firstName")}
          error={!!errors.firstName}
          helperText={errors.firstName}
          fullWidth
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={address.lastName}
          onChange={handleChange}
          onBlur={onBlur("lastName")}
          error={!!errors.lastName}
          helperText={errors.lastName}
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          value={address.email}
          onChange={handleChange}
          onBlur={onBlur("email")}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
        />
        <TextField
          label="Mobile Number"
          name="mobileNr"
          value={address.mobileNr}
          onChange={handleChange}
          onBlur={onBlur("mobileNr")}
          error={!!errors.mobileNr}
          helperText={errors.mobileNr}
          fullWidth
        />
        <Autocomplete
          freeSolo //to allow custom input
          options={countryList}
          value={address.country}
          onChange={(_, value) =>
            setAddress((prev) => ({ ...prev, country: value || "" }))
          }
          renderInput={(params) => <TextField {...params} 
                                      label="Country" 
                                      fullWidth 
                                      error={!!errors.country}
                                      helperText={errors.country}
                                      onBlur={() => {
                                        if (!address.country || address.country.trim() === "") {
                                          setErrors((prev) => ({ ...prev, country: "Country is required" }));
                                        }
                                      }}
                                    />
          }
        />

        <TextField
          label="Postal Code"
          name="postalCode"
          value={address.postalCode}
          onChange={handleChange}
          onBlur={onBlur("postalCode")}
          error={!!errors.postalCode}
          helperText={errors.postalCode}
          fullWidth
        />
        <TextField
          label="City"
          name="city"
          value={address.city}
          onChange={handleChange}
          onBlur={onBlur("city")}
          error={!!errors.city}
          helperText={errors.city}
          fullWidth
        />
        <TextField
          label="Address1"
          name="address1"
          value={address.address1}
          onChange={handleChange}
          onBlur={onBlur("address1")}
          error={!!errors.address1}
          helperText={errors.address1}
          fullWidth
        />
        <TextField
          label="Address Line 2 (optional)"
          name="address2"
          value={address.address2}
          onChange={handleChange}
          fullWidth
          sx={{ gridColumn: "1 / -1" }}
        />
      </Box>
    </FormTemplate>
  );
}

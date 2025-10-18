import { useState, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import { useCheckout } from "@context/CheckoutContext";
import { useNavigate } from "react-router-dom";
import useFetch from "@hook/fetchData";
import FormTemplate from "@utils/FormTemplate";
import InfoCard from "@components/InfoCard";
export default function Submit() {
  const { state, dispatch } = useCheckout();
  const navigate = useNavigate();
  const { sendRequest, data, error: apiError, isLoading, status, reset } = useFetch<any>(
    "http://localhost:8080/api/checkout/placeorder"
  );

  const [showResultCard, setShowResultCard] = useState(false);
  const [resultType, setResultType] = useState<"success" | "error">("success");
  const [resultMessage, setResultMessage] = useState<string>("");

  const addressText = state.address
    ? `${state.address.firstName} ${state.address.lastName}\n${state.address.address1}\n${state.address.city}, ${state.address.postalCode}\n${state.address.country}`
    : "No address provided";

  const handlePlaceOrder = () => {
    if (state.cart.length === 0) {
      navigate("/"); // go back to product list  if cart is empty
    } else {
      // proceed checkout
      sendRequest(
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart: state.cart.map((item) => ({
              productId: item.product.id,
              bidPrice: item.bidPrice,
            })),
            address: state.address,
            paymentIntentId: state.paymentIntentId,
          }),
        },
        "Failed to submit order"
      );
    }
  };

  useEffect(() => {
    if (!status) return;

    if (status === 200 && data?.success) {
      dispatch({ type: "RESET" }); // clear cart & checkout state
      setResultType("success");
      setResultMessage(data.message || "Order placed successfully");
      setShowResultCard(true);
    } else if (status !== 200 || data?.success === false) {
      setResultType("error");
      setResultMessage(data?.error || data?.message || apiError || "Failed to submit order");
      setShowResultCard(true);
    }
  }, [status, data, apiError, dispatch]);

  // render JSX
  return (
    <>
      {showResultCard ? (
        <InfoCard
          title={resultType === "success" ? "Order Placed!" : "Submission Failed"}
          message={resultMessage}
          type={resultType}
          firstBtnLabel={resultType === "success" ? "Continue Shopping" : "Retry"}
          firstBtnAction={() => {
            if (resultType === "success") {
              navigate("/"); // go back to product list
            } else {
              reset(); // reset fetch state for retry
              setShowResultCard(false);
            }
          }}
           {...(resultType === "error" && {
                secondBtnLabel: "Go to Products",
                secondBtnAction: () => navigate("/"),
              })
            }
        />
      ) : (
        <FormTemplate
          title="Order Receipt"
          onSubmit={handlePlaceOrder}
          loading={isLoading}
          submitLabel={state.cart.length === 0 ? "Go Back to Products" :"Confirm Order"}
          error={apiError}
          disableSubmit={false}
        >
          <Box
            sx={{
              maxWidth: 700,
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {state.cart.length === 0 ? (
              <Box sx={{ color: "error.main", fontWeight: "bold", textAlign: "center" }}>
                Your cart is empty, please select product first.
              </Box>
            ) : (
              state.cart.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "var(--card-bg)",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    component="img"
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    sx={{ width: 80, height: 80, borderRadius: 1, objectFit: "cover" }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ fontWeight: "bold" }}>{item.product.title}</Box>
                    <Box>
                      Bid Price: {item.bidPrice} {item.product.currency}
                    </Box>
                  </Box>
                </Box>
              ))
            )}

            {/* Shipping address */}
            <TextField
              label="Shipping Address"
              value={addressText}
              fullWidth
              multiline
              minRows={3}
              disabled
              variant="outlined"
              InputProps={{ readOnly: true }}
            />

            {/* Payment ID */}
            <TextField
              label="Payment ID"
              value={state.paymentIntentId}
              fullWidth
              disabled
              variant="outlined"
              InputProps={{ readOnly: true }}
            />
          </Box>
        </FormTemplate>
      )}
    </>
  );
}

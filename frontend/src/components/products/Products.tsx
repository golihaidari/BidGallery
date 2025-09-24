import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import useFetch from "@hook/fetchData";
import type { Product } from "@interfaces/Product";
import { useNavigate } from "react-router-dom";
import "./Products.css";
import { useCheckout } from "@context/CheckoutContext";
import { useAuth } from "@context/AuthContext";
import GradientButton from "@utils/GradientButton";
import Loader from "@utils/Loader";

const dataUrl =
  "https://gist.githubusercontent.com/golihaidari/e6cc18a1af1eb0989a98d1ed8a128421/raw/24667d536f5663cc4257f2e5a7941e05845f5c80/arts-dataset.json";

const Products = () => {
  const { sendRequest, data, isLoading, error } = useFetch<Product[]>(dataUrl);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { dispatch } = useCheckout();
  const { auth, logout } = useAuth();

  useEffect(() => { sendRequest(); }, []);
  useEffect(() => { if (data) setProducts(data); }, [data]);

  const handleBid = (e: React.FormEvent, product: Product) => {
    e.preventDefault();
    dispatch({ type: "SET_PRODUCT", product });
    navigate("/giveBid");
  };

  const handleLogin = () => navigate("/login");

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loader />;
  if (error) return <h1>{error}</h1>;

  return (
    <Box className="products-page">
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar className="products-toolbar">
          <Typography variant="h6">BidGallery Shop</Typography>

          <TextField
            placeholder="Search products..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field"
          />

          <GradientButton
            variant="contained"
            onClick={auth.token ? logout : handleLogin}
          >
            {auth.token ? "Logout" : "Login"}
          </GradientButton>
        </Toolbar>
      </AppBar>

      <Box className="products-grid">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="product-card">
            <CardMedia component="img" image={product.image} alt={product.title} />
            <CardContent className="MuiCardContent-root">
              <Typography variant="h6">{product.title}</Typography>
              <Typography variant="body1">
                {`${product.price.toFixed(2)} ${product.currency}`}
              </Typography>
            </CardContent>
            <Box className="button-container">
              <GradientButton
                variant="contained"
                onClick={(e) => handleBid(e, product)}
                className="place-bid-btn"
              >
                PLACE BID
              </GradientButton>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Products;

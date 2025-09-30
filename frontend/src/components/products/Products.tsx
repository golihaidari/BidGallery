import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import useFetch from "@hook/fetchData";
import type { Product } from "@interfaces/Product";
import { useNavigate, useOutletContext } from "react-router-dom";
import "./Products.css";

import GradientButton from "@utils/GradientButton";
import Loader from "@utils/Loader";

const dataUrl =
  "https://gist.githubusercontent.com/golihaidari/e6cc18a1af1eb0989a98d1ed8a128421/raw/24667d536f5663cc4257f2e5a7941e05845f5c80/arts-dataset.json";

type OutletContext = { searchTerm: string };

const Products = () => {
  const { sendRequest, data, isLoading, error } = useFetch<Product[]>(dataUrl);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { searchTerm } = useOutletContext<OutletContext>();  // get from Layout

  useEffect(() => { sendRequest(); }, []);
  useEffect(() => { if (data) setProducts(data); }, [data]);

  const handleBid = (e: React.FormEvent, product: Product) => {
    e.preventDefault();
    navigate("/giveBid", { state: { product } });
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loader />;
  if (error) return <h1>{error}</h1>;

  return (
    <Box className="products-page">
      <Box className="products-grid global-container">
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

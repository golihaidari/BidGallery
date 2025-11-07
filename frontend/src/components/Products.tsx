import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import useFetch from "@hook/fetchData";
import type { Product } from "@interfaces/Product";
import { useNavigate, useOutletContext } from "react-router-dom";
import "@components/extraCss/Products.css";

import ProductCard from "@components/cards/ProductCard";
import Loader from "@components/common/Loader";
import { API_CONFIG } from "../config";

//const dataUrl = "/data/products.json"; maybe use for demo
const dataUrl =`${API_CONFIG.baseURL}/products/available`
type OutletContext = { searchTerm: string };

const Products = () => {
  const { sendRequest, data, isLoading, error } = useFetch<Product[]>(dataUrl);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { searchTerm } = useOutletContext<OutletContext>();

  useEffect(() => { 
    sendRequest({ 
      method: "GET",
      credentials: "include", 
    }); 
  }, []);
  useEffect(() => { if (data) setProducts(data); }, [data]);

  const handleBid = (product: Product, e: React.FormEvent) => {
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
          <ProductCard key={product.id} product={product} onBid={handleBid} />
        ))}
      </Box>
    </Box>
  );
};

export default Products;

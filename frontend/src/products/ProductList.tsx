import useFetch from '../hook/fetchData';
import type { ProductItem } from "../interfaces/ProductItem";
import { useContext, useEffect, useState } from "react";
import "./ProductList.css";
import RoundLoader from "../roundLoader/RoundLoader";
import React from "react";
import { useNavigate } from "react-router-dom";
import { BidContext } from '../context/BidContext';

const dataUrl =
  "https://gist.githubusercontent.com/golihaidari/e6cc18a1af1eb0989a98d1ed8a128421/raw/24667d536f5663cc4257f2e5a7941e05845f5c80/arts-dataset.json";

function ProductList() {
  const { sendRequest, data, isLoading, error } = useFetch<ProductItem[]>(dataUrl);
  const [products, setProducts] = useState<ProductItem[]>([]);

  // Fetch once on mount
  useEffect(() => {
    sendRequest();
  }, []);

  // Update local state when data changes
  useEffect(() => {
    if (data) {
      setProducts(data);
    }
  }, [data]);

  // inside ProductList()
  const navigate = useNavigate();
  const bidContext = useContext(BidContext);

  const handleBid = (e: React.FormEvent, product: ProductItem) => {
    e.preventDefault();
    if(!bidContext) {
       return <h1>"BidContext not available. wrap in BidProvider."</h1>;
    }
    
    // save products info into bidContext befor navigating
    bidContext.setBid({
      product: product,
      bidAmount: 0,
      bidSession_id: undefined,
      paymentClientSecret: undefined,
    })

    navigate("/giveBid")
  };

  if (isLoading) return <RoundLoader />;
  if (error) return <h1>{error}</h1>;

  return (
    <div className="ProductList">
      {products.map((product) => (
        <div className="card" aria-label={`Produkt ${product.title}`} key={product.id}>
          <img src={product.image} alt={product.title} />
          <br />
          <label className="name">{product.title}</label>
          <p className="price">{`${product.price.toFixed(2)} ${product.currency}`}</p>
          <p className="add-button">
            <button onClick={(e) => handleBid(e, product)}>
              <b>
                <i>PLACE BID</i>
              </b>
            </button>
          </p>
        </div>
      ))}
    </div>
  );
}

export default ProductList;

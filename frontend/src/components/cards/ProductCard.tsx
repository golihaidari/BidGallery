import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import GradientButton from "@components/common/GradientButton";
import type { Product } from "@interfaces/Product";

interface Props {
  product: Product;
  onBid: (product: Product, e: React.FormEvent) => void;
}

const ProductCard = ({ product, onBid }: Props) => {
  return (
    <Card className="product-card">
      <CardMedia component="img" image={product.imageUrl} alt={product.title} />
      <CardContent className="MuiCardContent-root">
        <Typography variant="h6" id="title">{product.title}</Typography>
        <Typography variant="body1" id="artist"> by:{product.artistFirstName} {product.artistLastName}</Typography>
      </CardContent>
      <Box className="button-container">
        <GradientButton
          variant="contained"
          onClick={(e) => onBid(product, e)}
          className="place-bid-btn"
        >
          PLACE BID
        </GradientButton>
      </Box>
    </Card>
  );
};

export default ProductCard;

import { AppBar, Toolbar, Typography, IconButton, Badge, Box, Menu, MenuItem, useMediaQuery, TextField, InputAdornment } from "@mui/material";
import { ShoppingCart, Search, Menu as MenuIcon } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GradientButton from "@components/common/GradientButton";
import { useAuth } from "@context/AuthContext.tsx";
import { useCheckout } from "@context/CheckoutContext.tsx";
import "../extraCss/Navbar.css";

type NavbarProps = {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
};

export default function Navbar({ searchTerm, setSearchTerm }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { state } = useCheckout(); // get cart
  const cartCount = state.cart.length;  // number to show in badge
  const isMobile = useMediaQuery("(max-width:600px)");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogin = () => navigate("/login");
  const handleProducts = () => navigate("/");
  const handleArtists = () => navigate("/artists");
  const handleCart = () => navigate("/cart");

  const tabStyle = (path: string) => ({
    cursor: "pointer",
    fontWeight: location.pathname === path ? "bold" : "normal",
    color: location.pathname === path ? "var(--button-primary)" : "var(--text-primary)",
    "&:hover": { color: "var(--button-secondary)" },
  });

  return (
    <AppBar className="navbar global-container" position="static" sx={{ backgroundColor: "white" }} elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left: Logo + Tabs */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Typography className="logo" variant="h5" sx={{ cursor: "pointer" }} onClick={handleProducts}>
            BidGallery
          </Typography>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={tabStyle("/")} onClick={handleProducts}>Products</Typography>
              <Typography sx={tabStyle("/artists")} onClick={handleArtists}>Artists</Typography>
            </Box>
          )}
        </Box>

        {/* Right: Search + Cart + Login / Mobile Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!isMobile && location.pathname === "/" && (
            <TextField
              placeholder="Search products..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ maxWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {/* Cart always visible */}
          <IconButton onClick={handleCart} className="cart-btn">
            <Badge badgeContent={cartCount} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {isMobile ? (
            <>
              <IconButton onClick={handleMenuOpen}>
                <MenuIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => { handleProducts(); handleMenuClose(); }}>Products</MenuItem>
                <MenuItem onClick={() => { handleArtists(); handleMenuClose(); }}>Artists</MenuItem>
                <MenuItem onClick={() => { isAuthenticated ? logout() : handleLogin(); handleMenuClose(); }}>
                  {isAuthenticated ? "Logout" : "Login"}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <GradientButton variant="contained" onClick={isAuthenticated ? logout : handleLogin}>
              {isAuthenticated ? "Logout" : "Login"}
            </GradientButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

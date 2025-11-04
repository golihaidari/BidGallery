import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import useFetch from "@hook/fetchData";
import type { Artist } from "@interfaces/Artist";
import ArtistCard from "@components/cards/ArtistCard";
import Loader from "@components/common/Loader";
import "./extraCss/Artists.css";
import { API_URL } from "../config";

//const dataUrl = "/data/artists.json";
const dataUrl =`${API_URL}/api/artists`

const ArtistsPage = () => {
  const { sendRequest, data, isLoading, error } = useFetch<Artist[]>(dataUrl);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    sendRequest(
      { 
      method: "GET",
      credentials: "include", 
    });
  }, []);

  useEffect(() => {
    if (data) setArtists(data);
  }, [data]);

  if (isLoading) return <Loader />;
  if (error) return <h1>{error}</h1>;

  return (
    <Box className="artists-grid" p={4}>
      {artists.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} />
      ))}
    </Box>
  );
};

export default ArtistsPage;

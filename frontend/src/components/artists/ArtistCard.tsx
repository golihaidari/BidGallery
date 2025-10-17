import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import type { Artist } from "@interfaces/Artist";
import "./Artists.css";

interface Props {
  artist: Artist;
}

const ArtistCard = ({ artist }: Props) => {
  return (
    <Card className="artist-card">
      <CardMedia component="img" image={artist.imageUrl} alt={artist.firstName} />
      <CardContent>
        <Typography variant="h6">{artist.firstName} {artist.lastName}</Typography>
        <Typography variant="body2" color="text.secondary">{artist.style}</Typography>
        <Typography variant="body1">{artist.bio}</Typography>
      </CardContent>
    </Card>
  );
};

export default ArtistCard;

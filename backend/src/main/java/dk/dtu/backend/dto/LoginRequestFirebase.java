package dk.dtu.backend.dto;

public class LoginRequestFirebase {
    private String token;

    public String getToken() { return token; }
    public void setToken(String token) { 
        this.token = sanitizeToken(token);
    }

    private String sanitizeToken(String token) {
        if (token == null) return null;
        // Remove any potentially dangerous characters from token
        return token.replaceAll("[<>\"';]", "").trim();
    }
}
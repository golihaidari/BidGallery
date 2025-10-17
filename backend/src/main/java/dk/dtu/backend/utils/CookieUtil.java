package dk.dtu.backend.utils;

import org.springframework.http.ResponseCookie;

public class CookieUtil {

    private static final long COOKIE_MAX_AGE = 24 * 60 * 60; // 1 day in seconds

    public static ResponseCookie createJwtCookie(String token) {
        return ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .path("/")
                .maxAge(COOKIE_MAX_AGE)
                .secure(false)     // set true if HTTPS
                .sameSite("Strict")
                .build();
    }

    public static ResponseCookie clearJwtCookie() {
        return ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .secure(false)
                .sameSite("Strict")
                .build();
    }
}

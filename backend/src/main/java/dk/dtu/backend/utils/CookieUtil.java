package dk.dtu.backend.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;

public class CookieUtil {

    private static final long COOKIE_MAX_AGE = 24 * 60 * 60; // 1 day in seconds

    private static boolean secure;
    private static String sameSite;

    @Value("${app.cookie.secure:false}")
    public void setSecure(boolean secure) {
        CookieUtil.secure = secure;
        System.out.println("Cookie secure setting: " + secure);
    }

    @Value("${app.cookie.same-site:Lax}")
    public void setSameSite(String sameSite) {
        CookieUtil.sameSite = sameSite;
        System.out.println("Cookie sameSite setting: " + sameSite);
    }

    public static ResponseCookie createJwtCookie(String token) {
        return ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .path("/")
                .maxAge(COOKIE_MAX_AGE)
                .secure(secure)     // set true if HTTPS
                .sameSite(sameSite)  
                .build();
    }

    public static ResponseCookie clearJwtCookie() {
        return ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .secure(secure)
                .sameSite(sameSite)//Strict
                .build();
    }
}

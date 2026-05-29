package org.jakub.backendapi.config;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserAuthProviderTest {

    @Test
    void clearHttpOnlyCookiesShouldExpireAuthCookiesWithMatchingAttributes() {
        UserAuthProvider userAuthProvider = new UserAuthProvider(null);
        ReflectionTestUtils.setField(userAuthProvider, "secureCookie", true);
        ReflectionTestUtils.setField(userAuthProvider, "sameSite", "None");

        ArrayList<ResponseCookie> cookies = userAuthProvider.clearHttpOnlyCookies();

        assertEquals(2, cookies.size());
        assertExpiredCookie(cookies.get(0), "access_token");
        assertExpiredCookie(cookies.get(1), "refresh_token");
    }

    private void assertExpiredCookie(ResponseCookie cookie, String expectedName) {
        assertEquals(expectedName, cookie.getName());
        assertEquals("", cookie.getValue());
        assertEquals("/", cookie.getPath());
        assertEquals(Duration.ZERO, cookie.getMaxAge());
        assertEquals("None", cookie.getSameSite());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
    }
}

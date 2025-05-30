package org.jakub.backendapi.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserAuthenticationEntryPoint userAuthenticationEntryPoint;
    private final UserAuthProvider userAuthProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults()) // Enables CORS using corsConfigurationSource bean
            .csrf(csrf -> csrf.disable()) // No CSRF for stateless APIs
            .exceptionHandling(ex -> ex.authenticationEntryPoint(userAuthenticationEntryPoint))
            .addFilterBefore(new JwtAuthFilter(userAuthProvider), BasicAuthenticationFilter.class)
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Configure request authorization
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/login", "/register", "/refresh", "/addRecipe").permitAll()
                .requestMatchers(HttpMethod.GET, "/getAllRecipes").permitAll() // Allow GET requests to /getAllRecipes for everyone
                .anyRequest().authenticated()
            )

            // Disable Spring Security's default logout handling to avoid redirecting to /login
            .logout(logout -> logout
                .logoutUrl("/logout")  // Ensure your custom logout endpoint
                .clearAuthentication(true) // Clear authentication on logout
                .invalidateHttpSession(true) // Invalidate the session on logout
                .deleteCookies("JSESSIONID", "access_token", "refresh_token") // Delete cookies on logout if applicable
                .permitAll() // Ensure logout is publicly accessible
            );

        return http.build();
    }
}

package com.example.vendorbackend.config;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class FirebaseTokenFilter extends OncePerRequestFilter {

    private static boolean isWhitelisted(HttpServletRequest request) {
        final String method = request.getMethod();
        final String path = request.getRequestURI();

        // CORS preflight serbest
        if ("OPTIONS".equalsIgnoreCase(method)) return true;

        // public endpoint'ler
        if ("/api/hello".equals(path)) return true;
        if (path != null && path.startsWith("/api/_debug/")) return true;
        if (path != null && path.startsWith("/actuator/")) return true;

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        final String path = request.getRequestURI();

        // public yolları ve /api dışını olduğu gibi geçir
        if (isWhitelisted(request) || path == null || !path.startsWith("/api/")) {
            chain.doFilter(request, response);
            return;
        }

        // /api/** için Bearer zorunlu
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            System.out.println("❌ No/Bad Authorization header on " + request.getMethod() + " " + path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setHeader("WWW-Authenticate", "Bearer realm=\"firebase\"");
            return;
        }

        String idToken = auth.substring(7).trim();
        System.out.println("🔎 Authorization header detected, token length=" + idToken.length());

        try {
            FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);

            // (İstersen custom claim’lerden rol çıkar)
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(decoded.getUid(), null, authorities);
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authToken);
            SecurityContextHolder.setContext(context);

            // debug log
            var claims = decoded.getClaims();
            System.out.println("✅ Firebase verify OK | uid=" + decoded.getUid()
                    + " | roles=" + authorities
                    + " | aud=" + claims.get("aud")
                    + " | iat=" + claims.get("iat")
                    + " | exp=" + claims.get("exp"));

            chain.doFilter(request, response);

        } catch (FirebaseAuthException ex) {
            System.out.println("❌ verifyIdToken failed: "
                    + (ex.getAuthErrorCode() != null ? ex.getAuthErrorCode().name() : "UNKNOWN")
                    + " | " + ex.getMessage());
            //ex.printStackTrace(); // gerekirse aç
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setHeader("WWW-Authenticate", "Bearer error=\"invalid_token\"");
        }
    }
}

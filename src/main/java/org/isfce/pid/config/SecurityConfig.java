package org.isfce.pid.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

	@Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
	private String keySetUri;

	private final KeycloakJwtConverter converter;

	// constructeur qui injecte le convertisseur jwt vers security context
	public SecurityConfig(KeycloakJwtConverter converter) {
		super();
		this.converter = converter;
	}

	@Bean
	@Profile("dev")
	WebSecurityCustomizer webSecurityCustomizer() {
		return (web) -> web.ignoring().requestMatchers("/h2/**");
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.sessionManagement(t -> t.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		http.csrf(c -> c.disable()); // désactive la protection csrf
		http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.oauth2ResourceServer(
						// Version où le certificat est recherché sur Keycloak
						c -> c.jwt(j -> j.jwkSetUri(keySetUri).jwtAuthenticationConverter(converter)));
		http.authorizeHttpRequests(
				c -> c.requestMatchers("/api/dispenses/simuler", "/api/ue/sections", "/api/ue/liste",
						"/api/ue/detail/*", "/api/etablissements", "/api/cours-externes/**")
						.permitAll()
						.requestMatchers(HttpMethod.DELETE, "/api/ue/**/delete").hasAnyRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/ue/add").hasAnyRole("ADMIN")
						.anyRequest().authenticated());

		return http.build();
	}

	/**
	 * Configuration CORS.
	 * En dev : autorise uniquement l'origine Vite (localhost:5173).
	 * Pour la prod, remplacer par l'URL réelle du frontend.
	 */
	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		// Origines autorisées — à adapter pour la production
		configuration.setAllowedOrigins(List.of("http://localhost:5173"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
		configuration.setExposedHeaders(List.of("Authorization"));
		configuration.setAllowCredentials(false);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}

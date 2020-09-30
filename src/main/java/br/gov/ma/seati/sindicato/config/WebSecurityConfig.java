package br.gov.ma.seati.sindicato.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.gov.ma.seati.sindicato.filter.JwtTokenFilterConfigurer;
import br.gov.ma.seati.sindicato.service.JwtTokenService;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
	
	@Autowired
    private JwtTokenService jwtTokenService;

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        // Disable CSRF (cross site request forgery)
        http.cors().and().csrf().disable();

        // No session will be created or used by spring security
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        // Entry points
        http
    		.authorizeRequests()
    			.antMatchers("/v2/api-docs", 
    					"/configuration/ui", 
    					"/swagger-resources", 
    					"/configuration/security", 
    					"/swagger-ui.html", 
    					"/webjars/**",
    					"/swagger-resources/configuration/ui",
    					"/swagger-ui.html", "/auth/**", "/api/**", "/admin/**").permitAll(); 
//    			.antMatchers("/api/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_USUARIO")
//	    		.antMatchers("/admin/**", "/actuator/**").hasAuthority("ROLE_ADMIN");

        // If a user try to access a resource without having enough permissions
        http.exceptionHandling().accessDeniedPage("/login");

        // Apply JWT
        http.apply(new JwtTokenFilterConfigurer(jwtTokenService));

        // Optional, if you want to test the API from a browser
        // http.httpBasic();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager customAuthenticationManager() throws Exception {
        return authenticationManager();
    }

}

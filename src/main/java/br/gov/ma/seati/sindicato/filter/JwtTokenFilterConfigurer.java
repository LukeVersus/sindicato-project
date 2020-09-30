package br.gov.ma.seati.sindicato.filter;

import org.springframework.security.config.annotation.SecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import br.gov.ma.seati.sindicato.service.JwtTokenService;

public class JwtTokenFilterConfigurer extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {
	
	private JwtTokenService jwtTokenService;

    public JwtTokenFilterConfigurer(JwtTokenService jwtTokenService) {
        this.jwtTokenService = jwtTokenService;
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        JwtTokenFilter customFilter = new JwtTokenFilter(jwtTokenService);
        http.addFilterBefore(customFilter, UsernamePasswordAuthenticationFilter.class);
    }

}

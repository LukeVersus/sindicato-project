package br.gov.ma.seati.sindicato.service;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtTokenService {
	
	String createToken(String username, List<String> roles);
	
	String resolveToken(HttpServletRequest req);
	
	boolean validateToken(String token);
	
	boolean isTokenPresentInDB (String token);
	
	UserDetails getUserDetails(String token);
	
	List<String> getRoleList(String token);
	
	String getUsername(String token);
	
	Authentication getAuthentication(String token);
	
	void delete(String token);

}

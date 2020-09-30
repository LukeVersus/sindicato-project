package br.gov.ma.seati.sindicato.service.impl;


import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import br.gov.ma.seati.sindicato.entity.Usuario;
import br.gov.ma.seati.sindicato.enums.NivelEnum;
import br.gov.ma.seati.sindicato.exception.CustomException;
import br.gov.ma.seati.sindicato.service.LoginService;
import br.gov.ma.seati.sindicato.service.UsuarioService;

@Service
public class LoginServiceImpl implements LoginService {

	@Autowired
	private JwtTokenServiceImpl jwtTokenService;

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private UsuarioService usuarioService;

	@Override
	public String login(String username, String password) {
		try {
			authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
			Usuario usuario = usuarioService.findByUsername(username);
			if (usuario == null || usuario.getNiveis() == null || usuario.getNiveis().isEmpty()) {
				throw new CustomException("Invalid username or password.", HttpStatus.UNAUTHORIZED);
			}
			// NOTE: normally we dont need to add "ROLE_" prefix. Spring does automatically
			// for us.
			// Since we are using custom token using JWT we should add ROLE_ prefix
			String token = jwtTokenService.createToken(username,
					usuario.getNiveis().stream().map((NivelEnum nivel) -> "ROLE_" + nivel.name())
							.filter(Objects::nonNull).collect(Collectors.toList()));

			System.out.println(token);
			return token;

		} catch (AuthenticationException e) {
			throw new CustomException("Username ou password inválido.", HttpStatus.UNAUTHORIZED);
		}
	}

	@Override
	public boolean logout(String token) {
		jwtTokenService.delete(token);
		return true;
	}

	@Override
	public Boolean isValidToken(String token) {
		return jwtTokenService.validateToken(token);
	}

	@Override
	public String createNewToken(String token) {
		String username = jwtTokenService.getUsername(token);
		List<String> roleList = jwtTokenService.getRoleList(token);
		return jwtTokenService.createToken(username, roleList);
	}



}

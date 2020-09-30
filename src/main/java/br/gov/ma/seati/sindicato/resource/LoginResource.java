package br.gov.ma.seati.sindicato.resource;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import br.gov.ma.seati.sindicato.entity.AuthResponse;
import br.gov.ma.seati.sindicato.entity.LoginRequest;
import br.gov.ma.seati.sindicato.entity.Usuario;
import br.gov.ma.seati.sindicato.service.JwtTokenService;
import br.gov.ma.seati.sindicato.service.LoginService;
import br.gov.ma.seati.sindicato.service.UsuarioService;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class LoginResource {

	@Autowired
	private LoginService loginService;
	
	@Autowired
	private JwtTokenService jwtTokenService;
	
	@Autowired
	private UsuarioService usuarioService;

	@PostMapping("/signin")
	@ResponseBody
	public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
		String token = loginService.login(loginRequest.getUsername(), loginRequest.getPassword());
		
		HttpHeaders headers = new HttpHeaders();
		List<String> headerlist = new ArrayList<>();
		List<String> exposeList = new ArrayList<>();
		headerlist.add("Content-Type");
		headerlist.add("Accept");
		headerlist.add("X-Requested-With");
		headerlist.add("Authorization");
		headers.setAccessControlAllowHeaders(headerlist);
		exposeList.add("Authorization");
		headers.setAccessControlExposeHeaders(exposeList);
		headers.set("Authorization", token);
		Usuario usuario = usuarioService.findByUsername(loginRequest.getUsername());
		usuario.setPassword("");
		return new ResponseEntity<AuthResponse>(new AuthResponse(token, usuario), headers, HttpStatus.CREATED);
	}

	@PostMapping("/signout")
	@ResponseBody
	public ResponseEntity<AuthResponse> logout(@RequestHeader(value = "Authorization") String token) {
		HttpHeaders headers = new HttpHeaders();
		if (loginService.logout(token)) {
			headers.remove("Authorization");
			return new ResponseEntity<AuthResponse>(new AuthResponse("logged out", null), headers, HttpStatus.CREATED);
		}
		return new ResponseEntity<AuthResponse>(new AuthResponse("Logout Failed", null), headers, HttpStatus.NOT_MODIFIED);
	}

	/**
	 *
	 * @param token
	 * @return boolean. if request reach here it means it is a valid token.
	 */
	@PostMapping("/valid/token")
	@ResponseBody
	public Boolean isValidToken(@RequestHeader(value = "Authorization") String token) {
		return true;
	}

	@PostMapping("/signin/token")
	@ResponseBody
	public ResponseEntity<AuthResponse> createNewToken(@RequestHeader(value = "Authorization") String token) {
		String newToken = loginService.createNewToken(token);
		
		HttpHeaders headers = new HttpHeaders();
		List<String> headerList = new ArrayList<>();
		List<String> exposeList = new ArrayList<>();
		headerList.add("Content-Type");
		headerList.add("Accept");
		headerList.add("X-Requested-With");
		headerList.add("Authorization");
		headers.setAccessControlAllowHeaders(headerList);
		exposeList.add("Authorization");
		headers.setAccessControlExposeHeaders(exposeList);
		headers.set("Authorization", newToken);
		Usuario usuario = usuarioService.findByUsername(jwtTokenService.getUsername(newToken));
		usuario.setPassword("");
		return new ResponseEntity<AuthResponse>(new AuthResponse(newToken, usuario), headers, HttpStatus.CREATED);
	}
	
}

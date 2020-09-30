package br.gov.ma.seati.sindicato.service;

public interface LoginService {

	String login(String username, String password);

	boolean logout(String token);

	Boolean isValidToken(String token);

	String createNewToken(String token);

}

package br.gov.ma.seati.sindicato.entity;

public class AuthResponse {
	
	private String accessToken ;
	private Usuario usuario;

    public AuthResponse(String accessToken, Usuario usuario) {
        this.accessToken = accessToken;
        this.usuario = usuario;
    }

    public AuthResponse() {
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

}

package br.gov.ma.seati.sindicato.entity;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "jwt_token", schema = "seguranca")
public class JwtToken {
	
	@Id
    private String token;

    public JwtToken(String token) {
        this.token = token;
    }

    public JwtToken() {
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

}

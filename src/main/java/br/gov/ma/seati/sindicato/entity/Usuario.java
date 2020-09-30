package br.gov.ma.seati.sindicato.entity;

import java.util.List;

import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinTable;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import br.gov.ma.seati.sindicato.enums.NivelEnum;

@Entity
@Table(name = "usuario", schema = "seguranca")
public class Usuario {

	@Id
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator = "seq_usuario")
	@SequenceGenerator(name = "seq_usuario", sequenceName = "seq_usuario", schema = "seguranca", allocationSize = 1)
	private Long id;
	@NotEmpty(message = "*Campo 'Nome', obrigatório.")
	private String nome;
	//Username
	@NotEmpty(message = "*Campo 'Usuario', obrigatório.")
	private String username;
	
	@NotEmpty(message = "*Campo 'Password', obrigatório.")
	private String password;
	
	@Column(columnDefinition = "text")
	private String imgCapa;
	
	//Mesmo que status
	private boolean ativo = true;
	private boolean habilitado = true;
	private boolean expirado = false;
	private boolean bloqueado = false;
	@ElementCollection
	@JoinTable(name = "nivel_usuario", schema = "seguranca")
	@Enumerated(EnumType.STRING)
	@NotNull(message = "Campo 'Níveis' obrigatório!")
	private List<NivelEnum> niveis;
	
	
	@Email
	private String email;
	
	private String telefone;
	
	public Long getId() {
		return id;
	}
	
	public void setId(Long id) {
		this.id = id;
	}
		
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}
	
	public void setPassword(String password) {
		this.password = password;
	}
	
	public boolean getAtivo() {
		return ativo;
	}
	
	public void setAtivo(boolean ativo) {
		this.ativo = ativo;
	}
	
	public boolean isHabilitado() {
		return habilitado;
	}
	
	public void setHabilitado(boolean habilitado) {
		this.habilitado = habilitado;
	}
	
	public boolean isExpirado() {
		return expirado;
	}
	public void setExpirado(boolean expirado) {
		this.expirado = expirado;
	}
	
	public boolean isBloqueado() {
		return bloqueado;
	}
	
	public void setBloqueado(boolean bloqueado) {
		this.bloqueado = bloqueado;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public List<NivelEnum> getNiveis() {
		return niveis;
	}

	public void setNiveis(List<NivelEnum> niveis) {
		this.niveis = niveis;
	}
	
	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getTelefone() {
		return telefone;
	}

	public void setTelefone(String telefone) {
		this.telefone = telefone;
	}
	
	public String getImgCapa() {
		return imgCapa;
	}

	public void setImgCapa(String imgCapa) {
		this.imgCapa = imgCapa;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Usuario other = (Usuario) obj;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		return true;
	}
	
}

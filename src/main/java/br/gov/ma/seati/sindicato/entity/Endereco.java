package br.gov.ma.seati.sindicato.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "endereco", schema = "sindicato")
public class Endereco {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_endereco")
	@SequenceGenerator(name = "seq_endereco", initialValue = 45351, sequenceName = "seq_endereco", allocationSize = 1, schema = "sindicato")
	private Long id;

	@Column(columnDefinition = "text")
	private String logradouro;

	private String numero;

	@Column(columnDefinition = "text")
	private String complemento;

	private String bairro;

	private String cep;

	private String tel_res;
	
	private String tel_trab;
	
	private String tel_cel;
	
	private String email;

	@ManyToOne
	@JoinColumn(name = "municipio_id")
	private Municipio municipio;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getLogradouro() {
		return logradouro;
	}

	public void setLogradouro(String logradouro) {
		this.logradouro = logradouro;
	}

	public String getNumero() {
		return numero;
	}

	public void setNumero(String numero) {
		this.numero = numero;
	}

	public String getComplemento() {
		return complemento;
	}

	public void setComplemento(String complemento) {
		this.complemento = complemento;
	}

	public String getBairro() {
		return bairro;
	}

	public void setBairro(String bairro) {
		this.bairro = bairro;
	}

	public String getCep() {
		return cep;
	}

	public void setCep(String cep) {
		this.cep = cep;
	}

	public Municipio getMunicipio() {
		return municipio;
	}

	public void setMunicipio(Municipio municipio) {
		this.municipio = municipio;
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
		Endereco other = (Endereco) obj;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		return true;
	}

	public String getTel_res() {
		return tel_res;
	}

	public void setTel_res(String tel_res) {
		this.tel_res = tel_res;
	}

	public String getTel_trab() {
		return tel_trab;
	}

	public void setTel_trab(String tel_trab) {
		this.tel_trab = tel_trab;
	}

	public String getTel_cel() {
		return tel_cel;
	}

	public void setTel_cel(String tel_cel) {
		this.tel_cel = tel_cel;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

}

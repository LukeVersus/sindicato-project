package br.gov.ma.seati.sindicato.entity;

import java.util.Date;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import br.gov.ma.seati.sindicato.enums.FaixaSalarioEnum;
import br.gov.ma.seati.sindicato.enums.SexoEnum;
import br.gov.ma.seati.sindicato.enums.SituacaoEnum;
import br.gov.ma.seati.sindicato.enums.TpEscolaridadeEnum;
import br.gov.ma.seati.sindicato.enums.TpEstadoCivilEnum;
import br.gov.ma.seati.sindicato.enums.TpRedeEnsinoEnum;
import br.gov.ma.seati.sindicato.enums.TurnoEnum;

@Entity
@Table(name = "associado", schema = "sindicato")
public class Associado {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_associado")
	@SequenceGenerator(name = "seq_associado", sequenceName = "seq_associado", allocationSize = 1, schema = "sindicato")
	private Long id;

	private String nome;

	private String matricula;

	private String nivel;

	private String cpf;

	private String rg;

	private String orgao_expedidor;

	private String atividade_funcional;

	private String disciplina;
	
	private String nome_escola;
	
	private String celular;
	
	private Boolean validacao;

	@OneToOne
	private Usuario usuario;
	

	@Enumerated(EnumType.STRING)
	@JoinColumn(name = "sexo")
	private SexoEnum sexo;

	@Enumerated(EnumType.STRING)
	@JoinColumn(name = "tpEstadoCivil")
	private TpEstadoCivilEnum tpEstadoCivil;

	private Date datanascimento;

	@Enumerated(EnumType.STRING)
	@JoinColumn(name = "tpRedeEnsino")
	private TpRedeEnsinoEnum tpRedeEnsino;

	@Enumerated(EnumType.STRING)
	@JoinColumn(name = "situacao")
	private SituacaoEnum situacao;

	@Enumerated(EnumType.STRING)
	@JoinColumn(name = "turno")
	private TurnoEnum turno;

	@Enumerated(EnumType.STRING)
	@JoinColumn(name = "tpEscolaridade")
	private TpEscolaridadeEnum tpEscolaridade;

	@OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "endereco_id")
	private Endereco endereco;

	@ManyToOne
	@JoinColumn(name = "municipio_lotacao")
	private Municipio municipio_lotacao;

	@Column(name = "observacao", columnDefinition = "TEXT")
	private String observacao;

	@Column(name = "foto", columnDefinition = "TEXT")
	private String foto;

	@Column(name = "anexo_documento", columnDefinition = "TEXT")
	private String anexo_documento;

	@Enumerated(EnumType.STRING)
	@JoinColumn(name = "faixaSalario")
	private FaixaSalarioEnum faixaSalario;

	@ManyToOne
	@JoinColumn(name = "escola_id")
	private Escola escola;
	

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Endereco getEndereco() {
		return endereco;
	}

	public void setEndereco(Endereco endereco) {
		this.endereco = endereco;
	}

	public FaixaSalarioEnum getFaixaSalario() {
		return faixaSalario;
	}

	public void setFaixaSalario(FaixaSalarioEnum faixaSalario) {
		this.faixaSalario = faixaSalario;
	}

	public String getObservacao() {
		return observacao;
	}

	public void setObservacao(String observacao) {
		this.observacao = observacao;
	}

	public String getFoto() {
		return foto;
	}

	public void setFoto(String foto) {
		this.foto = foto;
	}

	public String getAnexo_documento() {
		return anexo_documento;
	}

	public void setAnexo_documento(String anexo_documento) {
		this.anexo_documento = anexo_documento;
	}

	public String getRg() {
		return rg;
	}

	public void setRg(String rg) {
		this.rg = rg;
	}

	public Date getDatanascimento() {
		return datanascimento;
	}

	public void setDatanascimento(Date datanascimento) {
		this.datanascimento = datanascimento;
	}

	public TurnoEnum getTurno() {
		return turno;
	}

	public void setTurno(TurnoEnum turno) {
		this.turno = turno;
	}					

	public String getNome_escola() {
		return nome_escola;
	}

	public void setNome_escola(String nome_escola) {
		this.nome_escola = nome_escola;
	}

	public String getCelular() {
		return celular;
	}

	public void setCelular(String celular) {
		this.celular = celular;
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
		Associado other = (Associado) obj;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		return true;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getCpf() {
		return cpf;
	}

	public void setCpf(String cpf) {
		this.cpf = cpf;
	}

	public String getOrgao_expedidor() {
		return orgao_expedidor;
	}

	public void setOrgao_expedidor(String orgao_expedidor) {
		this.orgao_expedidor = orgao_expedidor;
	}

	public String getMatricula() {
		return matricula;
	}

	public void setMatricula(String matricula) {
		this.matricula = matricula;
	}

	public String getNivel() {
		return nivel;
	}

	public void setNivel(String nivel) {
		this.nivel = nivel;
	}

	public String getAtividade_funcional() {
		return atividade_funcional;
	}

	public void setAtividade_funcional(String atividade_funcional) {
		this.atividade_funcional = atividade_funcional;
	}

	public String getDisciplina() {
		return disciplina;
	}

	public void setDisciplina(String disciplina) {
		this.disciplina = disciplina;
	}

	public SexoEnum getSexo() {
		return sexo;
	}

	public void setSexo(SexoEnum sexo) {
		this.sexo = sexo;
	}

	public TpEstadoCivilEnum getTpEstadoCivil() {
		return tpEstadoCivil;
	}

	public void setTpEstadoCivil(TpEstadoCivilEnum tpEstadoCivil) {
		this.tpEstadoCivil = tpEstadoCivil;
	}

	public TpRedeEnsinoEnum getTpRedeEnsino() {
		return tpRedeEnsino;
	}

	public void setTpRedeEnsino(TpRedeEnsinoEnum tpRedeEnsino) {
		this.tpRedeEnsino = tpRedeEnsino;
	}

	public SituacaoEnum getSituacao() {
		return situacao;
	}

	public void setSituacao(SituacaoEnum situacao) {
		this.situacao = situacao;
	}

	public TpEscolaridadeEnum getTpEscolaridade() {
		return tpEscolaridade;
	}

	public void setTpEscolaridade(TpEscolaridadeEnum tpEscolaridade) {
		this.tpEscolaridade = tpEscolaridade;
	}

	public Municipio getMunicipio_lotacao() {
		return municipio_lotacao;
	}

	public void setMunicipio_lotacao(Municipio municipio_lotacao) {
		this.municipio_lotacao = municipio_lotacao;
	}

	public Escola getEscola() {
		return escola;
	}

	public void setEscola(Escola escola) {
		this.escola = escola;
	}
	
	public Boolean isValidacao() {
		return validacao;
	}

	public void setValidacao(Boolean validacao) {
		this.validacao = validacao;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

}

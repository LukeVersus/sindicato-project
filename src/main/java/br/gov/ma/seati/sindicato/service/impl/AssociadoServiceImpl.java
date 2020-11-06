package br.gov.ma.seati.sindicato.service.impl;

import java.util.List;

import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import br.gov.ma.seati.sindicato.entity.Associado;
import br.gov.ma.seati.sindicato.entity.Endereco;
import br.gov.ma.seati.sindicato.exception.CustomException;
import br.gov.ma.seati.sindicato.repository.AssociadoRepository;
import br.gov.ma.seati.sindicato.repository.EnderecoRepository;
import br.gov.ma.seati.sindicato.repository.UsuarioRepository;

@Service
public class AssociadoServiceImpl extends GenericServiceImpl<Associado, AssociadoRepository> {

	@Autowired
	private AssociadoRepository associadoRepository;
	
	@Autowired
	private UsuarioRepository usuarioRepository;
	
	@Autowired
	private EnderecoRepository enderecoRepository;

	@Transactional
	public Associado create(Associado associado) {

		if (associado.getId() != null && associadoRepository.existsById(associado.getId()))
			throw new CustomException("ID de associado (" + associado.getId() + ") já utilizado.", HttpStatus.BAD_REQUEST);
		
		if (associadoRepository.existsByCpf(associado.getCpf()))
			throw new CustomException("Já existe associado com esse CPF.", HttpStatus.BAD_REQUEST);
		
		Associado associadoPersistence = associadoRepository.save(associado);
		return associadoPersistence;
	}

	@Transactional
	public Associado update(Associado associado) {

		if (!associadoRepository.existsById(associado.getId()))
			throw new CustomException("Associado não encontrado.", HttpStatus.BAD_REQUEST);
		if (usuarioRepository.existsByUsername(associado.getCpf())) {
			associado.setUsuario(usuarioRepository.findByUsername(associado.getCpf()).get());
		}
		Associado associadoPersistence = associadoRepository.save(associado);
		return associadoPersistence;
	}

	public void delete(Long id) {
		associadoRepository.deleteById(id);
	}
	
	public Page<Associado> findByCpf(int page, String cpf, int size ) {
		Pageable pageable = PageRequest.of(page, size);
		return associadoRepository.findByCpf(pageable, cpf);
	}
	
	public Associado findByCpf(String cpf) {
		return associadoRepository.findByCpf(cpf);
	}
	
	public List<Associado> findByStatus(String status) {
		return associadoRepository.findByStatus(status);
	}


}


package br.gov.ma.seati.sindicato.service.impl;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import br.gov.ma.seati.sindicato.entity.Escola;
import br.gov.ma.seati.sindicato.exception.CustomException;
import br.gov.ma.seati.sindicato.repository.EscolaRepository;

@Service
public class EscolaServiceImpl extends GenericServiceImpl<Escola, EscolaRepository> {

	@Autowired
	private EscolaRepository escolaRepository;

	@Transactional
	public Escola create(Escola escola) {

		if (escola.getId() != null && escolaRepository.existsById(escola.getId()))
			throw new CustomException("ID de associado (" + escola.getId() + ") já utilizado.", HttpStatus.BAD_REQUEST);

		Escola escolaPersisted = escolaRepository.save(escola);
		return escolaPersisted;
	}

	@Transactional
	public Escola update(Escola escola) {

		if (!escolaRepository.existsById(escola.getId()))
			throw new CustomException("Escola não encontrada.", HttpStatus.BAD_REQUEST);

		Escola escolaPersisted = escolaRepository.save(escola);
		return escolaPersisted;
	}

	public void delete(Long id) {
		escolaRepository.deleteById(id);
	}

}

package br.gov.ma.seati.sindicato.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.gov.ma.seati.sindicato.entity.Municipio;
import br.gov.ma.seati.sindicato.repository.MunicipioRepository;


@Service
public class MunicipioServiceImpl extends GenericServiceImpl<Municipio, MunicipioRepository> {
	
	@Autowired
	MunicipioRepository repository;
	
	public List<Municipio> findByEstadoId(Long id) {
		return repository.findByEstadoId(id);
	}
}
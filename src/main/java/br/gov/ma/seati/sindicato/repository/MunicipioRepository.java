package br.gov.ma.seati.sindicato.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import br.gov.ma.seati.sindicato.entity.Municipio;


@SuppressWarnings("unchecked")
public interface MunicipioRepository extends JpaRepository<Municipio, Long>{

	// Necessário para create (POST) e update (PUT)
	boolean existsById(Long id);
	Municipio save(Municipio municipio);

	// Necessário para findById
	Optional<Municipio> findById(Long codigo);

	// // Necessário para findAll por List
	List<Municipio> findAll();

	// Necessário para findAll com paginação.
	Page<Municipio> findAll(Pageable pageable);	
	
	Page<Municipio> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
	
	Page<Municipio> findById(Long id, Pageable pageable);
	
	List<Municipio> findByEstadoId(Long id);
	
}
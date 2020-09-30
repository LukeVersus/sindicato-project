package br.gov.ma.seati.sindicato.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import br.gov.ma.seati.sindicato.entity.Estado;


@SuppressWarnings("unchecked")
public interface EstadoRepository extends JpaRepository<Estado, Long> {

	boolean existsById(Long id);	
	Estado save(Estado estado);
	
	Optional<Estado> findById(Long id);

	List<Estado> findAll();

	Page<Estado> findAll(Pageable pageable);
}

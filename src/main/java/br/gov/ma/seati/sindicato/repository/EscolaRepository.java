package br.gov.ma.seati.sindicato.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import br.gov.ma.seati.sindicato.entity.Escola;

@SuppressWarnings("unchecked")
public interface EscolaRepository extends JpaRepository<Escola, Long> {

	boolean existsById(Long id);

	Escola save(Escola escola);

	Optional<Escola> findById(Long id);

	List<Escola> findAll();

	Page<Escola> findAll(Pageable pageable);

}

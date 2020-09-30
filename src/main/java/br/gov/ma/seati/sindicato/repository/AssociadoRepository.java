package br.gov.ma.seati.sindicato.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.gov.ma.seati.sindicato.entity.Associado;

@SuppressWarnings("unchecked")
public interface AssociadoRepository extends JpaRepository<Associado, Long>{
	
	boolean existsById(Long id);
	boolean existsByCpf(String cpf);
	Associado save(Associado associado);
	
	Optional<Associado> findById(Long id);

	List<Associado> findAll();

	Page<Associado> findAll(Pageable pageable);
	
	@Query()
	Page<Associado> findByCpf(Pageable pageable, String cpf);
	
	Associado findByCpf(String cpf);
}

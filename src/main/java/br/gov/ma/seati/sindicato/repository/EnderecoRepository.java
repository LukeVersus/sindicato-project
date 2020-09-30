package br.gov.ma.seati.sindicato.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import br.gov.ma.seati.sindicato.entity.Endereco;

@SuppressWarnings("unchecked")
public interface EnderecoRepository extends JpaRepository<Endereco, Long>{
	
	boolean existsById(Long id);	
	Endereco save(Endereco endereco);
	
	Optional<Endereco> findById(Long id);

	List<Endereco> findAll();

	Page<Endereco> findAll(Pageable pageable);
	
	Endereco findTopByOrderByIdDesc();

}

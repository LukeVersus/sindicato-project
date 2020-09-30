package br.gov.ma.seati.sindicato.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import br.gov.ma.seati.sindicato.entity.Usuario;


@SuppressWarnings("unchecked")
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
	
    Optional<Usuario> findByUsername(String cpfCnpj);
    
    Page<Usuario> findByNomeContainingIgnoreCaseOrderByNomeAsc(String nome, Pageable pageable);
    
    boolean existsById(Long id);
    
    boolean existsByUsername(String username);

	Usuario save(Usuario usuario);

	Optional<Usuario> findById(Long id);

	List<Usuario> findAll();

	Page<Usuario> findAll(Pageable pageable);

}

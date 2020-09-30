package br.gov.ma.seati.sindicato.resource;

import java.lang.reflect.ParameterizedType;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import br.gov.ma.seati.sindicato.dto.Response;
import br.gov.ma.seati.sindicato.service.impl.GenericServiceImpl;

@SuppressWarnings({ "unchecked", "rawtypes" })
public abstract class GenericResource<E, S extends GenericServiceImpl> {
	
	@Autowired
	private S service;
	
	private Class<E> entity = (Class<E>)((ParameterizedType)this.getClass().getGenericSuperclass()).getActualTypeArguments()[0];
	
	@PostMapping
	public ResponseEntity<Response<E>> create(
			@RequestBody E entidade, 
			BindingResult result,
			@RequestHeader(name = "Authorization", required=false) String authorization) {
		Response<E> response = new Response<>();
//		if(entity.isAnnotationPresent(DadosEntidade.class))
//			response.setData((E) service.create(entidade, entity.getAnnotation(DadosEntidade.class).id()));
//		else
			response.setData((E) service.create(entidade, "id"));
		return ResponseEntity.ok(response);
	}
	
	@PutMapping
	public ResponseEntity<Response<E>> update(
			@RequestBody E entidade, 
			BindingResult result,
			@RequestHeader(name = "Authorization", required=false) String authorization) {
		Response<E> response = new Response<>(); 
		response.setData((E) service.update(entidade));
		return ResponseEntity.ok(response);
	}
	
	@GetMapping(value = "{id}")
	public ResponseEntity<Response<E>> findById(
			@PathVariable("id") Long id,
			@RequestHeader(name = "Authorization", required=false) String authorization) {
		Response<E> response = new Response<>();
		response.setData((E) service.findById(id));
		return ResponseEntity.ok(response);
	}
	
	@GetMapping
    public ResponseEntity<Response<List<E>>> findAll(
			@RequestHeader(name = "Authorization", required=false) String authorization){		
		Response<List<E>> response = new Response<>();
		response.setData(service.findByAll().subList(0,99));
    	return ResponseEntity.ok(response);    	
    }
	
	@GetMapping(value="{page}/{size}")
    public ResponseEntity<Response<Page<E>>> findAll(
			@PathVariable int page, 
			@PathVariable int size,
			@RequestParam(value="sort", required=false, defaultValue = "id!asc") List<String> sort,
			@RequestHeader(name = "Authorization", required=false) String authorization){		
		Response<Page<E>> response = new Response<>();
		response.setData(service.findByAll(page, size, sort));
		System.out.println(response.getData().getSize());
    	return ResponseEntity.ok(response);    	
    }
	
	/* Dá erro quando a entidade não possui o atributo 'nome' mesmo que o endpoint não esteja no repository.
	 * @GetMapping(value="nome/{page}/{size}") public
	 * ResponseEntity<Response<Page<E>>> findByNome(
	 * 
	 * @PathVariable int page,
	 * 
	 * @PathVariable int size,
	 * 
	 * @RequestParam(value="sort", required=false, defaultValue = "nome!asc")
	 * List<String> sort,
	 * 
	 * @RequestParam(name="nome", required = false, defaultValue = "") String nome,
	 * 
	 * @RequestHeader(name = "Authorization", required=false) String authorization)
	 * { Response<Page<E>> response = new Response<>();
	 * response.setData(service.findByCampo(page, size, sort, "nome", nome, true,
	 * true)); return ResponseEntity.ok(response); }
	 */
}
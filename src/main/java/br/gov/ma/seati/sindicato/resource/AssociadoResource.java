package br.gov.ma.seati.sindicato.resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.gov.ma.seati.sindicato.dto.Response;
import br.gov.ma.seati.sindicato.entity.Associado;
import br.gov.ma.seati.sindicato.service.impl.AssociadoServiceImpl;

@RestController
@RequestMapping("/api/associado")
@CrossOrigin(origins = "*")
public class AssociadoResource extends GenericResource<Associado, AssociadoServiceImpl> {

	@Autowired
	private AssociadoServiceImpl associadoService;

	@PostMapping
	public ResponseEntity<Response<Associado>> create(@RequestBody Associado associado, BindingResult result,
			@RequestHeader(name = "Authorization", required = false) String token) {
		Response<Associado> response = new Response<>();

		try {
			response.setData(associadoService.create(associado));
		} catch (Exception e) {
			response.getErrors().add(e.getMessage());
			return ResponseEntity.badRequest().body(response);
		}

		return ResponseEntity.ok(response);
	}

	@PutMapping
	public ResponseEntity<Response<Associado>> update(@RequestBody Associado associado, BindingResult result,
			@RequestHeader(name = "Authorization", required = false) String token) {
		Response<Associado> response = new Response<>();
		response.setData(associadoService.update(associado));
		return ResponseEntity.ok(response);
	}

	@DeleteMapping(value = "{id}")
	public ResponseEntity<Response<String>> delete(@PathVariable Long id,
			@RequestHeader(name = "Authorization", required = false) String token) {

		Response<String> response = new Response<>();

		try {
			associadoService.delete(id);
		} catch (Exception e) {
			response.getErrors().add(e.getMessage());
			return ResponseEntity.badRequest().body(response);
		}

		return ResponseEntity.ok(response);
	}
	
	@GetMapping(value = "cpf/{cpf}/{page}/{size}")
	public ResponseEntity<Response<Page<Associado>>> buscaCandidato(
			@PathVariable String cpf,
			@PathVariable int page, 
			@PathVariable int size,
			@RequestHeader(name = "Authorization", required = false) String token) {
		Response<Page<Associado>> response = new Response<>();
		response.setData(associadoService.findByCpf(page, size, cpf));
		return ResponseEntity.ok(response);
		
	}
	
	@GetMapping(value = "cpf/{cpf}")
	public ResponseEntity<Response<Associado>> findCpf(
			@PathVariable String cpf,
			@RequestHeader(name = "Authorization", required = false) String token) {
		Response<Associado> response = new Response<>();
		response.setData(associadoService.findByCpf(cpf));
		return ResponseEntity.ok(response);
	}


}


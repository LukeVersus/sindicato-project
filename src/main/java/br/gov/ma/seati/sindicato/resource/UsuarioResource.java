package br.gov.ma.seati.sindicato.resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.gov.ma.seati.sindicato.dto.Response;
import br.gov.ma.seati.sindicato.entity.Usuario;
import br.gov.ma.seati.sindicato.service.impl.UsuarioServiceImpl;

@RestController
@RequestMapping("/api/usuario")
@CrossOrigin(origins = "*")
public class UsuarioResource extends GenericResource<Usuario, UsuarioServiceImpl> {

	@Autowired
	private UsuarioServiceImpl service;

	@PostMapping
	public ResponseEntity<Response<Usuario>> create(@RequestBody Usuario entidade, BindingResult result,
			@RequestHeader(name = "Authorization", required = false) String authorization) {
		Response<Usuario> response = new Response<>();
		response.setData(service.create(entidade));
		return ResponseEntity.ok(response);
	}

	@DeleteMapping(value = "{id}")
	public ResponseEntity<Response<String>> delete(@PathVariable Long id,
			@RequestHeader(name = "Authorization", required = false) String token) {

		Response<String> response = new Response<>();

		try {
			service.delete(id);
		} catch (Exception e) {
			response.getErrors().add(e.getMessage());
			return ResponseEntity.badRequest().body(response);
		}

		return ResponseEntity.ok(response);
	}
}

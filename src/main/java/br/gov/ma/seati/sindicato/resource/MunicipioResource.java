package br.gov.ma.seati.sindicato.resource;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.gov.ma.seati.sindicato.dto.Response;
import br.gov.ma.seati.sindicato.entity.Municipio;
import br.gov.ma.seati.sindicato.service.impl.MunicipioServiceImpl;


@RestController
@RequestMapping("/api/municipio")
@CrossOrigin(origins = "*")
public class MunicipioResource extends GenericResource<Municipio, MunicipioServiceImpl> {
	
	@Autowired
	private MunicipioServiceImpl service;
	
//	@Override
//	@PostMapping
//	public ResponseEntity<Response<Municipio>> create(
//			@RequestBody Municipio entidade, 
//			BindingResult result,
//			@RequestHeader(name = "Authorization", required=false) String authorization) {
//		Response<Municipio> response = new Response<>();
//		response.setData((Municipio) service.create(entidade, "codigo"));
//		return ResponseEntity.ok(response);
//	}
	
	@Override
	@GetMapping(value = "{id}")
	public ResponseEntity<Response<Municipio>> findById(
			@PathVariable("id") Long id,
			@RequestHeader(name = "Authorization", required=false) String authorization) {
		Response<Municipio> response = new Response<>(); 
		response.setData((Municipio) service.findById(id));
		return ResponseEntity.ok(response);
	}
	
	@GetMapping(value="estado/{id}")
	public ResponseEntity<Response<List<Municipio>>> findByEstadoId(
			@PathVariable Long id,
			@RequestHeader(name = "Authorization", required=false) String authorization) {
		Response<List<Municipio>> response = new Response<>();
		response.setData(service.findByEstadoId(id));
		return ResponseEntity.ok(response);
	}	
}
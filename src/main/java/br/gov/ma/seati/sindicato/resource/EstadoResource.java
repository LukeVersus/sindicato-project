package br.gov.ma.seati.sindicato.resource;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.gov.ma.seati.sindicato.entity.Estado;
import br.gov.ma.seati.sindicato.service.impl.EstadoServiceImpl;

@RestController
@RequestMapping("/api/estado")
@CrossOrigin(origins = "*")
public class EstadoResource extends GenericResource<Estado, EstadoServiceImpl> {
}
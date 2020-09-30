package br.gov.ma.seati.sindicato.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.gov.ma.seati.sindicato.entity.JwtToken;

public interface JwtTokenRepository extends JpaRepository<JwtToken, String> {

}

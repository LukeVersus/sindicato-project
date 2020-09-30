package br.gov.ma.seati.sindicato;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.gov.ma.seati.sindicato.entity.Usuario;
import br.gov.ma.seati.sindicato.enums.NivelEnum;
import br.gov.ma.seati.sindicato.repository.UsuarioRepository;

@SpringBootApplication
public class SindicatoApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SindicatoApiApplication.class, args);
	}

	@Bean
	CommandLineRunner init(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			iniciarUsuario(usuarioRepository, passwordEncoder);
		};
	}

	public void iniciarUsuario(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
		List<Usuario> usuarios = repository.findAll();

		if (usuarios.isEmpty()) {
			List<NivelEnum> niveis = new ArrayList<>();
			niveis.add(NivelEnum.ADMIN);
			Usuario usuario = new Usuario();
			usuario.setNome("Administrador");
			usuario.setUsername("admin");
			usuario.setPassword(passwordEncoder.encode("@dm1n1str@dor"));
			usuario.setEmail("egma@seati.ma.gov.br");
			usuario.setAtivo(true);
			usuario.setBloqueado(false);
			usuario.setExpirado(false);
			usuario.setHabilitado(true);
			usuario.setNiveis(niveis);
			repository.save(usuario);
		}
	}
	
	@Bean
	public JavaMailSender getJavaMailSender() {
	    JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
	    mailSender.setHost("email.ma.gov.br");
	    mailSender.setPort(587);
	     
	    mailSender.setUsername("naoresponda@seati.ma.gov.br");
	    mailSender.setPassword("edsdf243rfsdfsd");
	     
	    Properties props = mailSender.getJavaMailProperties();
	    props.put("mail.transport.protocol", "smtp");
	    props.put("mail.smtp.auth", "true");
	    props.put("mail.smtp.starttls.enable", "true");
	    props.put("mail.debug", "true");
	     
	    return mailSender;
	}
	 
}

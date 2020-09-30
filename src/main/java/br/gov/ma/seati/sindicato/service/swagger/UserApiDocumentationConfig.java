package br.gov.ma.seati.sindicato.service.swagger;

import io.swagger.annotations.Contact;
import io.swagger.annotations.Info;
import io.swagger.annotations.License;
import io.swagger.annotations.SwaggerDefinition;

@SwaggerDefinition(
		info = @Info(
				description = "API Serviço cadastro de associados do Sinproesemma",
				version = "V0.0.1-SNAPSHOP",
				title = "API Sinproesemma",
				contact = @Contact(
						name = "Seati",
						email = "atendimento@Sinproesemma.ma.gov.br",
						url = "http://www.Sinproesemma.ma.gov.br"),
				license = @License(
						name = "Apache 2.0",
						url = "http://www.apache.org/licenses/LICENSE-2.0")),
		consumes = {"application/json"},
		produces = {"application/json"},
		schemes = {SwaggerDefinition.Scheme.HTTP, SwaggerDefinition.Scheme.HTTPS}
)
public interface UserApiDocumentationConfig {

}

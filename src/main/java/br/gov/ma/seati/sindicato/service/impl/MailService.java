package br.gov.ma.seati.sindicato.service.impl;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import br.gov.ma.seati.sindicato.config.MailConfig;

@Component
public class MailService{
	
	@Autowired
    private JavaMailSender mailSender;
	
	@Autowired
    private MailConfig mailConfig;
	
	public static final String URL_PARAMETER_ACCESS_TOKEN = "access-token";

	
    public Boolean enviar(String destino, String mensagem, String subject) {
    	System.out.println(destino);
		
            	
    	MimeMessage mime = mailSender.createMimeMessage();
    		
    	MimeMessageHelper helper;
		try {
			
			helper = new MimeMessageHelper(mime, true, "utf-8");

	    	String emailHTML = 
		            "<!DOCTYPE html> "+
		            "<html> " +
					"<head> " +
		            "   <title>SELO</title>   "+
		            "	<style>" +
					"		a { color: #00F; text-decoration: none; }" +
					"		a:visited { color: #80F; text-decoration: none; }" +
					"		a:hover { color: #08F; text-decoration: underline; }" +
					"	</style>" +
		            "</head>" +
		            "<body> " + 
					"	<p> " + 
					"		" + mensagem + "<br/>" + 
	    			"	</p>" + 
					"<body> " +
					"</html>";
	        		
	    	helper.setFrom(mailConfig.getUsername());
	    	helper.setTo(destino);
	    	helper.setSubject(subject);
	    	helper.setText(emailHTML,true);		
	       
	    	
	        mailSender.send(mime);
	    		        
	        return true;
		} catch (MessagingException e) {
			e.printStackTrace();
            return false;
		}

    }
    
}

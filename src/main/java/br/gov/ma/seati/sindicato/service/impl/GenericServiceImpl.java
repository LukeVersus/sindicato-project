package br.gov.ma.seati.sindicato.service.impl;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import br.gov.ma.seati.sindicato.exception.CustomException;

@Service
@SuppressWarnings({"unchecked", "rawtypes"})
public abstract class GenericServiceImpl<E,R>{
	
	@Autowired
	private R repository;

	@Transactional
	public E create(E entidade, String campoNome) {
		String nomeDoMetodo = "get".concat(StringUtils.capitalize(campoNome));
		Object id = this.invocarMetodo(nomeDoMetodo, entidade);
		nomeDoMetodo = "existsBy".concat(StringUtils.capitalize(campoNome));
		if(id != null && (boolean) this.invocarMetodo(nomeDoMetodo, repository, id.getClass(), id))
			throw new CustomException("ID (" + id + ") já utilizado.", HttpStatus.BAD_REQUEST);
		return (E) this.invocarMetodo("save", repository, entidade.getClass(), entidade);
	}
	
	@Transactional
	public E update(E entidade) {
		Long id = (Long) this.invocarMetodo("getId", entidade);
		if(id == null)
			throw new CustomException("ID não informado.", HttpStatus.BAD_REQUEST);
		if(!(boolean) this.invocarMetodo("existsById", repository, Long.class, id))
			throw new CustomException("Não encontrado.", HttpStatus.BAD_REQUEST);
		return (E) this.invocarMetodo("save", repository, entidade.getClass(), entidade);
	}
	
	@Transactional
	public E findById(Long id) {
		
		Class<E> classe = ((Class<E>) ((ParameterizedType) this.getClass().getGenericSuperclass()).getActualTypeArguments()[0]);
		
		String identificador;
//		if (classe.isAnnotationPresent(DadosEntidade.class))
//			identificador = StringUtils.capitalize(classe.getAnnotation(DadosEntidade.class).id());
//		else
			identificador = "Id";
				
		Optional<E> opt = (Optional<E>) this.invocarMetodo("findBy".concat(identificador), repository, Long.class, id);
		if (opt.isPresent())
			return opt.get();
		else throw new CustomException(classe.getSimpleName() + " não encontrado(a)", HttpStatus.ACCEPTED);

	}

	@Transactional
	public E findByCampo(String campoNome, Object campoValor, boolean ignoreCase) {	
		String nomeDoMetodo = "findBy".concat(StringUtils.capitalize(campoNome));
		if(ignoreCase)
			nomeDoMetodo = nomeDoMetodo + "IgnoreCase";
		Optional<E> opt = (Optional<E>) this.invocarMetodo(nomeDoMetodo, repository, campoValor.getClass(), campoValor);
		if(opt.isPresent())
			return opt.get();
		else
			throw new CustomException("Não encontrado", HttpStatus.ACCEPTED);
	}

	@Transactional
	public Page<E> findByCampo(int page, int size, List<String> sort, String campoNome, Object campoValor,
			boolean containing, boolean ignoreCase) {
		String nomeDoMetodo = "findBy".concat(StringUtils.capitalize(campoNome));
		if(containing)
			nomeDoMetodo = nomeDoMetodo + "Containing";
		if(ignoreCase)
			nomeDoMetodo = nomeDoMetodo + "IgnoreCase";
		
		List<Sort.Order> orders = new ArrayList<>();
		for (String order: sort) {
            String[] orderSplit = order.split("!");
            String property = orderSplit[0];
            
            if (orderSplit.length == 1) {
                orders.add(new Sort.Order(Direction.ASC, property));
            } else {
                Sort.Direction direction
                        = Sort.Direction.fromString(orderSplit[1]);
                orders.add(new Sort.Order(direction, property));
            }
        }
		Pageable pageable = PageRequest.of(page, size, Sort.by(orders));

		Class[] parametrosTipo = new Class[2];
		Object[] parametrosValor = new Object[2];
		parametrosTipo[0] = campoValor.getClass();
		parametrosValor[0] = campoValor;
		parametrosTipo[1] = Pageable.class;
		parametrosValor[1] = pageable;

		return (Page<E>) this.invocarMetodo(nomeDoMetodo, repository, parametrosTipo, parametrosValor);
	}
	
	@Transactional
	public List<E> findByAll() {
		return (List<E>) this.invocarMetodo("findAll", repository);
	}
	
	@Transactional
	public Page<E> findByAll(int page, int size, List<String> sort) {
		List<Sort.Order> orders = new ArrayList<>();
		for (String order: sort) {
            String[] orderSplit = order.split("!");
            String property = orderSplit[0];
            
            if (orderSplit.length == 1) {
                orders.add(new Sort.Order(Direction.ASC, property));
            } else {
                Sort.Direction direction
                        = Sort.Direction.fromString(orderSplit[1]);
                orders.add(new Sort.Order(direction, property));
            }
        }
		Pageable pageable = PageRequest.of(page, size, Sort.by(orders));
		return (Page<E>) this.invocarMetodo("findAll", repository, Pageable.class, pageable);
	}
	
	public Object invocarMetodo (String nomeDoMetodo, Object objeto) {
		try {
			return objeto.getClass().getMethod(nomeDoMetodo).invoke(objeto);
		} catch (NoSuchMethodException e) {
			throw new CustomException(e.getMessage(), HttpStatus.NOT_FOUND);
		} catch (SecurityException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
		} catch (InvocationTargetException e) {
			if(e.getCause() instanceof PropertyReferenceException) {
				PropertyReferenceException propertyReferenceException = (PropertyReferenceException) e.getCause();
				String entidade = propertyReferenceException.getType().toString();
				entidade = entidade.substring(entidade.lastIndexOf(".") + 1);
		        String msg = "O campo '" + propertyReferenceException.getPropertyName()
		        	+ "' não existe na entidade " + entidade + ".";
		        throw new CustomException(msg, HttpStatus.BAD_REQUEST);
			} else e.printStackTrace();
		}
		return null;
	}
	
	public Object invocarMetodo (String nomeDoMetodo, Object objeto, Class parametroTipo, Object parametroValor) {
		try {
			return objeto.getClass().getMethod(nomeDoMetodo, parametroTipo).invoke(objeto, parametroValor);
		} catch (NoSuchMethodException e) {
			throw new CustomException(e.getMessage(), HttpStatus.NOT_FOUND);
		} catch (SecurityException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
		} catch (InvocationTargetException e) {
			if(e.getCause() instanceof PropertyReferenceException) {
				PropertyReferenceException propertyReferenceException = (PropertyReferenceException) e.getCause();
				String entidade = propertyReferenceException.getType().toString();
				entidade = entidade.substring(entidade.lastIndexOf(".") + 1);
		        String msg = "O campo '" + propertyReferenceException.getPropertyName()
		        	+ "' não existe na entidade " + entidade + ".";
		        throw new CustomException(msg, HttpStatus.BAD_REQUEST);
			} else e.printStackTrace();
		}
		return null;
	}
	
	public Object invocarMetodo (String nomeDoMetodo, Object objeto, Class[] parametrosTipo, Object[] parametrosValor) {
		try {
			if(parametrosTipo == null)
				return objeto.getClass().getMethod(nomeDoMetodo).invoke(objeto, parametrosValor);
			else
				return objeto.getClass().getMethod(nomeDoMetodo, parametrosTipo).invoke(objeto, parametrosValor);
		} catch (NoSuchMethodException e) {
			throw new CustomException(e.getMessage(), HttpStatus.NOT_FOUND);
		} catch (SecurityException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
		} catch (InvocationTargetException e) {
			if(e.getCause() instanceof PropertyReferenceException) {
				PropertyReferenceException propertyReferenceException = (PropertyReferenceException) e.getCause();
				String entidade = propertyReferenceException.getType().toString();
				entidade = entidade.substring(entidade.lastIndexOf(".") + 1);
		        String msg = "O campo '" + propertyReferenceException.getPropertyName()
		        	+ "' não existe na entidade " + entidade + ".";
		        throw new CustomException(msg, HttpStatus.BAD_REQUEST);
			} else e.printStackTrace();
		}
		return null;
	}
}
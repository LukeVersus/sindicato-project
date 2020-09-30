package br.gov.ma.seati.sindicato.entity;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@JsonDeserialize(as = PostgresUserDetails.class)
public class PostgresUserDetails implements UserDetails {

	private static final long serialVersionUID = 1L;
	
	private String username;
    private String password;
    private Boolean active;
    private boolean isLocked;
    private boolean isExpired;
    private boolean isEnabled;
    private List<GrantedAuthority> grantedAuthorities;

    public PostgresUserDetails(String username, String password, Boolean active, boolean isLocked, boolean isExpired, boolean isEnabled, String [] authorities) {
        this.username = username;
        this.password = password;
        this.active = active;
        this.isLocked = isLocked;
        this.isExpired = isExpired;
        this.isEnabled = isEnabled;
        this.grantedAuthorities = AuthorityUtils.createAuthorityList(authorities);
    }

    public PostgresUserDetails(String username,  String [] authorities) {
        this.username = username;
        this.grantedAuthorities = AuthorityUtils.createAuthorityList(authorities);
    }

    public PostgresUserDetails() {
        super();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return grantedAuthorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return active;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return !isExpired;
    }

    @Override
    public boolean isEnabled() {
        return isEnabled;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}

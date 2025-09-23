package org.jakub.backendapi.dto;

import org.jakub.backendapi.entities.Enums.Role;

import java.util.Objects;

public class UserDto {

    private String email;
    private Long id;
    private Role role;
    private String token;

    public UserDto() {
    }

    public UserDto(String email, Long id, Role role, String token) {
        this.email = email;
        this.id = id;
        this.role = role;
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDto userDto = (UserDto) o;
        return Objects.equals(email, userDto.email) && Objects.equals(id, userDto.id) && role == userDto.role && Objects.equals(token, userDto.token);
    }

    @Override
    public int hashCode() {
        return Objects.hash(email, id, role, token);
    }

    @Override
    public String toString() {
        return "UserDto{" +
                "email='" + email + '\'' +
                ", id=" + id +
                ", role=" + role +
                ", token='" + token + '\'' +
                '}';
    }
}

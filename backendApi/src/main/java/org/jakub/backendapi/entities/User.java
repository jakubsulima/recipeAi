package org.jakub.backendapi.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import org.jakub.backendapi.entities.Enums.Role;

import java.util.List;
import java.util.Objects;


@Entity
@Table(name = "app_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true) // Added unique = true
    @Email(message = "Email should be valid")
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recipe> recipes;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserPreferences userPreferences;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FridgeIngredient> fridgeIngredients;

    public User() {
    }

    public User(Long id, String email, String password, Role role, List<Recipe> recipes, UserPreferences userPreferences, List<FridgeIngredient> fridgeIngredients) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.recipes = recipes;
        this.userPreferences = userPreferences;
        this.fridgeIngredients = fridgeIngredients;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public List<Recipe> getRecipes() {
        return recipes;
    }

    public void setRecipes(List<Recipe> recipes) {
        this.recipes = recipes;
    }

    public UserPreferences getUserPreferences() {
        return userPreferences;
    }

    public void setUserPreferences(UserPreferences userPreferences) {
        this.userPreferences = userPreferences;
    }

    public List<FridgeIngredient> getFridgeIngredients() {
        return fridgeIngredients;
    }

    public void setFridgeIngredients(List<FridgeIngredient> fridgeIngredients) {
        this.fridgeIngredients = fridgeIngredients;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id) && Objects.equals(email, user.email) && Objects.equals(password, user.password) && role == user.role && Objects.equals(recipes, user.recipes) && Objects.equals(userPreferences, user.userPreferences) && Objects.equals(fridgeIngredients, user.fridgeIngredients);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email, password, role, recipes, userPreferences, fridgeIngredients);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", role=" + role +
                ", recipes=" + recipes +
                ", userPreferences=" + userPreferences +
                ", fridgeIngredients=" + fridgeIngredients +
                '}';
    }
}

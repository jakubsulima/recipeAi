package org.jakub.backendapi.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "recipe")
public class Recipe {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeIngredient> recipeIngredients = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String description;

    public Recipe() {
    }

    public Recipe(Long id, String name, List<RecipeIngredient> recipeIngredients, User user, String description) {
        this.id = id;
        this.name = name;
        this.recipeIngredients = recipeIngredients;
        this.user = user;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<RecipeIngredient> getRecipeIngredients() {
        return recipeIngredients;
    }

    public void setRecipeIngredients(List<RecipeIngredient> recipeIngredients) {
        this.recipeIngredients = recipeIngredients;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Recipe recipe = (Recipe) o;
        return Objects.equals(id, recipe.id) && Objects.equals(name, recipe.name) && Objects.equals(recipeIngredients, recipe.recipeIngredients) && Objects.equals(user, recipe.user) && Objects.equals(description, recipe.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, recipeIngredients, user, description);
    }

    @Override
    public String toString() {
        return "Recipe{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", recipeIngredients=" + recipeIngredients +
                ", user=" + user +
                ", description='" + description + '\'' +
                '}';
    }
}

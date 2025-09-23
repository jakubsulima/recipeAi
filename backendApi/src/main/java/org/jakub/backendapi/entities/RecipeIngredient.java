package org.jakub.backendapi.entities;


import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "recipe_ingredient")
public class RecipeIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @ManyToOne(optional = false)
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    @Column(nullable = false)
    private double amount;

    @Column(nullable = false)
    private String unit;

    public RecipeIngredient() {
    }

    public RecipeIngredient(Long id, Recipe recipe, Ingredient ingredient, double amount, String unit) {
        this.id = id;
        this.recipe = recipe;
        this.ingredient = ingredient;
        this.amount = amount;
        this.unit = unit;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public Ingredient getIngredient() {
        return ingredient;
    }

    public void setIngredient(Ingredient ingredient) {
        this.ingredient = ingredient;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RecipeIngredient that = (RecipeIngredient) o;
        return Double.compare(that.amount, amount) == 0 && Objects.equals(id, that.id) && Objects.equals(recipe, that.recipe) && Objects.equals(ingredient, that.ingredient) && Objects.equals(unit, that.unit);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, recipe, ingredient, amount, unit);
    }

    @Override
    public String toString() {
        return "RecipeIngredient{" +
                "id=" + id +
                ", recipe=" + recipe +
                ", ingredient=" + ingredient +
                ", amount=" + amount +
                ", unit='" + unit + '\'' +
                '}';
    }
}

package org.jakub.backendapi.entities;

import jakarta.persistence.*;
import org.jakub.backendapi.entities.Enums.Diet;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "diet")
    private Diet diet;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_diets", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "diet")
    @Enumerated(EnumType.STRING)
    private List<Diet> diets = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "disliked_ingredients", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "ingredient")
    private List<String> dislikedIngredients;

    public UserPreferences() {
    }

    public UserPreferences(Long id, User user, Diet diet, List<Diet> diets, List<String> dislikedIngredients) {
        this.id = id;
        this.user = user;
        this.diet = diet;
        this.diets = diets;
        this.dislikedIngredients = dislikedIngredients;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Diet getDiet() {
        if (diet == null) {
            return deriveSummaryDiet(diets);
        }
        return diet;
    }

    public void setDiet(Diet diet) {
        this.diet = diet == null ? Diet.NONE : diet;
        if (this.diets == null || this.diets.isEmpty()) {
            this.diets = new ArrayList<>(List.of(this.diet));
        }
    }

    public List<Diet> getDiets() {
        if (diets == null || diets.isEmpty()) {
            Diet fallback = getDiet();
            return new ArrayList<>(List.of(fallback == null ? Diet.NONE : fallback));
        }
        return diets;
    }

    public void setDiets(List<Diet> diets) {
        if (diets == null || diets.isEmpty()) {
            this.diets = new ArrayList<>(List.of(Diet.NONE));
            this.diet = Diet.NONE;
            return;
        }

        List<Diet> sanitized = new ArrayList<>(new LinkedHashSet<>(
                diets.stream().map(value -> value == null ? Diet.NONE : value).toList()
        ));

        if (sanitized.contains(Diet.NONE) && sanitized.size() > 1) {
            sanitized = new ArrayList<>(List.of(Diet.NONE));
        }

        this.diets = sanitized;
        this.diet = deriveSummaryDiet(sanitized);
    }

    public List<String> getDislikedIngredients() {
        return dislikedIngredients;
    }

    public void setDislikedIngredients(List<String> dislikedIngredients) {
        this.dislikedIngredients = dislikedIngredients;
    }

    private Diet deriveSummaryDiet(List<Diet> diets) {
        if (diets == null || diets.isEmpty()) {
            return Diet.NONE;
        }

        if (diets.size() == 1) {
            return diets.get(0);
        }

        return Diet.OTHER;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserPreferences that = (UserPreferences) o;
        return Objects.equals(id, that.id)
                && Objects.equals(user, that.user)
                && getDiet() == that.getDiet()
                && Objects.equals(getDiets(), that.getDiets())
                && Objects.equals(dislikedIngredients, that.dislikedIngredients);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, user, getDiet(), getDiets(), dislikedIngredients);
    }

    @Override
    public String toString() {
        return "UserPreferences{" +
                "id=" + id +
                ", user=" + user +
                ", diet=" + diet +
                ", diets=" + diets +
                ", dislikedIngredients=" + dislikedIngredients +
                '}';
    }
}

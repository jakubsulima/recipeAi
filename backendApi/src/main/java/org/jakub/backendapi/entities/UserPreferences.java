package org.jakub.backendapi.entities;

import jakarta.persistence.*;
import org.jakub.backendapi.entities.Enums.Diet;

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

    @ElementCollection
    @CollectionTable(name = "disliked_ingredients", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "ingredient")
    private List<String> dislikedIngredients;

    public UserPreferences() {
    }

    public UserPreferences(Long id, User user, Diet diet, List<String> dislikedIngredients) {
        this.id = id;
        this.user = user;
        this.diet = diet;
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
        return diet;
    }

    public void setDiet(Diet diet) {
        this.diet = diet;
    }

    public List<String> getDislikedIngredients() {
        return dislikedIngredients;
    }

    public void setDislikedIngredients(List<String> dislikedIngredients) {
        this.dislikedIngredients = dislikedIngredients;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserPreferences that = (UserPreferences) o;
        return Objects.equals(id, that.id) && Objects.equals(user, that.user) && diet == that.diet && Objects.equals(dislikedIngredients, that.dislikedIngredients);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, user, diet, dislikedIngredients);
    }

    @Override
    public String toString() {
        return "UserPreferences{" +
                "id=" + id +
                ", user=" + user +
                ", diet=" + diet +
                ", dislikedIngredients=" + dislikedIngredients +
                '}';
    }
}

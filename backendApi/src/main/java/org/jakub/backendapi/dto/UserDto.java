package org.jakub.backendapi.dto;

import org.jakub.backendapi.entities.Enums.Role;
import org.jakub.backendapi.entities.Enums.SubscriptionPlan;

import java.util.Objects;

public class UserDto {

    private String email;
    private Long id;
    private Role role;
    private String token;
    private SubscriptionPlan subscriptionPlan;
    private Integer recipeCreationLimit;
    private Long recipesCreated;
    private Integer recipesRemaining;
    private Boolean recipeCreationLimitReached;

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

    public SubscriptionPlan getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(SubscriptionPlan subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }

    public Integer getRecipeCreationLimit() {
        return recipeCreationLimit;
    }

    public void setRecipeCreationLimit(Integer recipeCreationLimit) {
        this.recipeCreationLimit = recipeCreationLimit;
    }

    public Long getRecipesCreated() {
        return recipesCreated;
    }

    public void setRecipesCreated(Long recipesCreated) {
        this.recipesCreated = recipesCreated;
    }

    public Integer getRecipesRemaining() {
        return recipesRemaining;
    }

    public void setRecipesRemaining(Integer recipesRemaining) {
        this.recipesRemaining = recipesRemaining;
    }

    public Boolean getRecipeCreationLimitReached() {
        return recipeCreationLimitReached;
    }

    public void setRecipeCreationLimitReached(Boolean recipeCreationLimitReached) {
        this.recipeCreationLimitReached = recipeCreationLimitReached;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDto userDto = (UserDto) o;
        return Objects.equals(email, userDto.email)
            && Objects.equals(id, userDto.id)
            && role == userDto.role
            && Objects.equals(token, userDto.token)
            && subscriptionPlan == userDto.subscriptionPlan
            && Objects.equals(recipeCreationLimit, userDto.recipeCreationLimit)
            && Objects.equals(recipesCreated, userDto.recipesCreated)
            && Objects.equals(recipesRemaining, userDto.recipesRemaining)
            && Objects.equals(recipeCreationLimitReached, userDto.recipeCreationLimitReached);
    }

    @Override
    public int hashCode() {
        return Objects.hash(email, id, role, token, subscriptionPlan, recipeCreationLimit, recipesCreated, recipesRemaining, recipeCreationLimitReached);
    }

    @Override
    public String toString() {
        return "UserDto{" +
                "email='" + email + '\'' +
                ", id=" + id +
                ", role=" + role +
                ", token='" + token + '\'' +
                ", subscriptionPlan=" + subscriptionPlan +
                ", recipeCreationLimit=" + recipeCreationLimit +
                ", recipesCreated=" + recipesCreated +
                ", recipesRemaining=" + recipesRemaining +
                ", recipeCreationLimitReached=" + recipeCreationLimitReached +
                '}';
    }
}

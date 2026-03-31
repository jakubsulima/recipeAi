package org.jakub.backendapi.services;

import org.jakub.backendapi.entities.Enums.Role;
import org.jakub.backendapi.entities.Enums.SubscriptionPlan;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.exceptions.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RecipePlanLimitService {

    private static final int UNLIMITED_LIMIT = -1;

    private final int freePlanRecipeLimit;
    private final int paidPlanRecipeLimit;

    public RecipePlanLimitService(
            @Value("${app.limits.recipes.free}") int freePlanRecipeLimit,
            @Value("${app.limits.recipes.paid}") int paidPlanRecipeLimit
    ) {
        validateConfig(freePlanRecipeLimit, paidPlanRecipeLimit);
        this.freePlanRecipeLimit = freePlanRecipeLimit;
        this.paidPlanRecipeLimit = paidPlanRecipeLimit;
    }

    public int resolveRecipeLimit(User user) {
        if (user.getRole() == Role.ADMIN) {
            return UNLIMITED_LIMIT;
        }

        SubscriptionPlan plan = user.getSubscriptionPlan() == null
                ? SubscriptionPlan.FREE
                : user.getSubscriptionPlan();

        return plan == SubscriptionPlan.PAID ? paidPlanRecipeLimit : freePlanRecipeLimit;
    }

    public void assertCanCreateRecipe(User user, long recipesCreated) {
        int limit = resolveRecipeLimit(user);
        if (isUnlimited(limit)) {
            return;
        }

        if (recipesCreated >= limit) {
            throw new AppException(
                    "You reached your recipe creation limit for the "
                            + getEffectivePlan(user).name().toLowerCase()
                            + " plan. Remove an existing recipe or upgrade your plan.",
                    HttpStatus.FORBIDDEN
            );
        }
    }

    public SubscriptionPlan getEffectivePlan(User user) {
        SubscriptionPlan userPlan = user.getSubscriptionPlan() == null
                ? SubscriptionPlan.FREE
                : user.getSubscriptionPlan();

        if (user.getRole() == Role.ADMIN) {
            return SubscriptionPlan.PAID;
        }

        return userPlan;
    }

    public Integer getRemainingRecipes(User user, long recipesCreated) {
        int limit = resolveRecipeLimit(user);
        if (isUnlimited(limit)) {
            return null;
        }

        long remaining = (long) limit - recipesCreated;
        if (remaining <= 0) {
            return 0;
        }
        return (int) Math.min(Integer.MAX_VALUE, remaining);
    }

    public boolean isLimitReached(User user, long recipesCreated) {
        int limit = resolveRecipeLimit(user);
        return !isUnlimited(limit) && recipesCreated >= limit;
    }

    private boolean isUnlimited(int limit) {
        return limit == UNLIMITED_LIMIT;
    }

    private void validateConfig(int freeLimit, int paidLimit) {
        if (freeLimit < 0) {
            throw new IllegalStateException("app.limits.recipes.free must be >= 0");
        }

        if (paidLimit < 0 && paidLimit != UNLIMITED_LIMIT) {
            throw new IllegalStateException("app.limits.recipes.paid must be >= 0 or exactly -1 for unlimited");
        }
    }
}
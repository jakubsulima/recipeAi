package org.jakub.backendapi.services;

import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.dto.UserPreferencesDto;
import org.jakub.backendapi.entities.Enums.Diet;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.entities.UserPreferences;
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.mappers.UserPreferencesMapper;
import org.jakub.backendapi.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserRepository userRepository;
    private final UserPreferencesMapper preferencesMapper;

    public UserPreferencesDto getPreferences(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return preferencesMapper.toUserPreferencesDto(user.getUserPreferences());
    }

    @Transactional
    public UserPreferencesDto changeDiet(String email, String diet) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        UserPreferences preferences = user.getUserPreferences();
        try {
            preferences.setDiet(Diet.valueOf(diet.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid diet value", HttpStatus.BAD_REQUEST);
        }

        return preferencesMapper.toUserPreferencesDto(preferences);
    }

    @Transactional
    public UserPreferencesDto addDislikedIngredient(String email, String ingredient) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        UserPreferences preferences = user.getUserPreferences();

        if (!preferences.getDislikedIngredients().contains(ingredient)) {
            System.out.println("Adding disliked ingredient: " + ingredient);
            List<String> newDislikedIngredients = new ArrayList<>(preferences.getDislikedIngredients());
            newDislikedIngredients.add(ingredient);
            preferences.setDislikedIngredients(newDislikedIngredients);
        }

        return preferencesMapper.toUserPreferencesDto(preferences);
    }

    @Transactional
    public UserPreferencesDto removeDislikedIngredient(String email, String ingredient) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        UserPreferences preferences = user.getUserPreferences();
        if (!preferences.getDislikedIngredients().contains(ingredient)) {
            throw new AppException("Ingredient not found in disliked ingredients", HttpStatus.BAD_REQUEST);
        }
        List<String> newDislikedIngredients = new ArrayList<>(preferences.getDislikedIngredients());
        newDislikedIngredients.removeIf(i -> i.equalsIgnoreCase(ingredient));
        preferences.setDislikedIngredients(newDislikedIngredients);

        return preferencesMapper.toUserPreferencesDto(preferences);
    }


    public Diet[] getDiets() {
        return Diet.values();
    }
}
package org.jakub.backendapi.services;

import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.dto.UserPreferencesDto;
import org.jakub.backendapi.entities.Diet;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.entities.UserPreferences;
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.mappers.UserPreferencesMapper;
import org.jakub.backendapi.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.prefs.Preferences;

@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserRepository userRepository;
    private final UserPreferencesMapper preferencesMapper;

    public UserPreferencesDto getPreferences(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return preferencesMapper.toUserPreferencesDto(user.getUserPreferences());
    }

    @Transactional
    public UserPreferencesDto patchPreferences(String email, UserPreferencesDto preferencesDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // Only update the diet if it was provided in the request
        UserPreferences preferences = user.getUserPreferences();
        UserPreferences updatedUserPreferences = preferencesMapper.toUserPreferences(preferencesDto);

        if (preferencesDto.getDislikedIngredients() != null) {
            preferences.setDislikedIngredients(updatedUserPreferences.getDislikedIngredients());
        }

        return preferencesMapper.toUserPreferencesDto(preferences);
    }
}
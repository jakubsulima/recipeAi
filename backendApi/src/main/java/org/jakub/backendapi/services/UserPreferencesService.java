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

import java.util.Arrays;
import java.util.stream.Stream;

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
    public UserPreferencesDto patchPreferences(String email, UserPreferencesDto preferencesDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        UserPreferences preferences = user.getUserPreferences();
        preferences.setDiet(Diet.valueOf(preferencesDto.getDiet().toUpperCase()));
        preferences.setDislikedIngredients(Stream.concat(Arrays.stream(preferencesDto.getDislikedIngredients()).toList().stream(),
                preferences.getDislikedIngredients().stream()).toList());

        return preferencesMapper.toUserPreferencesDto(preferences);
    }


    public Diet[] getDiets() {
        return Diet.values();
    }
}
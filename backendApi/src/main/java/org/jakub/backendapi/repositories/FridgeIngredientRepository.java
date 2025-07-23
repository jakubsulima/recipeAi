package org.jakub.backendapi.repositories;

import org.jakub.backendapi.entities.FridgeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface FridgeIngredientRepository extends JpaRepository<FridgeIngredient, Long> {
    List<FridgeIngredient> findByUser_Id(Long userId);

}

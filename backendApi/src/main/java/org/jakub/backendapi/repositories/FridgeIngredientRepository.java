package org.jakub.backendapi.repositories;

import org.jakub.backendapi.entities.FridgeIngredient; // Changed from FridgeIngredientRepository to FridgeIngredient
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface FridgeIngredientRepository extends JpaRepository<FridgeIngredient, Long> { // Changed from FridgeIngredientRepository to FridgeIngredient
    List<FridgeIngredient> findByUser_Id(Long userId); // Changed from findByUser to findByUser_Id and FridgeIngredientRepository to FridgeIngredient

}

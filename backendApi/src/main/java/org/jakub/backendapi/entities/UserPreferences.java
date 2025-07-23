package org.jakub.backendapi.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jakub.backendapi.entities.Enums.Diet;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "diet")
    private Diet diet;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "disliked_ingredients", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "ingredient")
    private List<String> dislikedIngredients;
}


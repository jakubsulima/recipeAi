package org.jakub.backendapi.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jakub.backendapi.entities.Enums.CategoryFridgeIngredient;
import org.jakub.backendapi.entities.Enums.Unit;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Entity
@Table(name = "fridge_ingredient")
public class FridgeIngredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column()
    private LocalDate expirationDate;

    @Column()
    @Enumerated(EnumType.STRING)
    private Unit unit;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CategoryFridgeIngredient category;

    @Column(nullable = false)
    private double amount;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}

package org.jakub.backendapi.entities;

import jakarta.persistence.*;
import org.jakub.backendapi.entities.Enums.CategoryFridgeIngredient;
import org.jakub.backendapi.entities.Enums.Unit;

import java.time.LocalDate;
import java.util.Objects;

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
    private CategoryFridgeIngredient category;

    @Column(nullable = false)
    private double amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public FridgeIngredient() {
    }

    public FridgeIngredient(Long id, String name, LocalDate expirationDate, CategoryFridgeIngredient category, double amount, Unit unit, User user) {
        this.id = id;
        this.name = name;
        this.expirationDate = expirationDate;
        this.category = category;
        this.amount = amount;
        this.unit = unit;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDate expirationDate) {
        this.expirationDate = expirationDate;
    }

    public CategoryFridgeIngredient getCategory() {
        return category;
    }

    public void setCategory(CategoryFridgeIngredient category) {
        this.category = category;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public Unit getUnit() {
        return unit;
    }

    public void setUnit(Unit unit) {
        this.unit = unit;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FridgeIngredient that = (FridgeIngredient) o;
        return Double.compare(that.amount, amount) == 0 && Objects.equals(id, that.id) && Objects.equals(name, that.name) && Objects.equals(expirationDate, that.expirationDate) && category == that.category && unit == that.unit && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, expirationDate, category, amount, unit, user);
    }

    @Override
    public String toString() {
        return "FridgeIngredient{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", expirationDate=" + expirationDate +
                ", category=" + category +
                ", amount=" + amount +
                ", unit=" + unit +
                ", user=" + user +
                '}';
    }
}

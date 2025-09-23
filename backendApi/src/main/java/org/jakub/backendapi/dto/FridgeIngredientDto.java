package org.jakub.backendapi.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.util.Objects;

public class FridgeIngredientDto {
    private Long id;
    private String name;
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate expirationDate;
    private String category;
    private double amount;
    private String unit;

    public FridgeIngredientDto() {
    }

    public FridgeIngredientDto(Long id, String name, LocalDate expirationDate, String category, double amount, String unit) {
        this.id = id;
        this.name = name;
        this.expirationDate = expirationDate;
        this.category = category;
        this.amount = amount;
        this.unit = unit;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FridgeIngredientDto that = (FridgeIngredientDto) o;
        return Double.compare(that.amount, amount) == 0 && Objects.equals(id, that.id) && Objects.equals(name, that.name) && Objects.equals(expirationDate, that.expirationDate) && Objects.equals(category, that.category) && Objects.equals(unit, that.unit);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, expirationDate, category, amount, unit);
    }

    @Override
    public String toString() {
        return "FridgeIngredientDto{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", expirationDate=" + expirationDate +
                ", category='" + category + '\'' +
                ", amount=" + amount +
                ", unit='" + unit + '\'' +
                '}';
    }
}

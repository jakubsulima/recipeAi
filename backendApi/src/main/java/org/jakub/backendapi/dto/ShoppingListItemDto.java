package org.jakub.backendapi.dto;

import com.fasterxml.jackson.annotation.JsonSetter;

import java.util.Objects;

public class ShoppingListItemDto {
    private String id;
    private String name;
    private Double amount;
    private String unit;
    private boolean checked;
    private String createdAt;

    public ShoppingListItemDto() {
    }

    public ShoppingListItemDto(String id, String name, Double amount, String unit, boolean checked, String createdAt) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.unit = unit;
        this.checked = checked;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getAmount() {
        return amount;
    }

    @JsonSetter("amount")
    public void setAmount(Object amount) {
        if (amount == null) {
            this.amount = null;
            return;
        }

        if (amount instanceof Number number) {
            this.amount = number.doubleValue();
            return;
        }

        if (amount instanceof String value) {
            String trimmedValue = value.trim();
            if (trimmedValue.isEmpty()) {
                this.amount = null;
                return;
            }
            try {
                this.amount = Double.parseDouble(trimmedValue);
                return;
            } catch (NumberFormatException ignored) {
                throw new IllegalArgumentException("Amount must be a valid number");
            }
        }

        throw new IllegalArgumentException("Amount must be a valid number");
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public boolean isChecked() {
        return checked;
    }

    public void setChecked(boolean checked) {
        this.checked = checked;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ShoppingListItemDto that = (ShoppingListItemDto) o;
        return checked == that.checked && Objects.equals(id, that.id) && Objects.equals(name, that.name) && Objects.equals(amount, that.amount) && Objects.equals(unit, that.unit) && Objects.equals(createdAt, that.createdAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, amount, unit, checked, createdAt);
    }
}

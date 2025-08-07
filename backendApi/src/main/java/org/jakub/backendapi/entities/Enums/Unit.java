package org.jakub.backendapi.entities.Enums;

public enum Unit {
    GRAMS("g"),
    KILOGRAMS("kg"),
    LITERS("l"),
    MILLILITERS("ml"),
    PIECES("pcs");

    private final String abbreviation;

    Unit(String abbreviation) {
        this.abbreviation = abbreviation;
    }

    public String getAbbreviation() {
        return abbreviation;
    }

}

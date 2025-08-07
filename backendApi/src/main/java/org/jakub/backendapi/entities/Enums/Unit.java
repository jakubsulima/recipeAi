package org.jakub.backendapi.entities.Enums;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public enum Unit {
    GRAMS("g"),
    KILOGRAMS("kg"),
    LITERS("l"),
    MILLILITERS("ml"),
    PIECES("pcs");

    private final String abbreviation;

    private static final Map<String, Unit> BY_ABBREVIATION =
            Stream.of(values()).collect(Collectors.toMap(Unit::getAbbreviation, Function.identity()));

    Unit(String abbreviation) {
        this.abbreviation = abbreviation;
    }

    public String getAbbreviation() {
        return abbreviation;
    }

    public static Unit valueOfAbbreviation(String abbreviation) {
        Unit unit = BY_ABBREVIATION.get(abbreviation.toLowerCase());
        if (unit == null) {
            throw new IllegalArgumentException("No enum constant with abbreviation " + abbreviation);
        }
        return unit;
    }
}

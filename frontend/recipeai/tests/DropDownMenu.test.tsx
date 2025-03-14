import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DropDownMenu from "../src/components/DropDownMenu";

describe("DropDownMenu", () => {
  const mockItems = ["Recipes", "Fridge", "Login"];
  const mockClassName = "test-class";

  it("renders the dropdown menu with correct items", () => {
    render(
      <DropDownMenu dropdownItems={mockItems} className={mockClassName} />
    );

    // Check that all items are rendered
    expect(screen.getByText("Recipes")).toBeInTheDocument();
    expect(screen.getByText("Fridge")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("applies the provided className to the container", () => {
    const { container } = render(
      <DropDownMenu dropdownItems={mockItems} className={mockClassName} />
    );

    // Check that the className is applied
    const menuElement = container.firstChild;
    expect(menuElement).toHaveClass(mockClassName);
  });

  it("renders the correct number of dropdown items", () => {
    render(
      <DropDownMenu dropdownItems={mockItems} className={mockClassName} />
    );

    // Check that there are 3 dropdown items
    const items = screen.getAllByText(/Recipes|Fridge|Login/);
    expect(items).toHaveLength(3);
  });

  it("renders empty when no items are provided", () => {
    const { container } = render(
      <DropDownMenu dropdownItems={[]} className={mockClassName} />
    );

    // Check that the menu is rendered but has no children
    const menuElement = container.firstChild;
    expect(menuElement).toBeInTheDocument();
    expect(menuElement?.childNodes).toHaveLength(0);
  });
});

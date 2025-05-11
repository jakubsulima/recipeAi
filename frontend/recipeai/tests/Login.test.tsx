import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../src/pages/Login";
import { vi, beforeEach, test, expect, describe } from "vitest";
import React from "react";
import * as hooks from "../src/lib/hooks";

// Mock the react-router-dom hooks
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../src/lib/hooks", () => ({
  AJAX: vi.fn(),
}));

// Mock the AuthProvider
vi.mock("../src/context/context", () => ({
  useUser: () => ({
    setUser: vi.fn(),
    user: null,
    loading: false,
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<Login />);
  });

  test("renders the form fields correctly", () => {
    expect(screen.getByLabelText(/Login:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Don't have an account\? Register/i)
    ).toBeInTheDocument();
  });

  test("updates input values on change", () => {
    const loginInput = screen.getByLabelText(/Login:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);

    fireEvent.change(loginInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    expect(loginInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("Password123!");
  });

  test("shows error messages for invalid inputs", async () => {
    const submitButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Login is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../src/pages/Register";
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

describe("Register Component", () => {
  let mockSubmit;

  beforeEach(() => {
    mockSubmit = vi.fn();
    vi.clearAllMocks();
    render(<Register />);
  });

  test("renders the form fields correctly", () => {
    expect(screen.getByLabelText(/First Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Login:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register/i })
    ).toBeInTheDocument();
  });

  test("updates input values on change", () => {
    const firstNameInput = screen.getByLabelText(/First Name:/i);
    const lastNameInput = screen.getByLabelText(/Last Name:/i);
    const loginInput = screen.getByLabelText(/Login:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    fireEvent.change(loginInput, { target: { value: "johndoe" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    expect(firstNameInput).toHaveValue("John");
    expect(lastNameInput).toHaveValue("Doe");
    expect(loginInput).toHaveValue("johndoe");
    expect(passwordInput).toHaveValue("password");
  });

  test("shows error messages for invalid inputs", async () => {
    const submitButton = screen.getByRole("button", { name: /Register/i });

    fireEvent.click(submitButton);

    // Wait for validation messages to appear
    await waitFor(() => {
      expect(screen.getByText("First name is required")).toBeInTheDocument();
    });

    expect(screen.getByText("Login is required")).toBeInTheDocument();

    expect(
      screen.getByText("Password must be at least 8 characters")
    ).toBeInTheDocument();
  });

  test("validates password requirements", async () => {
    const passwordInput = screen.getByLabelText(/Password:/i);
    const submitButton = screen.getByRole("button", { name: /Register/i });

    // Test for minimum length
    fireEvent.change(passwordInput, { target: { value: "short" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });

    // Test for requiring a number
    fireEvent.change(passwordInput, { target: { value: "passwordNoNumber" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one number/i)
      ).toBeInTheDocument();
    });

    // Test for requiring uppercase letter
    fireEvent.change(passwordInput, { target: { value: "password123!" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one uppercase letter/i)
      ).toBeInTheDocument();
    });

    // Test for requiring lowercase letter
    fireEvent.change(passwordInput, { target: { value: "PASSWORD123!" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one lowercase letter/i)
      ).toBeInTheDocument();
    });

    // Test for requiring special character
    fireEvent.change(passwordInput, { target: { value: "Password123" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(
          /Password must contain at least one special character/i
        )
      ).toBeInTheDocument();
    });

    // Test valid password - should have no error message
    const firstNameInput = screen.getByLabelText(/First Name:/i);
    const loginInput = screen.getByLabelText(/Login:/i);
    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(loginInput, { target: { value: "johndoe" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.queryByText(/Password must/i)).not.toBeInTheDocument();
    });
  });

  test("submits form with valid password", async () => {
    // Mock the AJAX function to resolve
    const mockAJAX = vi.fn().mockResolvedValue({ success: true });
    (hooks.AJAX as unknown as typeof mockAJAX) = mockAJAX;

    const firstNameInput = screen.getByLabelText(/First Name:/i);
    const lastNameInput = screen.getByLabelText(/Last Name:/i);
    const loginInput = screen.getByLabelText(/Login:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);
    const submitButton = screen.getByRole("button", { name: /Register/i });

    // Fill in the form
    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    fireEvent.change(loginInput, { target: { value: "johndoe" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for the async submission to complete
    await waitFor(() => {
      expect(mockAJAX).toHaveBeenCalledWith("register", true, {
        firstName: "John",
        lastName: "Doe",
        login: "johndoe",
        password: "Password123!",
      });
    });
  });
});

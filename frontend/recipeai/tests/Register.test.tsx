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
    expect(screen.getByLabelText(/email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password:/i)).toBeInTheDocument(); // Use ^ to be more specific
    expect(screen.getByLabelText(/Confirm Password:/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register/i })
    ).toBeInTheDocument();
  });

  test("updates input values on change", () => {
    const emailInput = screen.getByLabelText(/email:/i);
    const passwordInput = screen.getByLabelText(/^Password:/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password:/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
    expect(confirmPasswordInput).toHaveValue("password123");
  });

  test("shows error messages for invalid inputs", async () => {
    const submitButton = screen.getByRole("button", { name: /Register/i });

    fireEvent.click(submitButton);

    // Wait for validation messages to appear
    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Password must be at least 8 characters")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Confirm Password is required")
    ).toBeInTheDocument();
  });

  test("shows 'Passwords must match' error if passwords do not match", async () => {
    const emailInput = screen.getByLabelText(/email:/i);
    const passwordInput = screen.getByLabelText(/^Password:/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password:/i);
    const submitButton = screen.getByRole("button", { name: /Register/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123" },
    }); // Mismatch

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords must match")).toBeInTheDocument();
    });
  });

  test("validates password requirements", async () => {
    const emailInput = screen.getByLabelText(/email:/i);
    const passwordInput = screen.getByLabelText(/^Password:/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password:/i);
    const submitButton = screen.getByRole("button", { name: /Register/i });

    // Pre-fill other required fields to isolate password validation
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "short" } });

    // Test for minimum length
    fireEvent.change(passwordInput, { target: { value: "short" } });
    // Need to make confirmPassword match for this specific sub-test, or it will show "Passwords must match"
    fireEvent.change(confirmPasswordInput, { target: { value: "short" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });

    // Test for requiring a number
    fireEvent.change(passwordInput, { target: { value: "passwordNoNumber" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "passwordNoNumber" },
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one number/i)
      ).toBeInTheDocument();
    });

    // Test for requiring uppercase letter
    fireEvent.change(passwordInput, { target: { value: "password123!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123!" },
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one uppercase letter/i)
      ).toBeInTheDocument();
    });

    // Test for requiring lowercase letter
    fireEvent.change(passwordInput, { target: { value: "PASSWORD123!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "PASSWORD123!" },
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one lowercase letter/i)
      ).toBeInTheDocument();
    });

    // Test for requiring special character
    fireEvent.change(passwordInput, { target: { value: "Password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123" },
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(
          /Password must contain at least one special character/i
        )
      ).toBeInTheDocument();
    });

    // Test valid password - should have no error message for password
    // emailInput is already filled
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123!" },
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      // Check that AJAX was called, implying other validations passed
      expect(hooks.AJAX).toHaveBeenCalled();
      // And that password specific errors are not present
      expect(screen.queryByText(/Password must/i)).not.toBeInTheDocument();
    });
  });

  test("submits form with valid data", async () => {
    const mockAJAX = vi.fn().mockResolvedValue({ success: true });
    (hooks.AJAX as unknown as ReturnType<typeof vi.fn>) = mockAJAX;

    const emailInput = screen.getByLabelText(/email:/i);
    const passwordInput = screen.getByLabelText(/^Password:/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password:/i);
    const submitButton = screen.getByRole("button", { name: /Register/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123!" },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAJAX).toHaveBeenCalledWith("register", true, {
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
    });
  });
});

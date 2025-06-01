import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../src/pages/Login";
import { vi, beforeEach, test, expect, describe } from "vitest";
import { MemoryRouter } from "react-router-dom"; // Import MemoryRouter

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
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  });

  test("renders the form fields correctly", () => {
    expect(screen.getByLabelText(/email:/i)).toBeInTheDocument(); // Changed from Login to email
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Don't have an account\? Register/i)
    ).toBeInTheDocument();
  });

  test("updates input values on change", () => {
    const emailInput = screen.getByLabelText(/email:/i); // Changed from Login to email
    const passwordInput = screen.getByLabelText(/Password:/i);

    fireEvent.change(emailInput, { target: { value: "testuser@example.com" } }); // Used a valid email format
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    expect(emailInput).toHaveValue("testuser@example.com");
    expect(passwordInput).toHaveValue("Password123!");
  });

  test("shows error messages for invalid inputs", async () => {
    const submitButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument(); // Changed from Login to Email
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });
});

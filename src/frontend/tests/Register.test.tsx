import React from "react";

import "@testing-library/jest-dom/vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";

import { BrowserRouter } from "react-router-dom";

import Register from "../src/pages/auth/Register";

// Helper to render with router
const renderWithRouter = (ui: React.ReactElement) =>
    render(<BrowserRouter>{ui}</BrowserRouter>);

beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
});

describe("Register Page", () => {
    it("shows/hides password when toggle button is clicked", () => {
        const dom = renderWithRouter(<Register />);

        const passwordInput = dom.container.querySelector("#password");
        const toggleBtn = passwordInput?.nextSibling;

        if (!passwordInput || !toggleBtn) throw Error("HTML elements could not be loaded.");


        expect(passwordInput).toHaveAttribute("type", "password");
        fireEvent.click(toggleBtn);
        expect(passwordInput).toHaveAttribute("type", "text");
        fireEvent.click(toggleBtn);
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("shows error on passwords not matching", async () => {
        const dom = renderWithRouter(<Register />);

        const schoolNameInput = dom.container.querySelector("#school-name");
        const emailInput = dom.container.querySelector("#email");
        const passwordInput = dom.container.querySelector("#password");
        const confirmPasswordInput = dom.container.querySelector("#confirm-password");
        const signUpButton = dom.container.querySelector("#sign-up-btn");

        if (!schoolNameInput || !emailInput || !passwordInput || !confirmPasswordInput || !signUpButton)
            throw Error("HTML elements could not be loaded.");

        fireEvent.change(schoolNameInput, { target: { value: "Test School" } });
        fireEvent.change(emailInput, { target: { value: "test@school.com" } });
        fireEvent.change(passwordInput, { target: { value: "Password123!" } });
        fireEvent.change(confirmPasswordInput, { target: { value: "123Password" } });
        fireEvent.click(signUpButton);
        expect(dom.container.querySelector("#register-error-message")).toHaveTextContent(/Passwords do not match/i)
    });

    it("shows error on invalid password", async () => {
        const dom = renderWithRouter(<Register />);

        const schoolNameInput = dom.container.querySelector("#school-name");
        const emailInput = dom.container.querySelector("#email");
        const passwordInput = dom.container.querySelector("#password");
        const confirmPasswordInput = dom.container.querySelector("#confirm-password");
        const signUpButton = dom.container.querySelector("#sign-up-btn");

        if (!schoolNameInput || !emailInput || !passwordInput || !confirmPasswordInput || !signUpButton)
            throw Error("HTML elements could not be loaded.");

        fireEvent.change(schoolNameInput, { target: { value: "Test School" } });
        fireEvent.change(emailInput, { target: { value: "test@school.com" } });

        // Must be between 8 and 32 characters in length.
        fireEvent.change(passwordInput, { target: { value: "pwd" } });
        fireEvent.change(confirmPasswordInput, { target: { value: "pwd" } });
        fireEvent.click(signUpButton);
        expect(dom.container.querySelector("#register-error-message")).toHaveTextContent(/Password must be between 8 and 32 characters/i)

        // Must contain at least one digit.
        fireEvent.change(passwordInput, { target: { value: "password" } });
        fireEvent.change(confirmPasswordInput, { target: { value: "password" } });
        fireEvent.click(signUpButton);
        expect(dom.container.querySelector("#register-error-message")).toHaveTextContent(/Password must include at least one digit/i)

        // Must contain at least one lowercase letter.
        fireEvent.change(passwordInput, { target: { value: "PASSWORD1" } });
        fireEvent.change(confirmPasswordInput, { target: { value: "PASSWORD1" } });
        fireEvent.click(signUpButton);
        expect(dom.container.querySelector("#register-error-message")).toHaveTextContent(/Password must include at least one lowercase letter/i)

        // Must contain at least one uppercase letter.
        fireEvent.change(passwordInput, { target: { value: "password1" } });
        fireEvent.change(confirmPasswordInput, { target: { value: "password1" } });
        fireEvent.click(signUpButton);
        expect(dom.container.querySelector("#register-error-message")).toHaveTextContent(/Password must include at least one uppercase letter/i)

        // Must contain at least one special character.
        fireEvent.change(passwordInput, { target: { value: "Password123" } });
        fireEvent.change(confirmPasswordInput, { target: { value: "Password123" } });
        fireEvent.click(signUpButton);
        expect(dom.container.querySelector("#register-error-message")).toHaveTextContent(/Password must include at least one special character/i)
    });

    it("shows error on server error", async () => {
        // @ts-ignore
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500,
        });

        const dom = renderWithRouter(<Register />);

        const schoolNameInput = dom.container.querySelector("#school-name");
        const emailInput = dom.container.querySelector("#email");
        const passwordInput = dom.container.querySelector("#password");
        const confirmPasswordInput = dom.container.querySelector("#confirm-password");
        const signUpButton = dom.container.querySelector("#sign-up-btn");

        if (!schoolNameInput || !emailInput || !passwordInput || !confirmPasswordInput || !signUpButton)
            throw Error("HTML elements could not be loaded.");

        fireEvent.change(schoolNameInput, { target: { value: "Test School" } });
        fireEvent.change(emailInput, { target: { value: "test@school.com" } });
        fireEvent.change(passwordInput, { target: { value: "Password123!" } });
        fireEvent.change(confirmPasswordInput, { target: { value: "Password123!" } });
        fireEvent.click(signUpButton);

        await waitFor(() =>
            expect(dom.container.querySelector("#register-error-message")).toHaveTextContent(/Something went wrong/i)
        );
    });
});
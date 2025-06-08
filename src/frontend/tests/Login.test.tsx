import React from "react";

import "@testing-library/jest-dom/vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";

import { BrowserRouter } from "react-router-dom";

import Login from "../src/pages/auth/Login";

// Helper to render with router
const renderWithRouter = (ui: React.ReactElement) =>
    render(<BrowserRouter>{ui}</BrowserRouter>);

beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
});

describe("Login Page", () => {
    it("shows/hides password when toggle button is clicked", () => {
        const dom = renderWithRouter(<Login />);

        const passwordInput = dom.container.querySelector("#password");
        const toggleBtn = passwordInput?.nextSibling;

        if (!passwordInput || !toggleBtn) throw Error("HTML elements could not be loaded.");

        expect(passwordInput).toHaveAttribute("type", "password");
        fireEvent.click(toggleBtn);
        expect(passwordInput).toHaveAttribute("type", "text");
        fireEvent.click(toggleBtn);
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("shows error on invalid credentials", async () => {
        // @ts-ignore
        global.fetch.mockResolvedValue({
            ok: false,
            status: 401,
        });

        const dom = renderWithRouter(<Login />);

        const emailInput = dom.container.querySelector("#email");
        const passwordInput = dom.container.querySelector("#password");
        const signInButton = dom.container.querySelector("#sign-in-btn");

        if (!emailInput || !passwordInput || !signInButton) throw Error("HTML elements could not be loaded.");

        fireEvent.change(emailInput, { target: { value: "test@school.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(signInButton);

        await waitFor(() =>
            expect(dom.container.querySelector("#login-error-message")).toHaveTextContent(/Invalid email or password/i)
        );
    });

    it("shows error on server error", async () => {
        // @ts-ignore
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500,
        });

        const dom = renderWithRouter(<Login />);

        const emailInput = dom.container.querySelector("#email");
        const passwordInput = dom.container.querySelector("#password");
        const signInButton = dom.container.querySelector("#sign-in-btn");

        if (!emailInput || !passwordInput || !signInButton) throw Error("HTML elements could not be loaded.");

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(signInButton);

        await waitFor(() =>
            expect(dom.container.querySelector("#login-error-message")).toHaveTextContent(/Something went wrong/i)
        );
    });
});
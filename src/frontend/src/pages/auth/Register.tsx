import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Cookies from "universal-cookie";

// Components
import {
    Card,
    CardContent,
    CardFooter,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription } from "../../components/ui/alert";

// Icons
import { TriangleAlertIcon, EyeIcon, EyeOffIcon } from "lucide-react";

/**
 * Validates a password according to the following rules:
 * - Must be between 8 and 32 characters in length.
 * - Must contain at least one digit.
 * - Must contain at least one lowercase letter.
 * - Must contain at least one uppercase letter.
 * - Must contain at least one special character.
 *
 * @param password - The password string to validate.
 * @returns A tuple where the first element is a boolean indicating validity,
 *          and the second element is an error message if invalid, or an empty string if valid.
 */
function validatePassword(password: string) {
    var isValid = true;
    var errorMessage = "";

    if (password.length < 8 || password.length > 32) {
        isValid = false;
        errorMessage = "Password must be between 8 and 32 characters";
    }
    else if (!/[0-9]/.test(password)) {
        isValid = false;
        errorMessage = "Password must include at least one digit";
    }
    else if (!/[a-z]/.test(password)) {
        isValid = false;
        errorMessage = "Password must include at least one lowercase letter";
    }
    else if (!/[A-Z]/.test(password)) {
        isValid = false;
        errorMessage = "Password must include at least one uppercase letter";
    }
    else if (!/[*.!@\$%^&(){}\[\]:;<>,.?/~_+\-=|\\]/.test(password)) {
        isValid = false;
        errorMessage = "Password must include at least one special character";
    }

    return [isValid, errorMessage];
}

function Register() {
    const navigate = useNavigate();
    const cookies = new Cookies();

    // User logged in -> redirect home
    if (cookies.get("user")) {
        window.location.href = "/";
    }

    // Stateful values and functions to update them
    const [schoolname, setSchoolName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handle register new user
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validate password pattern
        const [passwordIsValid, errorMessage] = validatePassword(password);
        if (!passwordIsValid) {
            setError(errorMessage as string);
            setConfirmPassword("");
            setIsLoading(false);
            return;
        }


        // Validate equal passwords
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setPassword("");
            setConfirmPassword("");
            setIsLoading(false);
            return;
        }

        // Wait 500ms for loading effect
        await new Promise((resolve) => setTimeout(resolve, 500));

        fetch(`${import.meta.env.VITE_API_ENDPOINT}/User/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "school_name": schoolname,
                "email": email,
                "password": password
            }),
        }).then((res) => {
            if (res.ok) {
                navigate("/login");
            }
            else {
                setError("Something went wrong");
                setIsLoading(false);
            }
        }).catch((error) => {
            console.error(error);
            setError("An error occurred");
            setIsLoading(false);
        });
    };

    return (
        <main aria-label="Register" className="flex bg-gray-50 p-8 flex-nowrap justify-center items-center">
            <div className="w-full max-w-md space-y-4">

                <div className="text-center">
                    <h1 className="text-2xl font-bold">Register</h1>
                    <p
                        id="register-form-description"
                        className="mt-2 text-gray-600"
                        aria-labelledby="register-form-description"
                    >
                        Create your account
                    </p>
                </div>

                <Card className="bg-white" role="form" aria-labelledby="register-form-title">
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4 pt-6">
                            {/* Input: School name */}
                            <div className="space-y-2">
                                <Label aria-label="School Name" htmlFor="school-name">School Name</Label>
                                <Input
                                    id="school-name"
                                    type="text"
                                    value={schoolname}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    required
                                    aria-required={true}
                                    aria-label="School name"
                                    tabIndex={0}
                                />
                            </div>

                            {/* Input: Email */}
                            <div className="space-y-2">
                                <Label aria-label="Email" htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    aria-required={true}
                                    aria-label="Email address"
                                    tabIndex={0}
                                />
                            </div>

                            {/* Input: Password, with toggle visibility eye icon */}
                            <div className="space-y-2">
                                <Label aria-label="Password" htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        aria-required={true}
                                        aria-label="Password"
                                        tabIndex={0}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        aria-pressed={showPassword}
                                        tabIndex={0}
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon className="h-4 w-4" aria-hidden={true} />
                                        ) : (
                                            <EyeIcon className="h-4 w-4" aria-hidden={true} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Input: Confirm password, with toggle visibility eye icon */}
                            <div className="space-y-2">
                                <Label aria-label="Confirm Password" htmlFor="confirm-password">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        aria-required={true}
                                        aria-label="Confirm Password"
                                        tabIndex={0}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        aria-label={
                                            showConfirmPassword ? "Hide password" : "Show password"
                                        }
                                        aria-pressed={showPassword}
                                        tabIndex={0}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOffIcon className="h-4 w-4" aria-hidden={true} />
                                        ) : (
                                            <EyeIcon className="h-4 w-4" aria-hidden={true} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Show alert if error */}
                            {error && (
                                <Alert
                                    role="alert"
                                    variant="destructive"
                                    className="mb-4"
                                    aria-labelledby="login-error-message"
                                    aria-live="assertive"
                                >
                                    <div className="flex items-center">
                                        <TriangleAlertIcon className="h-4 w-4 mr-3" aria-hidden={true} />
                                        <AlertDescription id="login-error-message">{error}</AlertDescription>
                                    </div>
                                </Alert>
                            )}

                            {/* Button: Register */}
                            <Button
                                id="sign-up-btn"
                                type="submit"
                                className="w-full" disabled={isLoading}
                                tabIndex={0}
                            >
                                {isLoading ? "Creating account..." : "Create account"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex justify-center text-sm text-gray-500">
                        <p
                            id="already-account-paragraph"
                            className="text-sm pr-1 text-gray-600"
                            aria-labelledby="already-account-paragraph"
                        >
                            Already have an account?</p>
                        <Button
                            id="signin-btn"
                            variant="link"
                            type="button"
                            className="text-sm p-0"
                            onClick={() => navigate("/login")}
                            aria-labelledby="signin-btn"
                            tabIndex={0}
                        >
                            Sign in
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
};

export default Register;
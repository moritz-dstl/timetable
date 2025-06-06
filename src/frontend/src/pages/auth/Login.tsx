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

function Login() {
    const navigate = useNavigate();
    const cookies = new Cookies();

    // User logged in -> redirect home
    if (cookies.get("user")) {
        window.location.href = "/";
    }

    // Stateful values and functions to update them
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handle log in user
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Wait 500ms for loading effect
        await new Promise((resolve) => setTimeout(resolve, 500));

        fetch(`${import.meta.env.VITE_API_ENDPOINT}/User/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                "email": email,
                "password": password
            }),
        }).then((res) => {
            if (res.ok) {
                cookies.set("user", btoa(email));
                navigate("/");
            }
            else if (res.status === 401) {
                setError("Invalid email or password");
                setIsLoading(false);
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
        <main aria-label="Login" className="flex bg-gray-50 p-8 flex-nowrap justify-center items-center">
            <div className="w-full max-w-md space-y-4">

                <div className="text-center">
                    <h1 id="login-form-title" className="text-2xl font-bold">Login</h1>
                    <p
                        id="login-form-description"
                        className="mt-2 text-gray-600"
                        aria-labelledby="login-form-description"
                    >
                        Sign in to access your account
                    </p>
                </div>

                <Card className="bg-white" role="form" aria-labelledby="login-form-title">
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4 pt-6" aria-describedby={error ? "login-error-message" : undefined}>
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

                            {/* Show alert if error */}
                            {error && (
                                <Alert
                                    role="alert"
                                    variant="destructive"
                                    className="mb-4"
                                    aria-labelledby="login-error-message"
                                    aria-live="assertive"
                                    tabIndex={0}
                                >
                                    <div className="flex items-center">
                                        <TriangleAlertIcon className="h-4 w-4 mr-3" aria-hidden={true} />
                                        <AlertDescription id="login-error-message">{error}</AlertDescription>
                                    </div>
                                </Alert>
                            )}

                            {/* Forgot password (TODO) */}
                            <Button
                                id="forgot-password-btn"
                                variant="link"
                                type="button"
                                className="text-sm p-0 h-auto"
                                aria-labelledby="forgot-password-btn"
                                tabIndex={0}
                            >
                                Forgot password?
                            </Button>

                            {/* Button: Log in */}
                            <Button
                                id="sign-in-btn"
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                                aria-labelledby="sign-in-btn"
                                tabIndex={0}
                            >
                                {isLoading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex justify-center text-sm text-gray-500">
                        <p
                            id="no-account-paragraph"
                            className="text-sm pr-1 text-gray-600"
                            aria-labelledby="no-account-paragraph"
                        >
                            Don't have an account?
                        </p>
                        <Button
                            id="signup-btn"
                            variant="link"
                            type="button"
                            className="text-sm p-0"
                            onClick={() => navigate("/register")}
                            aria-labelledby="signup-btn"
                            tabIndex={0}
                        >
                            Sign up
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}

export default Login;
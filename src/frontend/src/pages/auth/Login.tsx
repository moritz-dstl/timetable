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
import { TriangleAlert, Eye, EyeOff } from "lucide-react";

function Login() {
    const navigate = useNavigate();
    const cookies = new Cookies();

    // User logged in -> redirect home
    if (cookies.get("auth")) {
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

        try {
            // TODO: API
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (email === "admin@email.com" && password === "password") {
                cookies.set("auth", "token123");
                navigate("/");
            } else {
                setError("Invalid email or password");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-130px)] flex bg-gray-50 p-4 flex-nowrap justify-center items-center">
            <div className="w-full max-w-md space-y-4">

                <div className="text-center">
                    <h1 className="text-2xl font-bold">Login</h1>
                    <p className="mt-2 text-gray-600">Sign in to access your account</p>
                </div>

                <Card className="bg-white">
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4 pt-6">

                            {/* Input: Email */}
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Input: Password, with toggle visibility eye icon */}
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        tabIndex={-1}
                                        aria-label={
                                            showPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                            </div>
                            
                            {/* Show alert if error */}
                            {error && (
                                <Alert variant="destructive" className="mb-4">
                                    <div className="flex items-center">
                                        <TriangleAlert className="h-4 w-4 mr-3" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </div>
                                </Alert>
                            )}

                            {/* TODO: Forgot password */}
                            <Button variant="link" type="button" className="text-sm p-0 h-auto">
                                Forgot password?
                            </Button>
                            
                            {/* Button: Log in */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    </CardContent>
                    
                    <CardFooter className="flex justify-center text-sm text-gray-500">
                        <p className="text-sm pr-1 text-gray-600">Don't have an account?</p>
                        <Button variant="link" type="button" className="text-sm p-0" onClick={() => navigate("/register")}>
                            Sign up
                        </Button>
                    </CardFooter>
                </Card>
                
            </div>
        </div>
    );
}

export default Login;
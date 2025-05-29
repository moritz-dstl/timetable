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

        // Validate equal passwords
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setPassword("");
            setConfirmPassword("");
            setIsLoading(false);
            return;
        }

        try {
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
            });
        } catch (error) {
            console.error(error);
            setError("An error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-130px)] flex bg-gray-50 p-4 flex-nowrap justify-center items-center">
            <div className="w-full max-w-md space-y-4">

                <div className="text-center">
                    <h1 className="text-2xl font-bold">Register</h1>
                    <p className="mt-2 text-gray-600">Create your account</p>
                </div>

                <Card className="bg-white">
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4 pt-6">

                            {/* Input: School name */}
                            <div className="space-y-2">
                                <Label htmlFor="schoolname">School Name</Label>
                                <Input
                                    id="schoolname"
                                    type="text"
                                    value={schoolname}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Input: Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
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
                                <Label htmlFor="password">Password</Label>
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

                            {/* Input: Confirm password, with toggle visibility eye icon */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        tabIndex={-1}
                                        aria-label={
                                            showConfirmPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showConfirmPassword ? (
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

                            {/* Button: Register */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Creating account..." : "Create account"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex justify-center text-sm text-gray-500">
                        <p className="text-sm pr-1 text-gray-600">Already have an account?</p>
                        <Button variant="link" type="button" className="text-sm p-0" onClick={() => navigate("/login")}>
                            Sign in
                        </Button>
                    </CardFooter>
                </Card>

            </div>
        </div>
    );
};

export default Register;
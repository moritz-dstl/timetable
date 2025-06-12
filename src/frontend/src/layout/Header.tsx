import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

// Components
import { Button } from "../components/ui/button";

// Icons
import { BoxesIcon, LogOutIcon } from "lucide-react";

/**
 * Provides top navigation and user session controls.
 *
 * This element includes:
 * - Conditional rendering of authentication buttons based on login state:
 *    - If the user is not logged in: "Sign in" and "Sign up" buttons are displayed.
 *    - If the user is logged in: a "Logout" button is displayed.
 * - Logout functionality, including clearing cookies and local storage, and reloading the page.
 *
 * @returns {JSX.Element}
 */
function Header() {
    const navigate = useNavigate();
    const cookies = new Cookies();

    // Handle log user out
    const handleLogout = () => {
        fetch(`${import.meta.env.VITE_API_ENDPOINT}/User/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
        }).then((res) => {
            if (res.ok) {
                cookies.remove("user");
                localStorage.removeItem("data");
                window.location.reload();
            }
        });
    }

    return (
        <header
            role="banner"
            className="border-b p-4 bg-gray-50"
            aria-label="Header"
        >
            <div className="relative flex justify-left sm:justify-center">
                <BoxesIcon
                    id="header-icon"
                    role="button"
                    className="absolute h-8 w-8 text-primary cursor-pointer"
                    onClick={() => navigate("/")}
                    onKeyDown={e => { if (e.key === "Enter") navigate("/") }}
                    aria-label="Go to homepage"
                    aria-current={location.pathname === "/" ? "page" : undefined}
                    tabIndex={0}
                />
            </div>
            <div className="flex">
                <div className="flex gap-4 ml-auto">
                    {
                        !cookies.get("user") ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-sm"
                                    onClick={() => navigate("/login")}
                                    aria-label="Sign in"
                                    tabIndex={0}
                                >
                                    Sign in
                                </Button>
                                <Button
                                    size="sm"
                                    className="text-sm"
                                    onClick={() => navigate("/register")}
                                    aria-label="Sign up"
                                    tabIndex={0}
                                >
                                    Sign up
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-sm"
                                onClick={handleLogout}
                                aria-label="Log out"
                                tabIndex={0}
                            >
                                <LogOutIcon className="pr-2" aria-hidden={true} />Logout
                            </Button>
                        )
                    }
                </div>
            </div>
        </header>
    );
}

export default Header;

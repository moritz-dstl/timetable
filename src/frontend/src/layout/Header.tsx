import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

// Components
import { Button } from "../components/ui/button";

// Icons
import { Boxes, LogOut } from "lucide-react";

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
        <header className="border-b p-4 bg-gray-50">
            <div className="relative flex justify-left sm:justify-center">
                <Boxes className="absolute h-8 w-8 text-primary cursor-pointer" onClick={() => navigate("/")} />
            </div>
            <div className="flex">
                <div className="flex gap-4 ml-auto">
                    {
                        !cookies.get("user") ? (
                            // Show sign in and sign out buttons if user is not logged in
                            <>
                                <Button variant="outline" size="sm" className="text-sm" onClick={() => navigate("/login")}>
                                    Sign in
                                </Button>
                                <Button size="sm" className="text-sm" onClick={() => navigate("/register")}>
                                    Sign up
                                </Button>
                            </>
                        ) : (
                            // Show logout button if user is logged in
                            <Button variant="outline" size="sm" className="text-sm" onClick={handleLogout}>
                                <LogOut className="pr-2" />Logout
                            </Button>
                        )
                    }
                </div>
            </div>
        </header>
    );
}

export default Header;

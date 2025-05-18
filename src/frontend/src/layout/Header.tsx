import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

// Components
import { Button } from "../components/ui/button";

// Icons
import { LogOut } from "lucide-react";

function Header() {
    const navigate = useNavigate();
    const cookies = new Cookies();

    // Handle log user out
    const handleLogout = () => {
        cookies.remove("auth");
        window.location.reload();
    }

    return (
        <header className="border-b p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>Timetable Generator</h1>
                <div id="header-buttons" className="flex items-center gap-4">
                    {
                        !cookies.get("auth") ? (
                            // Show sign in and sign out buttons if user is not logged in
                            <>
                                <Button variant="outline" size="sm" className="text-sm" onClick={() => navigate("/login")}>
                                    Sign In
                                </Button>
                                <Button size="sm" className="text-sm" onClick={() => navigate("/register")}>
                                    Sign Up
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

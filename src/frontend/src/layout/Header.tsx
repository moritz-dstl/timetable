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
        cookies.remove("auth");
        window.location.reload();
    }

    return (
        <header className="border-b p-4 bg-gray-50">
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="h-8 w-8">
                        <Boxes className="h-8 w-8" color="#FF9100" />
                    </div>
                    <span className="flex gap-1">
                        <h1 className="text-2xl font-bold">FOTTG</h1>
                        <h1 className="hidden md:block text-2xl font-bold">- Free Online Timetable Generator</h1>
                    </span>
                </span>
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

import { Link } from "react-router-dom";
import Cookies from "universal-cookie";

// Pages
import Welcome from "./Welcome";

// Layout
import Navbar from "../layout/Navbar";

function Home() {
    const cookies = new Cookies();

    // If user is not logged in
    if (!cookies.get("auth")) {
        return <Welcome />;
    }

    return (
        <div className="min-h-screen flex bg-gray-50 flex-nowrap">
            <Navbar />
            <div className="p-4">
                <h1 className="text-2xl font-bold">Your Account</h1>
            </div>
        </div>
    );
}

export default Home;
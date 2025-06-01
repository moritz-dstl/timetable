import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import Header from "./layout/Header";
import Footer from "./layout/Footer";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Error404 from "./pages/error/404";

function App() {
    // Always focus header when Shift+Esc is pressed
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && event.shiftKey) {
            event.preventDefault();
            document.querySelector<HTMLElement>("#header-icon")?.focus();
        }
    });

    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/*" element={<Error404 />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}

export default App;
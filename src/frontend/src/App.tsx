import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import Header from "./layout/Header";
import Footer from "./layout/Footer";

// Pages
import Home from "./pages/Home";
import Resources from "./pages/Resources";
import Timetables from "./pages/Timetables";
import Settings from "./pages/Settings";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Error404 from "./pages/error/404";

function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/timetables" element={<Timetables />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/*" element={<Error404 />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}

export default App;
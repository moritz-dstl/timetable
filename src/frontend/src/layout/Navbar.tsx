import { Link } from "react-router-dom";

// Icons
import { LayoutDashboard, Layers, CalendarRange, Settings, CircleUser } from "lucide-react";

function Navbar() {
    const classCurrentTab = "bg-accent text-accent-foreground";
    const classNotCurrentTab = "hover:bg-accent/50";

    return (
        <div className="w-64 border-r bg-card p-4 flex flex-col">
            <nav className="space-y-2 flex-1">
                <Link
                    to="/"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${window.location.pathname === "/" ? classCurrentTab : classNotCurrentTab}`}
                    >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                </Link>
                <Link
                    to="/resources"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${window.location.pathname === "/resources" ? classCurrentTab : classNotCurrentTab}`}
                    >
                    <Layers className="h-5 w-5" />
                    Resources
                </Link>
                <Link
                    to="/timetables"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${window.location.pathname === "/timetables" ? classCurrentTab : classNotCurrentTab}`}
                    >
                    <CalendarRange className="h-5 w-5" />
                    Timetables
                </Link>
                <Link
                    to="/settings"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${window.location.pathname === "/settings" ? classCurrentTab : classNotCurrentTab}`}
                >
                    <Settings className="h-5 w-5" />
                    Settings
                </Link>
            </nav>

            <div className="pb-6"></div>

            <div className="mt-auto pt-4 border-t">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 p-4">
                        <div className="h-6 w-6">
                            <CircleUser className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Admin User</p>
                            <p className="text-xs text-muted-foreground">
                                admin@school.edu
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
// Layout
import Navbar from "../layout/Navbar";

function Timetables() {
    return (
        <div className="min-h-screen flex bg-gray-50 flex-nowrap">
            <Navbar />
            <div className="p-4">
                <h1 className="text-2xl font-bold">Timetables</h1>
            </div>
        </div>
    );
}

export default Timetables;
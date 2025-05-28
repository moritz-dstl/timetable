// Components
import { Loader } from "../components/ui/loader"

// Cards
import GenerateTimetable from "../components/cards/GenerateTimetable"
import DisplayTimetable from "../components/cards/display/Timetable"

function Timetable({ isLoading, data, setData }) {
    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-250px)] flex bg-gray-50 p-4 flex-nowrap justify-center items-center">
                <div className="text-center">
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <>
            <GenerateTimetable data={data} setData={setData} />
            <DisplayTimetable data={data} />
        </>
    );
}

export default Timetable;
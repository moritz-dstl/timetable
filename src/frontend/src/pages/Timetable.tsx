// Components
import { Loader } from "../components/ui/loader"

// Cards
import GenerateTimetable from "../components/cards/GenerateTimetable"
import DisplayTimetable from "../components/cards/display/Timetable"

function Timetable({ isLoading, data, setData }) {
    if (isLoading) {
        return (
            <section
                className="min-h-[calc(100vh-490px)] flex bg-gray-50 p-4 flex-nowrap justify-center items-center"
                aria-busy="true"
                aria-live="polite"
                role="status"
            >
                <div className="text-center">
                    <Loader aria-label="Loading content" />
                </div>
            </section>
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
// Cards
import GenerateTimetable from "../components/cards/GenerateTimetable"
import DisplayTimetable from "../components/cards/display/Timetable"

function Timetable({ isLoading, data, setData }) {
    if (!isLoading) {
        return (
            <>
                <GenerateTimetable data={data} setData={setData} />
                <DisplayTimetable data={data} />
            </>
        );
    }
}

export default Timetable;
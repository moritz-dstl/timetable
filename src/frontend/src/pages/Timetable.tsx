// Cards
import DisplayTimetable from "../components/cards/display/Timetable"

function Timetable({ isLoading, data }) {
    if (!isLoading) {
        return (
            <>
                <DisplayTimetable data={data} />
            </>
        );
    }
}

export default Timetable;
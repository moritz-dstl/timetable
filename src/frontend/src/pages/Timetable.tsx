// Components
import { Loader } from "../components/ui/loader"

// Cards
import GenerateTimetable from "../components/cards/GenerateTimetable"
import DisplayTimetable from "../components/cards/display/Timetable"

/**
 * Allows users to generate and view the current timetable.
 *
 * This element conditionally renders:
 * - A loading spinner while data is being fetched.
 * - A fully interactive timetable interface once data is available.
 *
 * It includes the following sections:
 * - Generate timetable: Allows users to create a new timetable based on current settings.
 * - Display timetable: Shows the generated timetable in a structured format.
 *
 * @param isLoading - Indicates whether data is still being loaded.
 * @param data - The data object.
 * @param setData - React setter for updating the data state.
 *
 * @returns {JSX.Element}
 */
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
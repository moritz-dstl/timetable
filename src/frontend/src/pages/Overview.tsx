// Components
import { Loader } from "../components/ui/loader"

// Cards
import TotalClasses from "../components/cards/totals/Classes"
import TotalTeachers from "../components/cards/totals/Teachers"
import TotalSubjects from "../components/cards/totals/Subjects"

import DisplayUser from "../components/cards/display/User"
import DisplayClasses from "../components/cards/display/Classes"
import DisplayTeachers from "../components/cards/display/Teachers"
import DisplaySubjects from "../components/cards/display/Subjects"

/**
 * Displays a summary of scheduling data.
 *
 * This element conditionally renders:
 * - A loading spinner while data is being fetched.
 * - A set of structured sections showing user details, total counts, and detailed lists once data is available.
 *
 * Sections include:
 * - User Details: Renders user-specific data such as school name and email.
 * - Totals: Cards showing total number of classes, teachers, and subjects.
 * - Summaries: Lists displaying individual classes, teachers, and subjects.
 *
 * @param isLoading - Indicates whether data is still being loaded.
 * @param data - The data object.
 *
 * @returns {JSX.Element}
 */
function Overview({ isLoading, data }) {
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
            <section aria-label="User Details">
                <DisplayUser data={data} />
            </section>
            <section aria-label="Totals" className="mt-4">
                <div className="grid grid-cols-3 gap-3">
                    <TotalClasses data={data} />
                    <TotalTeachers data={data} />
                    <TotalSubjects data={data} />
                </div>
            </section>
            <section aria-label="Summaries" className="mt-4">
                <div className="grid grid-rows xl:grid-cols-3 gap-3">
                    <DisplayClasses data={data} />
                    <DisplayTeachers data={data} />
                    <DisplaySubjects data={data} />
                </div>
            </section>
        </>
    );
}

export default Overview;
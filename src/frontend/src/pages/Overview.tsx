// Cards
import TotalClasses from "../components/cards/totals/Classes"
import TotalTeachers from "../components/cards/totals/Teachers"
import TotalSubjects from "../components/cards/totals/Subjects"

import DisplayUser from "../components/cards/display/User"
import DisplayClasses from "../components/cards/display/Classes"
import DisplayTeachers from "../components/cards/display/Teachers"
import DisplaySubjects from "../components/cards/display/Subjects"

function Overview({ isLoading, data }) {
    if (!isLoading) {
        return (
            <>
                <DisplayUser data={data} />
                <div className="grid grid-cols-3 gap-3">
                    <TotalClasses data={data} />
                    <TotalTeachers data={data} />
                    <TotalSubjects data={data} />
                </div>
                <div className="grid grid-rows xl:grid-cols-3 gap-3">
                    <DisplayClasses data={data} />
                    <DisplayTeachers data={data} />
                    <DisplaySubjects data={data} />
                </div>
            </>
        );
    }
}

export default Overview;
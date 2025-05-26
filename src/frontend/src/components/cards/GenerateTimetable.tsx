// Components
import { Button } from "../ui/button";

// Icons
import { RefreshCw } from "lucide-react";

// Function animates a progress bar, updating its width every second to visually 
// represent the passage of a given duration in seconds.
function runProgressBar(timeRemainingSeconds, totalDurationSeconds) {
    const element = document.querySelector("#progressBar");

    const deltaPercentage = Math.floor((1 / totalDurationSeconds) * 100);
    const percentage = Math.floor((1 - timeRemainingSeconds / totalDurationSeconds) * 100);
    
    element?.animate(
        { width: [`${percentage}%`, `${percentage+deltaPercentage}%`] },
        { duration: 1000, easing: 'linear' }
    );

    if (timeRemainingSeconds > 0) {
        setTimeout(() => {
            runProgressBar(timeRemainingSeconds - 1, totalDurationSeconds);
        }, 1000);
    }
};

function GenerateTimetable({ data, setData }) {
    const handleGenerate = () => {
        setData({ ...data, timetable: { ...data.timetable, isGenerating: true } });

        setTimeout(() => {
            const timetable = {
                isGenerating: false,
                exists: true,
                numOfPeriods: 8,
                classes: ["1A", "2B", "3C"],
                teachers: ["Mr. Smith", "Mrs. Smith"],
                lessons: [
                    {
                        id: 1,
                        day: "Monday",
                        period: 1,
                        class: "1A",
                        subject: "Math",
                        teacher: "Mr. Smith",
                    },
                    {
                        id: 2,
                        day: "Monday",
                        period: 2,
                        class: "1A",
                        subject: "English",
                        teacher: "Mr. Smith",
                    },
                    {
                        id: 3,
                        day: "Monday",
                        period: 3,
                        class: "1A",
                        subject: "Physics",
                        teacher: "Mrs. Smith",
                    },
                    {
                        id: 4,
                        day: "Monday",
                        period: 1,
                        class: "2B",
                        subject: "Chemistry",
                        teacher: "Mrs. Smith",
                    },
                    {
                        id: 5,
                        day: "Tuesday",
                        period: 2,
                        class: "2B",
                        subject: "Science",
                        teacher: "Mrs. Smith",
                    },
                    {
                        id: 6,
                        day: "Wednesday",
                        period: 4,
                        class: "3C",
                        subject: "History",
                        teacher: "Mr. Smith",
                    },
                    {
                        id: 7,
                        day: "Wednesday",
                        period: 5,
                        class: "3C",
                        subject: "English",
                        teacher: "Mr. Smith",
                    },
                    {
                        id: 8,
                        day: "Thursday",
                        period: 6,
                        class: "2B",
                        subject: "Math",
                        teacher: "Mr. Smith",
                    },
                    {
                        id: 9,
                        day: "Friday",
                        period: 7,
                        class: "1A",
                        subject: "Physics",
                        teacher: "Mrs. Smith",
                    },
                    {
                        id: 10,
                        day: "Friday",
                        period: 8,
                        class: "2B",
                        subject: "Chemistry",
                        teacher: "Mrs. Smith",
                    },
                ]
            };

            // When using setTimeout, closures capture the initial state, 
            // so to ensure the latest state is used, update state with a 
            // function that receives the current value.
            setData(prevData => {
                const newData = { ...prevData, timetable: timetable };
                localStorage.setItem("data", JSON.stringify(newData));
                return newData;
            });

        }, data.settings.durationToSolveSeconds * 1000);

        runProgressBar(data.settings.durationToSolveSeconds, data.settings.durationToSolveSeconds);
    }

    return (
        <>
            {/* Message when unsaved changes */}
            {data.newChangesMade && !data.timetable.isGenerating && <p className="text-center text-gray-500">Please save or discard the changes made in settings in order to generate a timetable.</p>}
            {/* Progress bar */}
            {
                data.timetable.isGenerating && (
                    <div className="h-2 w-full bg-orange-200 opacity-50 rounded-full">
                        <div id="progressBar" className="h-2 w-0 bg-primary rounded-full"></div>
                    </div>
                )
            }
            {/* Button */}
            <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={data.timetable.isGenerating || data.newChangesMade}
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${data.timetable.isGenerating && "animate-spin"}`} />
                {data.timetable.isGenerating ? "Generating..." : "Generate Timetable"}
            </Button >
        </>
    );
}

export default GenerateTimetable;
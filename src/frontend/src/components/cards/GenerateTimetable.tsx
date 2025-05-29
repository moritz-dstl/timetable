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
        { width: [`${percentage}%`, `${percentage + deltaPercentage}%`] },
        { duration: 1000, easing: 'linear' }
    );

    if (timeRemainingSeconds > 0) {
        setTimeout(() => {
            runProgressBar(timeRemainingSeconds - 1, totalDurationSeconds);
        }, 1000);
    }
};

function GenerateTimetable({ data, setData }) {
    const handleGenerate = async () => {
        var timetableGenerateID = null;

        // Start generating
        await fetch(`${import.meta.env.VITE_API_ENDPOINT}/start_computing`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => res.json())
            .then((json) => timetableGenerateID = json["job_id"]);

        setData({
            ...data, timetable: {
                isGenerating: true,
                exists: false,
                numOfPeriods: data.settings.numPeriodsPerDay,
                classes: [],
                teachers: [],
                lessons: []
            }
        });

        // Get result after set duration to generate
        setTimeout(async () => {
            const timetable = data.timetable;

            await fetch(`${import.meta.env.VITE_API_ENDPOINT}/status/${timetableGenerateID}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then((res) => res.json())
                .then((json) => {
                    if (json["status"] !== "finished") {
                        setData(prevData => {
                            const newData = { ...prevData, timetable: { ...prevData.timetable, isGenerating: false } };
                            localStorage.setItem("data", JSON.stringify(newData));
                            return newData;
                        });

                        console.error("Failed to generate timetable: not finished.")
                        return;
                    };

                    if (json["result"]["status"] !== "success") {
                        setData(prevData => {
                            const newData = { ...prevData, timetable: { ...prevData.timetable, isGenerating: false } };
                            localStorage.setItem("data", JSON.stringify(newData));
                            return newData;
                        });
                        console.error("Failed to generate timetable: not successfull.")
                        return;
                    };

                    const jsonClasses = json["result"]["classes"];
                    const jsonTeachers = json["result"]["teachers"];

                    timetable.isGenerating = false;
                    timetable.exists = true;
                    timetable.classes = Object.keys(jsonClasses);
                    timetable.teachers = Object.keys(jsonTeachers);

                    var counter = 0;
                    const daysOfWeek = {
                        Mo: "Monday",
                        Tu: "Tuesday",
                        We: "Wednesday",
                        Th: "Thursday",
                        Fr: "Friday"
                    }

                    for (const [className, timetableDays] of Object.entries(jsonClasses)) {
                        for (const [day, lessons] of Object.entries(timetableDays as Array<string>)) {
                            timetable.numOfPeriods = lessons.length;
                            for (const lesson of Object.entries(lessons)) {
                                const period = parseInt(lesson[0]) + 1;
                                const subject = lesson[1].split(' ')[0];
                                const teacher = lesson[1].replace(subject, '').replace(' (', '').replace(')', '');

                                if (subject !== "free") {
                                    timetable.lessons.push({
                                        id: counter,
                                        day: daysOfWeek[day],
                                        period: period,
                                        class: className,
                                        subject: subject,
                                        teacher: teacher
                                    });
                                }

                                counter++;
                            }
                        }
                    }

                    // When using setTimeout, closures capture the initial state, 
                    // so to ensure the latest state is used, update state with a 
                    // function that receives the current value.
                    setData(prevData => {
                        const newData = { ...prevData, timetable: timetable };
                        localStorage.setItem("data", JSON.stringify(newData));
                        return newData;
                    });

                });
        }, data.settings.durationToGenerateSeconds * 1000 + 3000);
        // Add three seconds to duration to make sure the generating is finished
        runProgressBar(data.settings.durationToGenerateSeconds + 3, data.settings.durationToGenerateSeconds + 3);
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
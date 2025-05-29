import { useState, useRef, useEffect } from "react";

// Components
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";

// Icons
import { TriangleAlert, RefreshCw } from "lucide-react";

async function apiGetTimetableAndSetData(data, setData, setError) {
    try {
        await fetch(`${import.meta.env.VITE_API_ENDPOINT}/status/${data.timetable.uuid}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => res.json())
            .then((json) => {
                if (json["status"] !== "finished") {
                    setData(recentData => {
                        const updatedData = {
                            ...recentData,
                            timetable: {
                                ...recentData.timetable,
                                uuid: null,
                                isGenerating: false
                            }
                        };
                        localStorage.setItem("data", JSON.stringify(updatedData));
                        return updatedData;
                    });
                    setError("Failed to generate timetable");
                    return;
                };

                if (json["result"]["status"] !== "success") {
                    setData(recentData => {
                        const updatedData = {
                            ...recentData,
                            timetable: {
                                ...recentData.timetable,
                                uuid: null,
                                isGenerating: false
                            }
                        };
                        localStorage.setItem("data", JSON.stringify(updatedData));
                        return updatedData;
                    });
                    setError("Timetable could not be generated");
                    return;
                };

                const jsonClasses = json["result"]["classes"];
                const jsonTeachers = json["result"]["teachers"];

                const timetable = data.timetable;

                timetable.uuid = null;
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
                setData(recentData => {
                    const updatedData = { ...recentData, timetable: timetable };
                    localStorage.setItem("data", JSON.stringify(updatedData));
                    return updatedData;
                });

            })
            .catch((error) => {
                setError("An error occured");
                setData(recentData => {
                    const updatedData = {
                        ...recentData,
                        timetable: {
                            ...recentData.timetable,
                            uuid: null,
                            isGenerating: false
                        }
                    };
                    localStorage.setItem("data", JSON.stringify(updatedData));
                    return updatedData;
                });
            });
    } catch (error) {
        console.error(error);
        setError("An error occured");
        setData(recentData => {
            const updatedData = {
                ...recentData,
                timetable: {
                    ...recentData.timetable,
                    uuid: null,
                    isGenerating: false
                }
            };
            localStorage.setItem("data", JSON.stringify(updatedData));
            return updatedData;
        });
    }
}

// Function animates a progress bar by updating its width and sets remaining time in HH:MM:SS
// every second to visually represent the duration for generating.
async function runProgressBar(data, setData, setError) {
    // Add three seconds to duration to make sure the generating is finished
    const durationToGenerateSeconds = data.timetable.durationToGenerateSeconds + 3;
    const timestampGeneratingStart = data.timetable.timestampGeneratingStart;

    const timestampNow = new Date().getTime();
    const timestampFinished = timestampGeneratingStart + durationToGenerateSeconds * 1000;

    // Done generating -> Set data to get result in useEffect
    if (timestampNow > timestampFinished) {
        setData(recentData => {
            const updatedData = { ...recentData, timetable: { ...recentData.timetable, isGenerating: false } };
            localStorage.setItem("data", JSON.stringify(updatedData));
            return updatedData;
        });
        return;
    }

    const timeElapsed = timestampNow - timestampGeneratingStart;
    const timeElapsedSeconds = Math.floor(timeElapsed / 1000);
    const timeRemainingSeconds = Math.floor((timestampFinished - timestampNow) / 1000)
    const deltaPercentage = Math.floor((1 / durationToGenerateSeconds) * 100);
    const percentage = Math.floor((timeElapsedSeconds / durationToGenerateSeconds) * 100);

    const elementTime = document.querySelector("#timeRemaining");
    const elementBar = document.querySelector("#progressBar");

    // Set remaining time HH:MM:SS
    if (elementTime) elementTime.innerHTML = new Date(timeRemainingSeconds * 1000).toISOString().slice(11, 19);

    // Animate width
    if (elementBar) elementBar.animate(
        { width: [`${percentage}%`, `${percentage + deltaPercentage}%`] },
        { duration: 1000, easing: 'linear' }
    );

    setTimeout(() => {
        runProgressBar(data, setData, setError);
    }, 1000);
};

function GenerateTimetable({ data, setData }) {
    const [error, setError] = useState("");

    // Use a ref to access the current count value in an async callback.
    const dataRef = useRef(data);
    dataRef.current = data;

    if (data.timetable.isGenerating) {
        runProgressBar(dataRef.current, setData, setError);
    }

    // Get timetable from API when done generating.
    // Timetable uuid is set to null when generating failed or done fetching.
    useEffect(() => {
        if (!data.timetable.isGenerating && data.timetable.uuid) {
            apiGetTimetableAndSetData(dataRef.current, setData, setError);
        }
    }, [dataRef.current.timetable.isGenerating]);


    const handleGenerate = async () => {
        setError("");

        // Reset timetable data
        const updatedData = {
            ...data, timetable: {
                ...data.timetable,
                uuid: null,
                isGenerating: true,
                durationToGenerateSeconds: 3 * data.classes.length ** 2 + 2 * data.classes.length + 30,
                timestampGeneratingStart: new Date().getTime(),
                exists: false,
                classes: [],
                teachers: [],
                lessons: []
            }
        }

        setData(updatedData);
        localStorage.setItem("data", JSON.stringify(updatedData));

        try {
            // Start generating
            await fetch(`${import.meta.env.VITE_API_ENDPOINT}/start_computing`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then((res) => res.json())
                .then((json) => {
                    setData(recentData => {
                        const updatedData = { ...recentData, timetable: { ...recentData.timetable, uuid: json["job_id"] } };
                        localStorage.setItem("data", JSON.stringify(updatedData));
                        return updatedData;
                    });
                })
                .catch((error) => {
                    setError("An error occured");
                    setData(recentData => {
                        const updatedData = { ...recentData, timetable: { ...recentData.timetable, isGenerating: false } };
                        localStorage.setItem("data", JSON.stringify(updatedData));
                        return updatedData;
                    }); return;
                });
        } catch (error) {
            console.error(error);
            setError("An error occured");
            setData(recentData => {
                const updatedData = { ...recentData, timetable: { ...recentData.timetable, isGenerating: false } };
                localStorage.setItem("data", JSON.stringify(updatedData));
                return updatedData;
            }); return;
        }
    }

    return (
        <>
            {/* Show alert if error */}
            {error && (
                <Alert variant="destructive" className="flex items-center justify-center p-1">
                    <div className="flex items-center">
                        <TriangleAlert className="h-4 w-4 mr-3" />
                        <AlertDescription>{error}</AlertDescription>
                    </div>
                </Alert>
            )}
            {/* Message when unsaved changes */}
            {
                data.newChangesMade && !data.timetable.isGenerating && <p className="text-center text-gray-500">Please save or discard the changes made in settings in order to generate a timetable.</p>
            }
            {/* Progress bar */}
            {
                data.timetable.isGenerating && (
                    <div className="w-full text-center">
                        <p id="timeRemaining">00:00:00</p>
                        <div className="h-2 w-full bg-orange-200 opacity-50 rounded-full text-center">
                            <div id="progressBar" className="h-2 w-0 bg-primary rounded-full"></div>
                        </div>
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
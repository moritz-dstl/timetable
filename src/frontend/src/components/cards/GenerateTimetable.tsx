import { useState, useRef } from "react";

// Components
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";

// Icons
import { TriangleAlert, RefreshCw } from "lucide-react";

enum API_GENERATE_STATUS { RUNNING, SUCCESS, FAILED, ERROR };

// Gets the status of the timetable generation and returns a dictiary with a 
// API_GENERATE_STATUS and if successfull the timetable.
// Take in a reference to the data.
async function apiGetTimetable(dataRef) {
    var response = {
        status: API_GENERATE_STATUS.RUNNING,
        timetable: {}
    };

    try {
        await fetch(`${import.meta.env.VITE_API_ENDPOINT}/status/${dataRef.current.timetable.uuid}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => {
                if (!res.ok) {
                    response.status = API_GENERATE_STATUS.ERROR;
                    return;
                }
                return res.json();
            })
            .then((json) => {
                if (json["status"] !== "finished") {
                    response.status = API_GENERATE_STATUS.RUNNING;
                    return;
                };

                if (json["result"]["status"] !== "success") {
                    response.status = API_GENERATE_STATUS.FAILED;
                    return;
                };

                const jsonClasses = json["result"]["classes"];
                const jsonTeachers = json["result"]["teachers"];

                const timetable = dataRef.current.timetable;

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

                response.status = API_GENERATE_STATUS.SUCCESS;
                response.timetable = timetable;
            })
            .catch((error) => {
                response.status = API_GENERATE_STATUS.ERROR;
            });
    } catch (error) {
        console.error(error);
        response.status = API_GENERATE_STATUS.ERROR;
    } finally {
        return response;
    }
}

// Checks on the status of the generation and acts accordingly.
// Stops when set duration to generate is exceeded. 
// It also animates a progress bar by updating its width and sets remaining time in HH:MM:SS
// every second to visually represent the duration for generating.
// Params: 
//  - dataRef: reference to the data
//  - setData
//  - setError
async function runGenerateCheckAndProgress(dataRef, setData, setError) {
    if (!dataRef.current.timetable.uuid) {
        return;
    }

    const checkFreqencySeconds = 20;

    const durationToGenerateSeconds = dataRef.current.timetable.durationToGenerateSeconds;
    const timestampGeneratingStart = dataRef.current.timetable.timestampGeneratingStart;

    const timestampNow = new Date().getTime();
    const timestampFinished = timestampGeneratingStart + durationToGenerateSeconds * 1000;
    const timeElapsed = timestampNow - timestampGeneratingStart;
    const timeElapsedSeconds = Math.floor(timeElapsed / 1000);
    const timeRemainingSeconds = Math.floor((timestampFinished - timestampNow) / 1000)

    const deltaPercentage = Math.floor((1 / durationToGenerateSeconds) * 100);
    const percentage = Math.floor((timeElapsedSeconds / durationToGenerateSeconds) * 100);

    const setDurationToGeneratePassed = timestampNow > timestampFinished;

    if (timeRemainingSeconds % checkFreqencySeconds === 0 || setDurationToGeneratePassed) {
        const res = await apiGetTimetable(dataRef);

        if (res.status === API_GENERATE_STATUS.RUNNING && setDurationToGeneratePassed) {
            setError("Timetable could not be generated");
            setData(recentData => {
                const updatedData = {
                    ...recentData,
                    timetable: { ...recentData.timetable, uuid: null, isGenerating: false }
                };
                localStorage.setItem("data", JSON.stringify(updatedData));
                return updatedData;
            });
            return;
        }
        else if (res.status === API_GENERATE_STATUS.ERROR) {
            setError("An error occured");
            setData(recentData => {
                const updatedData = {
                    ...recentData,
                    timetable: { ...recentData.timetable, uuid: null, isGenerating: false }
                };
                localStorage.setItem("data", JSON.stringify(updatedData));
                return updatedData;
            });
            return;
        }
        else if (res.status === API_GENERATE_STATUS.FAILED) {
            setError("Failed to generate timetable");
            setData(recentData => {
                const updatedData = {
                    ...recentData,
                    timetable: { ...recentData.timetable, uuid: null, isGenerating: false }
                };
                localStorage.setItem("data", JSON.stringify(updatedData));
                return updatedData;
            });
            return;
        }
        else if (res.status === API_GENERATE_STATUS.SUCCESS) {
            setData(recentData => {
                const updatedData = { ...recentData, timetable: res.timetable };
                localStorage.setItem("data", JSON.stringify(updatedData));
                return updatedData;
            });
            return;
        }
    }

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
        runGenerateCheckAndProgress(dataRef, setData, setError);
    }, 1000);
};

function GenerateTimetable({ data, setData }) {
    const [error, setError] = useState("");

    // Use a ref to access the current data value in an async function
    const dataRef = useRef(data);
    dataRef.current = data;

    if (data.timetable.isGenerating) {
        runGenerateCheckAndProgress(dataRef, setData, setError);
    }

    const handleStartGenerate = async () => {
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
                onClick={handleStartGenerate}
                disabled={data.timetable.isGenerating || data.newChangesMade}
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${data.timetable.isGenerating && "animate-spin"}`} />
                {data.timetable.isGenerating ? "Generating..." : "Generate Timetable"}
            </Button >
        </>
    );
}

export default GenerateTimetable;
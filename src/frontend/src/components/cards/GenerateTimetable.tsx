import { useState } from "react";

// Components
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

// Icons
import { TriangleAlert, RefreshCw } from "lucide-react";

// Enums
enum API_GENERATE_STATUS { RUNNING, SUCCESS, FAILED, ERROR };
enum FUNC_GENERATING_FLAG { NONE, START_PROGRESS_BAR };

/**
 * Gets the status of the timetable generation and returns a dictiary with a 
 * API_GENERATE_STATUS and if successfull the timetable (classes, teachers, lessons).
 * Take in a the uuid of the generating timetable.
 */
async function apiGetTimetable(uuid) {
    var response = {
        status: API_GENERATE_STATUS.RUNNING,
        timetable: {}
    };

    try {
        await fetch(`${import.meta.env.VITE_API_ENDPOINT}/status/${uuid}`, {
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

                const timetable = {
                    classes: Object.keys(jsonClasses),
                    teachers: Object.keys(jsonTeachers),
                    lessons: Array<any>()
                };

                var idCounter = 0;
                const daysOfWeek = {
                    Mo: "Monday",
                    Tu: "Tuesday",
                    We: "Wednesday",
                    Th: "Thursday",
                    Fr: "Friday"
                }

                for (const [className, timetableDays] of Object.entries(jsonClasses)) {
                    for (const [day, lessons] of Object.entries(timetableDays as Array<string>)) {
                        for (const lesson of Object.entries(lessons)) {
                            const period = parseInt(lesson[0]) + 1;
                            const subject = lesson[1].split(' ')[0];
                            const teacher = lesson[1].replace(subject, '').replace(' (', '').replace(')', '');

                            if (subject !== "free") {
                                timetable.lessons.push({
                                    id: ++idCounter,
                                    day: daysOfWeek[day],
                                    period: period,
                                    class: className,
                                    subject: subject,
                                    teacher: teacher
                                });
                            }
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

/**
 * Periodically polls the timetable generation status from the API.
 * Handles success and failure scenarios, updating states accordingly.
 * Also animates the progress bar animation and displays the remaining time in HH:MM:SS format.
 * 
 * @param {int} flag FUNC_GENERATING_FLAG
 * @param {Object} timetable
 *  {
 *      uuid [string],
 *      durationToGenerateSeconds [int],
 *      timestampGeneratingStart [int]
 *  }
 * @param {Object} setters 
 *  {
 *      setData,
 *      setIsGenerating,
 *      setError
 *  }
 */
async function pollTimetableGenerationStatus(flag, timetable, setters) {
    const checkFreqencySeconds = 20;

    const timestampNow = new Date().getTime();
    const timestampFinished = timetable.timestampGeneratingStart + timetable.durationToGenerateSeconds * 1000;
    const timeRemainingSeconds = Math.floor((timestampFinished - timestampNow) / 1000)

    const setDurationToGenerateHasPassed = timestampNow > timestampFinished;

    // Frequency to check OR generating ended
    if (timeRemainingSeconds % checkFreqencySeconds === 0 || setDurationToGenerateHasPassed) {
        const res = await apiGetTimetable(timetable.uuid);

        if (res.status === API_GENERATE_STATUS.RUNNING && setDurationToGenerateHasPassed) {
            setters.setError("Timetable could not be generated");
            setters.setIsGenerating(false);
            return;
        }
        else if (res.status === API_GENERATE_STATUS.ERROR) {
            setters.setError("An error occured");
            setters.setIsGenerating(false);
            return;
        }
        else if (res.status === API_GENERATE_STATUS.FAILED) {
            setters.setError("Failed to generate timetable");
            setters.setIsGenerating(false);
            return;
        }
        else if (res.status === API_GENERATE_STATUS.SUCCESS) {
            setters.setData((data) => {
                const updatedData = {
                    ...data,
                    timetable: {
                        ...data.timetable,
                        exists: true,
                        ...res.timetable
                    }
                };
                localStorage.setItem("data", JSON.stringify(updatedData));
                return updatedData;
            });
            setters.setIsGenerating(false);
            return;
        }
    }

    // Set remaining time HH:MM:SS
    const elementTime = document.querySelector("#timeRemaining");
    if (elementTime) elementTime.innerHTML = new Date(timeRemainingSeconds * 1000).toISOString().slice(11, 19);

    // Animate width
    if (flag === FUNC_GENERATING_FLAG.START_PROGRESS_BAR) {
        const elementBar = document.querySelector("#progressBar");
        if (elementBar) elementBar.animate(
            { width: ["0%", "100%"] },
            { duration: (timeRemainingSeconds + 1) * 1000, easing: 'linear' }
        );
    }

    setTimeout(() => {
        pollTimetableGenerationStatus(FUNC_GENERATING_FLAG.NONE, timetable, setters);
    }, 1000);
}

function GenerateTimetable({ data, setData }) {
    const [error, setError] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleStartGenerate = async () => {
        setError("");
        setIsGenerating(true);

        // Reset timetable data
        const updatedData = {
            ...data, timetable: {
                ...data.timetable,
                exists: false,
                classes: [],
                teachers: [],
                lessons: []
            }
        };
        setData(updatedData);
        localStorage.setItem("data", JSON.stringify(updatedData));

        try {
            // Try to start generating
            await fetch(`${import.meta.env.VITE_API_ENDPOINT}/start_computing`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then((res) => res.json())
                .then((json) => {
                    // Generating started
                    pollTimetableGenerationStatus(
                        FUNC_GENERATING_FLAG.START_PROGRESS_BAR,
                        {
                            uuid: json["job_id"],
                            durationToGenerateSeconds: data.timetable.durationToGenerateSeconds,
                            timestampGeneratingStart: new Date().getTime(),
                        },
                        {
                            setData: setData,
                            setIsGenerating: setIsGenerating,
                            setError: setError,
                        }
                    );
                })
                .catch((error) => {
                    setError("An error occured");
                    setIsGenerating(false);
                });

        } catch (error) {
            console.error(error);
            setError("An error occured");
            setIsGenerating(false);
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
                data.newChangesMade && <p className="text-center text-gray-500">Please save or discard the changes made in settings in order to generate a timetable.</p>
            }
            {/* Button */}
            <Button
                className="w-full"
                onClick={handleStartGenerate}
                disabled={isGenerating || data.newChangesMade}
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating && "animate-spin"}`} />
                {isGenerating ? "Generating..." : "Generate Timetable"}
            </Button >

            {/* Generating dialog */}
            <Dialog open={isGenerating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex flex-row items-center">
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </DialogTitle>
                        <DialogDescription>
                            Please do not reload this page!
                        </DialogDescription>
                    </DialogHeader>
                    {/* Progress bar */}
                    <div className="w-full text-center">
                        <p id="timeRemaining">__:__:__</p>
                        <div className="h-2 w-full mt-2 bg-orange-200 rounded-full">
                            <div id="progressBar" className="h-2 w-0 bg-primary rounded-full"></div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default GenerateTimetable;
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
import { TriangleAlertIcon, RefreshCwIcon } from "lucide-react";

// Enums
enum API_GENERATE_STATUS { RUNNING, SUCCESS, FAILED, ERROR };
enum FUNC_GENERATING_FLAG { NONE, START_PROGRESS_BAR };

/**
 * Retrieves the status of timetable generation from the API using the provided UUID.

 * @param uuid - The unique identifier for the timetable generation job.
 * @returns An object with the status and, if successful, the timetable 
 *          data (numPeriods, classes, teachers, lessons).
 */
async function apiGetTimetable(uuid: string) {
    var response = {
        status: API_GENERATE_STATUS.RUNNING,
        timetable: {}
    };

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
                numPeriods: 0,  // Set in loop
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
                    timetable.numPeriods = lessons.length;
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
            console.error(error);
            response.status = API_GENERATE_STATUS.ERROR;
        });

    return response;
}

/**
 * Polls the API at regular intervals to check the status of timetable generation.
 * Updates UI state based on the API response, including handling errors and completion.
 * Manages progress bar animation and displays the remaining generation time in HH:MM:SS format.
 *
 * @param flag - Indicates whether to start the progress bar animation (FUNC_GENERATING_FLAG).
 * @param timetable - Object containing uuid, durationToGenerateSeconds, and timestampGeneratingStart.
 * @param setters - Object with setData, setIsGenerating, and setError functions for state management.
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
    const elementTime = document.querySelector("#generate-time-remaining");
    if (elementTime) elementTime.innerHTML = new Date(timeRemainingSeconds * 1000).toISOString().slice(11, 19);

    // Animate width
    if (flag === FUNC_GENERATING_FLAG.START_PROGRESS_BAR) {
        const elementBar = document.querySelector("#progress-bar");
        if (elementBar) elementBar.animate(
            { width: ["0%", "100%"] },
            { duration: (timeRemainingSeconds + 1) * 1000, easing: 'linear' }
        );
    }

    setTimeout(() => {
        pollTimetableGenerationStatus(FUNC_GENERATING_FLAG.NONE, timetable, setters);
    }, 1000);
}

/**
 * Initiates and manages timetable generation process.
 *
 * This component handles:
 * - Live polling of the backend to track job status.
 * - Dynamic UI updates including error handling, progress bar animation, and countdown timer.
 *
 * It includes the following elements:
 * - Error alert: Displays error messages returned from the API.
 * - Info message: Informs users about unsaved changes that block generation.
 * - Generate button: Starts the generation process.
 * - Progress dialog: Shows generation status with a live countdown and animated progress bar.
 *
 * @param data - The data object.
 * @param setData - React setter for updating the data state.
 *
 * @returns {JSX.Element}
 */
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
                console.error(error);
                setError("An error occured");
                setIsGenerating(false);
            });
    }

    return (
        <>
            {/* Show alert if error */}
            {error && (
                <Alert aria-label={error} variant="destructive" className="flex items-center justify-center p-1">
                    <div className="flex items-center" aria-hidden={true}>
                        <TriangleAlertIcon className="h-4 w-4 mr-3" aria-hidden={true} />
                        <AlertDescription>{error}</AlertDescription>
                    </div>
                </Alert>
            )}
            {/* Message when unsaved changes */}
            {
                data.newChangesMade && <p id="content-timetable-msg-unsaved-changes" aria-labelledby="content-timetable-msg-unsaved-changes" className="text-center text-gray-500">Please save or discard the changes made in settings in order to generate a timetable.</p>
            }
            {/* Button */}
            <Button
                id="timetable-generate-button"
                className="w-full"
                onClick={handleStartGenerate}
                disabled={isGenerating || data.newChangesMade}
                tabIndex={10}
                aria-label="Generate Timetable"
            >
                <RefreshCwIcon className={`mr-2 h-4 w-4 ${isGenerating && "animate-spin"}`} aria-hidden={true} />
                {isGenerating ? "Generating..." : "Generate Timetable"}
            </Button >

            {/* Generating dialog */}
            <Dialog open={isGenerating} aria-modal={true}>
                {/* Visually hidden DialogTitle for accessibility */}
                <DialogTitle asChild>
                    <span className="sr-only">Generating Timetable</span>
                </DialogTitle>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle
                            id="generating-dialog-title"
                            className="flex flex-row items-center"
                        >
                            <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" aria-hidden={true} />
                            Generating...
                        </DialogTitle>
                        <DialogDescription id="generating-dialog-description" aria-labelledby="generating-dialog-description">
                            Please do not reload this page!
                        </DialogDescription>
                    </DialogHeader>
                    {/* Progress bar */}
                    <div className="w-full text-center" aria-label="Time remaining">
                        <p id="generate-time-remaining" aria-labelledby="generate-time-remaining" aria-live="polite" aria-atomic={true}>__:__:__</p>
                        <div className="h-2 w-full mt-2 bg-orange-200 rounded-full" aria-hidden={true}>
                            <div id="progress-bar" className="h-2 w-0 bg-primary rounded-full"></div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default GenerateTimetable;
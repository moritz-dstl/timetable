import { useState } from "react";

// Components
import { Button } from "../../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import { Alert, AlertDescription } from "../../ui/alert";

// Icons
import { TriangleAlertIcon, EraserIcon, SaveIcon } from "lucide-react";

/**
 * Calculates the estimated duration in seconds required to generate a timetable,
 * based on the number of classes provided.
 *
 * @param numOfClasses - The number of classes in the timetable.
 * @returns The estimated duration in seconds.
 */
function getDurationToGenerateSeconds(numOfClasses: number) {
    return Math.floor((3 * numOfClasses ** 2 + 2 * numOfClasses + 30) * 1.2);
}

/**
 * Sends the provided data to the API to save the current settings.
 *
 * @param data - The data object.
 * @returns A boolean indicating whether the save operation was successful.
 */
async function apiSaveData(data) {
    var apiDataBody = {
        settings: {
            prefer_early_hours: data.settings.preferEarlyPeriods,
            allow_block_scheduling: data.settings.preferDoubleLessons,
            max_hours_per_day: data.settings.maxRepetitionsSubjectPerDay,
            global_break: data.settings.breakAtPeriod,
            weight_block_scheduling: 10,
            weight_time_of_hours: 10,
            max_time_for_solving: getDurationToGenerateSeconds(data.classes.length),
        },
        school: {
            classes: data.classes.map((classItem) => classItem.name),
            subjects: data.subjects.map((subjectItem) => subjectItem.name),
            hours_per_day: data.settings.numPeriods
        },
        teachers: data.teachers.map((teacherItem) => ({
            name: teacherItem.name,
            max_hours: teacherItem.maxHoursPerWeek,
            subjects: teacherItem.subjects
        })),
        class_allocations:
            data.classes.map((classItem) => (
                classItem.subjects.map((subjectItem) => ({
                    class_name: classItem.name,
                    subject: subjectItem.name,
                    hours_per_week: subjectItem.hoursPerWeek
                }))
            )).flat(),
        subject_parallel_limits:
            data.subjects
                .filter((subjectItem) => subjectItem.maxParallel != 0)
                .map((subjectItem) => ({
                    subject_name: subjectItem.name,
                    max_parallel: subjectItem.maxParallel
                })),
        prefer_block_subjects:
            data.subjects
                .filter((subjectItem) => subjectItem.forceDoubleLesson)
                .map((subjectItem) => ({
                    subject_name: subjectItem.name,
                    weight: 60
                }))
    };

    var responseStatusSuccess = true;

    await fetch(`${import.meta.env.VITE_API_ENDPOINT}/Settings/set`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(apiDataBody)
    })
        .then((res) => { responseStatusSuccess = res.ok })
        .catch((error) => { 
            console.error(error);
            responseStatusSuccess = false;
        });

    return responseStatusSuccess;
}

/**
 * Provides UI controls to either discard or save changes to the app settings.
 *
 * This component includes:
 * - A "Discard" button that reverts to the last saved settings from localStorage.
 * - A "Save" button that formats and sends the updated data to the API.
 * - Dialog for confirming discard actions.
 * - Alert feedback when errors occur during the save process.
 *
 * @param data - The data object.
 * @param setData - React setter for updating the data state.
 *
 * @returns {JSX.Element | undefined}
 */
function SettingsDiscardSave({ data, setData }) {
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

    const handleDiscard = () => {
        setError("");
        const storedData = localStorage.getItem("data");
        if (storedData) setData({ ...JSON.parse(storedData), newChangesMade: false });
        setIsDiscardDialogOpen(false);
        setTimeout(() => {
            document.querySelector<HTMLElement>("#tab-settings")?.focus();
        }, 100);
    }

    const handleSave = async () => {
        setError("");
        setIsSaving(true);

        try {
            // Wait 500ms for loading effect
            await new Promise((resolve) => setTimeout(resolve, 500));
            const responseStatusSuccess = await apiSaveData(data);

            if (responseStatusSuccess) {
                const updatedData = {
                    ...data,
                    newChangesMade: false,
                    timetable: {
                        ...data.timetable,
                        durationToGenerateSeconds: getDurationToGenerateSeconds(data.classes.length)
                    }
                }
                setData(updatedData);
                localStorage.setItem("data", JSON.stringify(updatedData));
            }
            else {
                setError("Data could not be saved");
            }
        } catch (error) {
            console.error(error);
            setError("An error occurred");
        } finally {
            setIsSaving(false);
            setTimeout(() => {
                document.querySelector<HTMLElement>("#tab-settings")?.focus();
            }, 100);
        }
    }

    if (data.newChangesMade) {
        return (
            <div>
                <div className="flex flex-row gap-4 align-center justify-end">
                    {/* Discard button */}
                    <Button
                        id="settings-button-discard"
                        variant="outline"
                        onClick={() => setIsDiscardDialogOpen(true)}
                        aria-label="Discard"
                        tabIndex={0}
                    >
                        <EraserIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                        Discard
                    </Button>

                    {/* Save button */}
                    <Button
                        id="settings-button-save"
                        onClick={handleSave}
                        disabled={isSaving}
                        aria-label="Save"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === "Tab") {
                                event.preventDefault();
                                document.querySelector<HTMLElement>("#content-settings-general")?.focus();
                            }
                        }}
                    >
                        <SaveIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>

                {/* Show alert if error */}
                {error && (
                    <Alert aria-label={error} variant="destructive" className="flex items-center justify-center p-1">
                        <div className="flex items-center" aria-hidden={true}>
                            <TriangleAlertIcon className="h-4 w-4 mr-3" />
                            <AlertDescription>{error}</AlertDescription>
                        </div>
                    </Alert>
                )}

                {/* Delete dialog */}
                <Dialog open={isDiscardDialogOpen} aria-modal={true}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle aria-label="Discard">Discard</DialogTitle>
                            <DialogDescription id="dialog-discard-description" aria-labelledby="dialog-discard-description">
                                Are you sure you want to discard all changes?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                            <Button
                                className="col-span-2"
                                variant="outline"
                                onClick={() => {
                                    setIsDiscardDialogOpen(false);
                                    setTimeout(() => {
                                        document.querySelector<HTMLElement>("#tab-settings")?.focus();
                                    }, 100);
                                }}
                                aria-label="Cancel"
                                tabIndex={0}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="col-span-2"
                                onClick={handleDiscard}
                                aria-label="Discard"
                                tabIndex={0}
                            >
                                Discard
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}

export default SettingsDiscardSave;
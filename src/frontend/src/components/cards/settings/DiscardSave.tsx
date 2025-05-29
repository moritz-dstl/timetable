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
import { TriangleAlert, Eraser, Save } from "lucide-react";

async function apiSaveData(data) {
    var apiDataBody = {
        settings: {
            prefer_early_hours: data.settings.preferEarlyPeriods,
            allow_block_scheduling: data.settings.allowDoubleLessons,
            max_hours_per_day: data.settings.maxRepetitionsSubjectPerDay,
            max_consecutive_hours: data.settings.maxConsecutivePeriods,
            break_window_start: data.settings.breakWindow.start,
            break_window_end: data.settings.breakWindow.end,
            weight_block_scheduling: 10,
            weight_time_of_hours: 10,
            max_time_for_solving: 3 * data.classes.length ** 2 + 2 * data.classes.length + 30,
        },
        school: {
            classes: data.classes.map((classItem) => classItem.name),
            subjects: data.subjects.map((subjectItem) => subjectItem.name),
            hours_per_day: data.settings.numPeriodsPerDay
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
        .catch((error) => { responseStatusSuccess = false });

    return responseStatusSuccess;
}

function SettingsDiscardSave({ data, setData }) {
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

    const handleDiscard = () => {
        setError("");
        const storedData = localStorage.getItem("data");
        if (storedData) setData({ ...JSON.parse(storedData), newChangesMade: false });
        setIsDiscardDialogOpen(false);
    }

    const handleSave = async () => {
        setError("");
        setIsSaving(true);

        try {
            // Wait 500ms for loading effect
            await new Promise((resolve) => setTimeout(resolve, 500));
            const responseStatusSuccess = await apiSaveData(data);

            if (responseStatusSuccess) {
                setData({ ...data, newChangesMade: false });
                localStorage.setItem("data", JSON.stringify({ ...data, newChangesMade: false }));
            }
            else {
                setError("Data could not be saved");
            }
        } catch (error) {
            console.error(error);
            setError("An error occurred");
        } finally {
            setIsSaving(false);
        }
    }

    if (data.newChangesMade) {
        return (
            <>
                <div className="flex flex-row gap-4 align-center justify-end">
                    {/* Discard button */}
                    <Button variant="outline" onClick={() => setIsDiscardDialogOpen(true)} disabled={data.timetable.isGenerating}>
                        <Eraser className="mr-2 h-4 w-4" />
                        Discard
                    </Button>

                    {/* Save button */}
                    <Button onClick={handleSave} disabled={isSaving || data.timetable.isGenerating}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>

                {/* Show alert if error */}
                {error && (
                    <Alert variant="destructive" className="flex items-center justify-center p-1">
                        <div className="flex items-center">
                            <TriangleAlert className="h-4 w-4 mr-3" />
                            <AlertDescription>{error}</AlertDescription>
                        </div>
                    </Alert>
                )}

                {/* Delete dialog */}
                <Dialog open={isDiscardDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Discard</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to discard all changes?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                            <Button className="col-span-2" variant="outline" onClick={() => setIsDiscardDialogOpen(false)}>Cancel</Button>
                            <Button className="col-span-2" onClick={handleDiscard}>Discard</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
}

export default SettingsDiscardSave;
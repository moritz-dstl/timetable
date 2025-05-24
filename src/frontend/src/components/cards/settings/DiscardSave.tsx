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

// Icons
import { Eraser, Save } from "lucide-react";

function SettingsDiscardSave({ data, setData }) {
    const [isSaving, setIsSaving] = useState(false);
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

    // Handle add subject
    const handleOpenDiscardDialog = () => {
        setIsDiscardDialogOpen(true);
    }

    const handleDiscard = () => {
        setData({...data, newChangesMade: false});
        window.location.reload();
    }

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({...data, newChangesMade: false});
        setIsSaving(false);
    }

    if (data.newChangesMade) {
        return (
            <>
                <div className="flex flex-row gap-4 justify-end">
                    {/* Discard button */}
                    <Button variant="outline" onClick={handleOpenDiscardDialog}>
                        <Eraser className="mr-2 h-4 w-4" />
                        Discard
                    </Button>

                    {/* Save button */}
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save"}
                    </Button>

                </div>

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
import { useState } from "react";

// Components
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../ui/card";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";

// Icons
import {
    PlusCircleIcon,
    SearchIcon,
    EditIcon,
    Trash2Icon
} from "lucide-react";

function SettingsSubjects({ data, setData }) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState<any>({});

    // Array of all used subjects
    // Unused subjects can be deleted
    const usedSubjectsClasses = data.classes.map((classItem) => (classItem.subjects.map((subject) => (subject.name)))).flat();
    const usedSubjectsTeachers = data.teachers.map((teacherItem) => teacherItem.subjects).flat();
    // Concat and remove duplicates
    const usedSubjects = [...new Set(usedSubjectsClasses.concat(usedSubjectsTeachers))];

    // Filter subjects for search
    const filteredSubjects = data.subjects.filter((subjectItem) => subjectItem.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Handle add subject
    const handleOpenAddDialog = () => {
        setIsAddDialogOpen(true);
        setSelectedSubject({
            id: new Date().getTime(),
            name: "",
            maxParallel: 0,
            forceDoubleLesson: false,
        });
    }

    const handleAddConfirm = () => {
        // Name cannot be duplicate -> Rename with counter
        let name = selectedSubject.name;
        const existingNames = data.subjects.map((subjectItem) => subjectItem.name);
        let counter = 1;
        while (existingNames.includes(name)) {
            name = `${selectedSubject.name} (${counter})`;
            counter++;
        }
        selectedSubject.name = name;

        setData({
            ...data,
            newChangesMade: true,
            // Sort by name
            subjects: [...data.subjects, selectedSubject].sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)),
        });

        setIsAddDialogOpen(false);
        setTimeout(() => {
            document.querySelector<HTMLElement>("#content-settings-subjects")?.focus();
        }, 100);
    }

    // Handle edit subject
    const handleOpenEditDialog = (subjectItem) => {
        setIsEditDialogOpen(true);
        setSelectedSubject(subjectItem);
    }

    const handleEditConfirm = () => {
        const updatedSubjects = data.subjects.map((subjectItem) => (subjectItem.id === selectedSubject.id ? selectedSubject : subjectItem));

        // Name cannot be duplicate -> Rename with counter
        let name = selectedSubject.name;
        const existingNames = data.subjects.map((subjectItem) => selectedSubject.id !== subjectItem.id && subjectItem.name);
        let counter = 1;
        while (existingNames.includes(name)) {
            name = `${selectedSubject.name} (${counter})`;
            counter++;
        }
        selectedSubject.name = name;

        setData({
            ...data,
            newChangesMade: true,
            // Sort by name
            subjects: updatedSubjects.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)),
        });

        setIsEditDialogOpen(false);
        setTimeout(() => {
            document.querySelector<HTMLElement>("#content-settings-subjects")?.focus();
        }, 100);
    }

    // Handle delete subject
    const handleOpenDeleteDialog = (subjectItem) => {
        setIsDeleteDialogOpen(true);
        setSelectedSubject(subjectItem);
    }

    const handleDelete = () => {
        const updatedSubjects = data.subjects.filter((subjectItem) => subjectItem.id !== selectedSubject.id);
        setData({
            ...data,
            newChangesMade: true,
            subjects: updatedSubjects
        });
        setIsDeleteDialogOpen(false);
        setTimeout(() => {
            document.querySelector<HTMLElement>("#content-settings-subjects")?.focus();
        }, 100);
    }

    // The content of the dialog for add and edit is the same
    const addEditDialogContent = (
        <>
            <div className="grid grid-cols-6 gap-4">
                {/* Input: Name */}
                <div className="col-span-4">
                    <Label aria-hidden={true}>Name</Label>
                    <Input
                        id="subject-name-input"
                        aria-label="Subject name input"
                        className="mt-2"
                        value={selectedSubject.name}
                        onChange={(e) => setSelectedSubject({ ...selectedSubject, name: e.target.value.trimStart() })}
                        tabIndex={39}
                    />
                </div>
                {/* Input: Max parallel */}
                <div className="col-span-2">
                    <Label aria-hidden={true}>Max. in parallel</Label>
                    <Input
                        type="number"
                        min={0}
                        className="w-full mt-2"
                        aria-label="Maximum possible in parallel"
                        value={selectedSubject.maxParallel == 0 ? "" : selectedSubject.maxParallel}
                        onChange={(e) => setSelectedSubject({
                            ...selectedSubject,
                            maxParallel: isNaN(parseInt(e.target.value)) || parseInt(e.target.value) < 0 ? 0 : parseInt(e.target.value)
                        })}
                        tabIndex={39}
                    />
                </div>
                {/* Switch: Force double lesson */}
            </div>
            <div className="flex flex-row items-center gap-3">
                <Switch
                    aria-label="Force double lesson"
                    checked={selectedSubject.forceDoubleLesson}
                    onCheckedChange={(checked) => setSelectedSubject({ ...selectedSubject, forceDoubleLesson: checked })}
                    tabIndex={39}
                />
                <Label aria-hidden={true}>Force double lesson</Label>
            </div>
        </>
    );

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-center pb-4 sm:text-left sm:pb-0">
                        <CardTitle id="subjects-settings-title">Subjects</CardTitle>
                        <CardDescription id="subjects-settings-description" aria-labelledby="subjects-settings-description">
                            Manage all subjects
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">

                        {/* Search bar */}
                        <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden={true} />
                            <Input
                                id="subjects-settings-search"
                                type="search"
                                placeholder="Search"
                                className="pl-8 w-[250px]"
                                aria-label="Search subject"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                tabIndex={39}
                            />
                        </div>

                        {/* Add button */}
                        <Button onClick={handleOpenAddDialog} aria-label="Add subject" tabIndex={39}>
                            <PlusCircleIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                            Add
                        </Button>

                    </div>
                </CardHeader>

                <CardContent>
                    <Table aria-label="Subjects table">
                        <TableHeader aria-label="Columns">
                            <TableRow aria-label="Column Names">
                                <TableHead>Name</TableHead>
                                <TableHead>Max. in parallel</TableHead>
                                <TableHead>Force Double Lesson</TableHead>
                                <TableHead className="text-right" aria-label="Action Buttons">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {
                                filteredSubjects.map((subjectItem) => (
                                    <TableRow key={subjectItem.id} aria-label={`Subject: ${subjectItem.name}`}>

                                        {/* Subject name */}
                                        <TableCell className="font-medium">
                                            {subjectItem.name}
                                        </TableCell>

                                        {/* Max. in parallel */}
                                        <TableCell className="font-medium" aria-label={`Maximum possible in parallel: ${subjectItem.maxParallel > 0 ? subjectItem.maxParallel : "Not set"}`}>
                                            {subjectItem.maxParallel > 0 ? subjectItem.maxParallel + 'x' : "-"}
                                        </TableCell>

                                        {/* Force double lesson */}
                                        <TableCell className="font-medium" aria-label={`Force double lesson: ${subjectItem.forceDoubleLesson ? "Yes" : "No"}`}>
                                            {subjectItem.forceDoubleLesson ? "Yes" : "No"}
                                        </TableCell>

                                        {/* Action buttons */}
                                        <TableCell className="text-right" aria-label="Action Buttons">
                                            <div className="flex justify-end gap-2">
                                                {/* Edit button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Edit subject: ${subjectItem.name}`}
                                                    onClick={() => handleOpenEditDialog(subjectItem)}
                                                    tabIndex={39}
                                                >
                                                    <EditIcon className="h-4 w-4" aria-hidden={true} />
                                                </Button>
                                                {/* Delete button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Delete subject: ${subjectItem.name}`}
                                                    onClick={() => handleOpenDeleteDialog(subjectItem)}
                                                    disabled={usedSubjects.includes(subjectItem.name)}
                                                    tabIndex={39}
                                                >
                                                    <Trash2Icon className="h-4 w-4" aria-hidden={true} />
                                                </Button>
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                ))
                            }
                        </TableBody>

                    </Table>
                </CardContent>
            </Card>

            {/* Add dialog */}
            <Dialog open={isAddDialogOpen} aria-modal={true}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle aria-label="Add Subject">Add Subject</DialogTitle>
                        <DialogDescription id="dialog-add-subject-description" aria-labelledby="dialog-add-subject-description">
                            Enter the details for the new subject
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSubject && isAddDialogOpen && addEditDialogContent}
                    <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                        <Button
                            className="col-span-2"
                            variant="outline"
                            onClick={() => {
                                setIsAddDialogOpen(false);
                                setTimeout(() => {
                                    document.querySelector<HTMLElement>("#content-settings-subjects")?.focus();
                                }, 100);
                            }}
                            aria-label="Cancel add subject"
                            tabIndex={39}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="col-span-2"
                            onClick={handleAddConfirm}
                            disabled={selectedSubject && isAddDialogOpen && !selectedSubject.name.trim()}
                            aria-label="Confirm add subject"
                            tabIndex={39}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={isEditDialogOpen} aria-modal={true}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle aria-label="Edit Subject">Edit Subject</DialogTitle>
                        <DialogDescription id="dialog-edit-subject-description" aria-labelledby="dialog-edit-subject-description">
                            Edit the details of the subject
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSubject && isEditDialogOpen && addEditDialogContent}
                    <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                        <Button
                            className="col-span-2"
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setTimeout(() => {
                                    document.querySelector<HTMLElement>("#content-settings-subjects")?.focus();
                                }, 100);
                            }}
                            aria-label="Cancel edit subject"
                            tabIndex={39}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="col-span-2"
                            onClick={handleEditConfirm}
                            disabled={selectedSubject && isEditDialogOpen && !selectedSubject.name.trim()}
                            aria-label="Confirm edit subject"
                            tabIndex={39}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog open={isDeleteDialogOpen} aria-modal={true}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle aria-label="Delete Subject">Delete Subject</DialogTitle>
                        <DialogDescription id="dialog-delete-subject-description" aria-labelledby="dialog-delete-subject-description">
                            Are you sure you want to delete the subject: {selectedSubject.name}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                        <Button
                            className="col-span-2"
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setTimeout(() => {
                                    document.querySelector<HTMLElement>("#content-settings-subjects")?.focus();
                                }, 100);
                            }}
                            aria-label="Cancel delete subject"
                            tabIndex={39}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="col-span-2"
                            onClick={handleDelete}
                            aria-label="Confirm delete subject"
                            tabIndex={39}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default SettingsSubjects;
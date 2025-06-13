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
import { Badge } from "../../ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
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

/**
 * Provides a user interface for managing teachers and their subjects.
 *
 * This component includes:
 * - View a sorted, searchable list of all teachers with their subjects and hours per week.
 * - Adding new teachers with unique names, assigned subjects, and maximum hours per week.
 * - Editing existing teachers, including updating their subjects and max hours.
 * - Deleting teachers.
 *
 * @param data - The data object.
 * @param setData - React setter for updating the data state.
 *
 * @returns {JSX.Element}
 */
function SettingsTeachers({ data, setData }) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState<any>({});

    // Filter teachers for search
    const filteredTeachers = data.teachers.filter((teacherItem) => teacherItem.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Handle add teacher
    const handleOpenAddDialog = () => {
        setIsAddDialogOpen(true);
        setSelectedTeacher({
            id: new Date().getTime(),
            name: "",
            subjects: [],
            maxHoursPerWeek: 20,
        });
    }

    const handleAddConfirm = () => {
        selectedTeacher.subjects.sort();

        // Name cannot be duplicate -> Rename with counter
        let name = selectedTeacher.name;
        const existingNames = data.teachers.map((teacherItem) => teacherItem.name);
        let counter = 1;
        while (existingNames.includes(name)) {
            name = `${selectedTeacher.name} (${counter})`;
            counter++;
        }
        selectedTeacher.name = name;

        setData({
            ...data,
            newChangesMade: true,
            // Sort by name
            teachers: [...data.teachers, selectedTeacher].sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)),
        });

        setIsAddDialogOpen(false);
        setTimeout(() => {
            document.querySelector<HTMLElement>("#content-settings-teachers")?.focus();
        }, 100);
    }

    // Handle edit teacher
    const handleOpenEditDialog = (teacherItem) => {
        setIsEditDialogOpen(true);
        setSelectedTeacher(teacherItem);
    }

    const handleEditConfirm = () => {
        selectedTeacher.subjects.sort();
        const updatedTeachers = data.teachers.map((teacherItem) => (teacherItem.id === selectedTeacher.id ? selectedTeacher : teacherItem));

        // Name cannot be duplicate -> Rename with counter
        let name = selectedTeacher.name;
        const existingNames = data.teachers.map((teacherItem) => selectedTeacher.id !== teacherItem.id && teacherItem.name);
        let counter = 1;
        while (existingNames.includes(name)) {
            name = `${selectedTeacher.name} (${counter})`;
            counter++;
        }
        selectedTeacher.name = name;

        setData({
            ...data,
            newChangesMade: true,
            // Sort by name
            teachers: updatedTeachers.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)),
        });

        setIsEditDialogOpen(false);
        setTimeout(() => {
            document.querySelector<HTMLElement>("#content-settings-teachers")?.focus();
        }, 100);
    }

    // Handle delete teacher
    const handleOpenDeleteDialog = (teacherItem) => {
        setIsDeleteDialogOpen(true);
        setSelectedTeacher(teacherItem);
    }

    const handleDelete = () => {
        const updatedTeachers = data.teachers.filter((teacherItem) => teacherItem.id !== selectedTeacher.id);
        setData({
            ...data,
            newChangesMade: true,
            teachers: updatedTeachers
        });
        setIsDeleteDialogOpen(false);
        setTimeout(() => {
            document.querySelector<HTMLElement>("#content-settings-teachers")?.focus();
        }, 100);
    }

    // The content of the dialog for add and edit is the same
    const addEditDialogContent = (
        <div className="flex flex-col gap-4">

            <div className="grid grid-cols-6 gap-4 mt-1">
                {/* Input: Name */}
                <div className="col-span-4">
                    <Label aria-hidden={true}>Name</Label>
                    <Input
                        id="teacher-name-input"
                        aria-label="Teacher name input"
                        className="mt-2"
                        value={selectedTeacher.name}
                        onChange={(e) => setSelectedTeacher({ ...selectedTeacher, name: e.target.value.trimStart() })}
                        tabIndex={29}
                    />
                </div>
                {/* Input: Hours per week */}
                <div className="col-span-2">
                    <Label aria-hidden={true}>Max. hours/week</Label>
                    <Input
                        type="number"
                        min={1}
                        className="w-full mt-2"
                        aria-label="Maximum hours per week"
                        value={selectedTeacher.maxHoursPerWeek}
                        onChange={(e) => setSelectedTeacher({
                            ...selectedTeacher,
                            maxHoursPerWeek: isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value)
                        })}
                        tabIndex={29}
                    />
                </div>
            </div>

            {/* Subjects */}
            <div className="flex flex-col gap-2 max-h-64 overflow-scroll">
                <Label className="pt-2">Subjects</Label>
                <div className="flex flex-col gap-2">
                    {selectedTeacher.subjects && selectedTeacher.subjects.map(
                        (subject, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {/* Select: Subject */}
                                <Select
                                    value={subject}
                                    onValueChange={(value) => {
                                        const updatedSubjects = [...selectedTeacher.subjects];
                                        updatedSubjects[index] = value;
                                        setSelectedTeacher({
                                            ...selectedTeacher,
                                            subjects: updatedSubjects,
                                        });
                                    }}
                                >
                                    <SelectTrigger aria-label={`Select subject: ${subject}`} tabIndex={29}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Only select subject from selectedTeacher or all unused subjects */}
                                        {data.subjects.filter(({ name }) => !selectedTeacher.subjects.some((subjectName) => subjectName === name) || subject === name)
                                            .map((subjectOption) => (
                                                <SelectItem key={subjectOption.id} value={subjectOption.name}>
                                                    {subjectOption.name}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                                {/* Button: Delete subject */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Remove subject: ${subject}`}
                                    onClick={() => {
                                        const updatedSubjects = selectedTeacher.subjects.filter((element, idx) => idx !== index);
                                        setSelectedTeacher({
                                            ...selectedTeacher,
                                            subjects: updatedSubjects,
                                        });
                                    }}
                                    tabIndex={29}
                                >
                                    <Trash2Icon className="h-4 w-4" aria-hidden={true} />
                                </Button>
                            </div>
                        ),
                    )}
                </div>
                {/* Button: Add subject */}
                <Button
                    variant="outline"
                    size="sm"
                    className="min-h-8"
                    aria-label="Add subject"
                    onClick={() => {
                        const allUnusedSubject = data.subjects.filter(({ name }) => !selectedTeacher.subjects.some((subjectName) => subjectName === name));
                        const updatedSubjects = [
                            ...selectedTeacher.subjects,
                            allUnusedSubject[0].name,
                        ];
                        setSelectedTeacher({
                            ...selectedTeacher,
                            subjects: updatedSubjects,
                        });
                    }}
                    tabIndex={29}
                >
                    <PlusCircleIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                    Add Subject
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-center pb-4 sm:text-left sm:pb-0">
                        <CardTitle id="teachers-settings-title">Teachers</CardTitle>
                        <CardDescription id="teachers-settings-description" aria-labelledby="teachers-settings-description">
                            Manage all teachers and their subjects
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">

                        {/* Search bar */}
                        <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden={true} />
                            <Input
                                id="teachers-settings-search"
                                type="search"
                                placeholder="Search"
                                className="pl-8 w-[250px]"
                                aria-label="Search teacher"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                tabIndex={29}
                            />
                        </div>

                        {/* Add button */}
                        <Button onClick={handleOpenAddDialog} aria-label="Add teacher" tabIndex={29}>
                            <PlusCircleIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                            Add
                        </Button>

                    </div>
                </CardHeader>

                <CardContent>
                    <Table aria-label="Teachers table">
                        <TableHeader aria-label="Columns">
                            <TableRow aria-label="Column Names">
                                <TableHead>Name</TableHead>
                                <TableHead>Subjects</TableHead>
                                <TableHead>Max. Hours per Week</TableHead>
                                <TableHead className="text-right" aria-label="Action Buttons">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {
                                filteredTeachers.map((teacherItem) => (
                                    <TableRow key={teacherItem.id} aria-label={`Teacher: ${teacherItem.name}`}>

                                        {/* Teacher name */}
                                        <TableCell className="font-medium">
                                            {teacherItem.name}
                                        </TableCell>

                                        {/* Teacher subjects */}
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {teacherItem.subjects.map((subject, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        aria-label={`${subject}` + (index < teacherItem.subjects.length - 1 ? ", " : "")}
                                                    >
                                                        {subject}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>

                                        {/* Teacher max hours per week */}
                                        <TableCell className="font-medium">
                                            {teacherItem.maxHoursPerWeek}h/week
                                        </TableCell>

                                        {/* Action buttons */}
                                        <TableCell className="text-right" aria-label="Action Buttons">
                                            <div className="flex justify-end gap-2">
                                                {/* Edit button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Edit teacher: ${teacherItem.name}`}
                                                    onClick={() => handleOpenEditDialog(teacherItem)}
                                                    tabIndex={29}
                                                >
                                                    <EditIcon className="h-4 w-4" aria-hidden={true}/>
                                                </Button>
                                                {/* Delete button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Delete teacher: ${teacherItem.name}`}
                                                    onClick={() => handleOpenDeleteDialog(teacherItem)}
                                                    tabIndex={29}
                                                >
                                                    <Trash2Icon className="h-4 w-4" aria-hidden={true}/>
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
                        <DialogTitle aria-label="Add Teacher">Add Teacher</DialogTitle>
                        <DialogDescription id="dialog-add-teacher-description" aria-labelledby="dialog-add-teacher-description">
                            Enter the details for the new teacher
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTeacher && isAddDialogOpen && addEditDialogContent}
                    <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                        <Button
                            className="col-span-2"
                            variant="outline"
                            onClick={() => {
                                setIsAddDialogOpen(false);
                                setTimeout(() => {
                                    document.querySelector<HTMLElement>("#content-settings-teachers")?.focus();
                                }, 100);
                            }}
                            aria-label="Cancel add teacher"
                            tabIndex={29}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="col-span-2"
                            onClick={handleAddConfirm}
                            disabled={selectedTeacher && isAddDialogOpen && !selectedTeacher.name.trim()}
                            aria-label="Confirm add teacher"
                            tabIndex={29}
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
                        <DialogTitle aria-label="Edit Teacher">Edit Teacher</DialogTitle>
                        <DialogDescription id="dialog-edit-teacher-description" aria-labelledby="dialog-edit-teacher-description">
                            Edit the details of the teacher
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTeacher && isEditDialogOpen && addEditDialogContent}
                    <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                        <Button
                            className="col-span-2"
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setTimeout(() => {
                                    document.querySelector<HTMLElement>("#content-settings-teachers")?.focus();
                                }, 100);
                            }}
                            aria-label="Cancel edit teacher"
                            tabIndex={29}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="col-span-2"
                            onClick={handleEditConfirm}
                            disabled={selectedTeacher && isEditDialogOpen && !selectedTeacher.name.trim()}
                            aria-label="Confirm edit teacher"
                            tabIndex={29}
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
                        <DialogTitle aria-label="Delete Teacher">Delete Teacher</DialogTitle>
                        <DialogDescription id="dialog-delete-teacher-description" aria-labelledby="dialog-delete-teacher-description">
                            Are you sure you want to delete the teacher: {selectedTeacher.name}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                        <Button
                            className="col-span-2"
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setTimeout(() => {
                                    document.querySelector<HTMLElement>("#content-settings-teachers")?.focus();
                                }, 100);
                            }}
                            aria-label="Cancel delete teacher"
                            tabIndex={29}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="col-span-2"
                            onClick={handleDelete}
                            aria-label="Confirm delete teacher"
                            tabIndex={29}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default SettingsTeachers;
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
    CopyIcon,
    EditIcon,
    Trash2Icon
} from "lucide-react";

function SettingsClasses({ data, setData }) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClass, setSelectedClass] = useState<any>({});

    // Filter classes for search
    const filteredClasses = data.classes.filter((classItem) => classItem.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Handle add class
    const handleOpenAddDialog = () => {
        setIsAddDialogOpen(true);
        setSelectedClass({
            id: new Date().getTime(),
            name: "",
            subjects: [],
        });
    }

    const handleAddConfirm = () => {
        // Sort by name
        selectedClass.subjects.sort((a, b) => a.name > b.name ? 1 : b.name > a.name ? -1 : 0);

        // Name cannot be duplicate -> Rename with counter
        let name = selectedClass.name;
        const existingNames = data.classes.map((classItem) => classItem.name);
        let counter = 1;
        while (existingNames.includes(name)) {
            name = `${selectedClass.name} (${counter})`;
            counter++;
        }
        selectedClass.name = name;

        setData({
            ...data,
            newChangesMade: true,
            // Sort by name using localeCompare with numeric option for natural order
            classes: [...data.classes, selectedClass].sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
            ),
        });

        setIsAddDialogOpen(false);
    }

    // Handle duplicate class
    const handleDuplicate = (classItem) => {
        setIsAddDialogOpen(true);
        setSelectedClass({
            id: new Date().getTime(),
            name: classItem.name + " Copy",
            subjects: classItem.subjects,
        });
    }

    // Handle edit class
    const handleOpenEditDialog = (classItem) => {
        setIsEditDialogOpen(true);
        setSelectedClass(classItem);
    }

    const handleEditConfirm = () => {
        // Sort by name
        selectedClass.subjects.sort((a, b) => a.name > b.name ? 1 : b.name > a.name ? -1 : 0);
        const updatedClasses = data.classes.map((classItem) => (classItem.id === selectedClass.id ? selectedClass : classItem));

        // Name cannot be duplicate -> Rename with counter
        let name = selectedClass.name;
        const existingNames = data.classes.map((classItem) => selectedClass.id !== classItem.id && classItem.name);
        let counter = 1;
        while (existingNames.includes(name)) {
            name = `${selectedClass.name} (${counter})`;
            counter++;
        }
        selectedClass.name = name;

        setData({
            ...data,
            newChangesMade: true,
            // Sort by name using localeCompare with numeric option for natural order
            classes: updatedClasses.sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
            ),
        });

        setIsEditDialogOpen(false);
    }

    // Handle delete class
    const handleOpenDeleteDialog = (classItem) => {
        setIsDeleteDialogOpen(true);
        setSelectedClass(classItem);
    }

    const handleDelete = () => {
        const updatedClasses = data.classes.filter((classItem) => classItem.id !== selectedClass.id);
        setData({
            ...data,
            newChangesMade: true,
            classes: updatedClasses
        });
        setIsDeleteDialogOpen(false);
    }

    // The content of the dialog for add and edit is the same
    const add_edit_dialog_content = (
        <div className="flex flex-col gap-4">
            {/* Input: Name */}
            <div className="flex flex-col gap-2">
                <Label>Name</Label>
                <Input
                    value={selectedClass.name}
                    onChange={(e) => setSelectedClass({ ...selectedClass, name: e.target.value.trimStart() })}
                />
            </div>
            {/* Subjects */}
            <div className="flex flex-col gap-2 max-h-64 overflow-scroll">
                <Label className="pt-2">Subjects</Label>
                <div className="flex flex-col gap-2">
                    {selectedClass.subjects && selectedClass.subjects.map(
                        (subject, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {/* Select: Subject */}
                                <Select
                                    value={subject.name}
                                    onValueChange={(value) => {
                                        const updatedSubjects = [...selectedClass.subjects];
                                        updatedSubjects[index] = {
                                            ...updatedSubjects[index],
                                            name: value,
                                        };
                                        setSelectedClass({
                                            ...selectedClass,
                                            subjects: updatedSubjects,
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Only select subject from selectedClass or all unused subjects */}
                                        {data.subjects.filter(({ name }) => !selectedClass.subjects.some((classSubject) => classSubject.name === name) || subject.name === name)
                                            .map((subjectOption) => (
                                                <SelectItem key={subjectOption.id} value={subjectOption.name}>
                                                    {subjectOption.name}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                                {/* Input: Hours per week */}
                                <Input
                                    type="number"
                                    min={1}
                                    className="w-20"
                                    value={subject.hoursPerWeek}
                                    onChange={(e) => {
                                        const updatedSubjects = [...selectedClass.subjects];
                                        updatedSubjects[index] = {
                                            ...updatedSubjects[index],
                                            hoursPerWeek: isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value),
                                        };
                                        setSelectedClass({
                                            ...selectedClass,
                                            subjects: updatedSubjects,
                                        });
                                    }}
                                />
                                <span className="text-sm">hours/week</span>
                                {/* Button: Delete subject */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const updatedSubjects = selectedClass.subjects.filter((element, idx) => idx !== index);
                                        setSelectedClass({
                                            ...selectedClass,
                                            subjects: updatedSubjects,
                                        });
                                    }}
                                >
                                    <Trash2Icon className="h-4 w-4" />
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
                    onClick={() => {
                        const allUnusedSubject = data.subjects.filter(({ name }) => !selectedClass.subjects.some((subject) => subject.name === name));
                        const updatedSubjects = [
                            ...selectedClass.subjects,
                            { name: allUnusedSubject[0].name, hoursPerWeek: 1 },
                        ];
                        setSelectedClass({
                            ...selectedClass,
                            subjects: updatedSubjects,
                        });
                    }}
                >
                    <PlusCircleIcon className="mr-2 h-4 w-4" />
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
                        <CardTitle>Classes</CardTitle>
                        <CardDescription>
                            Manage all classes and their subjects
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">

                        {/* Search bar */}
                        <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search"
                                className="pl-8 w-[250px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Add button */}
                        <Button onClick={handleOpenAddDialog}>
                            <PlusCircleIcon className="mr-2 h-4 w-4" />
                            Add
                        </Button>

                    </div>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Subjects</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {
                                filteredClasses.map((classItem) => (
                                    <TableRow key={classItem.id}>

                                        {/* Class name */}
                                        <TableCell className="font-medium">
                                            {classItem.name}
                                        </TableCell>

                                        {/* Class subjects with hours per week */}
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {classItem.subjects.map((subject, index) => (
                                                    <Badge key={index} variant="outline">
                                                        <span className="flex flex-nowrap gap-1">
                                                            {subject.name}
                                                            <p className="font-normal">{subject.hoursPerWeek}h/week</p>
                                                        </span>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>

                                        {/* Action buttons */}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Duplicate button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDuplicate(classItem)}
                                                >
                                                    <CopyIcon className="h-4 w-4" />
                                                </Button>
                                                {/* Edit button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEditDialog(classItem)}
                                                >
                                                    <EditIcon className="h-4 w-4" />
                                                </Button>
                                                {/* Delete button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDeleteDialog(classItem)}
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
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
            <Dialog open={isAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Class</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new class
                        </DialogDescription>
                    </DialogHeader>
                    {selectedClass && isAddDialogOpen && add_edit_dialog_content}
                    <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                        <Button
                            className="col-span-2"
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="col-span-2"
                            onClick={handleAddConfirm}
                            disabled={selectedClass && isAddDialogOpen && !selectedClass.name.trim()}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={isEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Class</DialogTitle>
                        <DialogDescription>
                            Edit the details of the class
                        </DialogDescription>
                    </DialogHeader>
                    {selectedClass && isEditDialogOpen && add_edit_dialog_content}
                    <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                        <Button
                            className="col-span-2"
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="col-span-2"
                            onClick={handleEditConfirm}
                            disabled={selectedClass && isEditDialogOpen && !selectedClass.name.trim()}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog open={isDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Class</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the class: {selectedClass.name}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                        <Button className="col-span-2" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button className="col-span-2" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default SettingsClasses;
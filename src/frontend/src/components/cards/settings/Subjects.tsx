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
            subjects: [...data.subjects, selectedSubject].sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)),
        });

        setIsAddDialogOpen(false);
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
            subjects: updatedSubjects.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)),
        });
        
        setIsEditDialogOpen(false);
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
    }

    // The content of the dialog for add and edit is the same
    const add_edit_dialog_content = (
        <>
            <div className="grid grid-cols-6 gap-4">
                {/* Input: Name */}
                <div className="col-span-4">
                    <Label>Name</Label>
                    <Input
                        className="mt-2"
                        value={selectedSubject.name}
                        onChange={(e) => setSelectedSubject({ ...selectedSubject, name: e.target.value.trimStart() })}
                    />
                </div>
                {/* Input: Max parallel */}
                <div className="col-span-2">
                    <Label>Max. in parallel</Label>
                    <Input
                        type="number"
                        min={0}
                        className="w-full mt-2"
                        value={selectedSubject.maxParallel == 0 ? "" : selectedSubject.maxParallel}
                        onChange={(e) => setSelectedSubject({ ...selectedSubject, maxParallel: isNaN(parseInt(e.target.value)) || parseInt(e.target.value) < 0 ? 0 : parseInt(e.target.value) })}
                    />
                </div>
                {/* Switch: Force double lesson */}
            </div>
            <div className="flex flex-row items-center gap-3">
                <Switch
                    checked={selectedSubject.forceDoubleLesson}
                    onCheckedChange={(checked) => setSelectedSubject({ ...selectedSubject, forceDoubleLesson: checked })}
                />
                <Label>Force double lesson</Label>
            </div>
        </>
    );

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-center pb-4 sm:text-left sm:pb-0">
                        <CardTitle>Subjects</CardTitle>
                        <CardDescription>
                            Manage all subjects
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
                                <TableHead>Max. in parallel</TableHead>
                                <TableHead>Force Double Lesson</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {
                                filteredSubjects.map((subjectItem) => (
                                    <TableRow key={subjectItem.id}>

                                        {/* Subject name */}
                                        <TableCell className="font-medium">
                                            {subjectItem.name}
                                        </TableCell>

                                        {/* Max. in parallel */}
                                        <TableCell className="font-medium">
                                            {subjectItem.maxParallel > 0 ? subjectItem.maxParallel + 'x' : "-"}
                                        </TableCell>

                                        {/* Force double lesson */}
                                        <TableCell className="font-medium">
                                            {subjectItem.forceDoubleLesson ? "Yes" : "No"}
                                        </TableCell>

                                        {/* Action buttons */}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Edit button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEditDialog(subjectItem)}
                                                >
                                                    <EditIcon className="h-4 w-4" />
                                                </Button>
                                                {/* Delete button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDeleteDialog(subjectItem)}
                                                    disabled={usedSubjects.includes(subjectItem.name)}
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
                        <DialogTitle>Add Subject</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new subject
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSubject && isAddDialogOpen && add_edit_dialog_content}
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
                            disabled={selectedSubject && isAddDialogOpen && !selectedSubject.name.trim()}
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
                        <DialogTitle>Edit Subject</DialogTitle>
                        <DialogDescription>
                            Edit the details of the subject
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSubject && isEditDialogOpen && add_edit_dialog_content}
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
                            disabled={selectedSubject && isEditDialogOpen && !selectedSubject.name.trim()}
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
                        <DialogTitle>Delete Subject</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the subject: {selectedSubject.name}?
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

export default SettingsSubjects;
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
    PlusCircle,
    Search,
    Edit,
    Trash2
} from "lucide-react";

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
            teachers: [...data.teachers, selectedTeacher].sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)),
        });
        
        setIsAddDialogOpen(false);
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
            teachers: updatedTeachers.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)),
        });
        
        setIsEditDialogOpen(false);
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
    }

    // The content of the dialog for add and edit is the same
    const add_edit_dialog_content = (
        <div className="flex flex-col gap-4">

            <div className="grid grid-cols-6 gap-4 mt-1">
                {/* Input: Name */}
                <div className="col-span-4">
                    <Label>Name</Label>
                    <Input
                        className="mt-2"
                        value={selectedTeacher.name}
                        onChange={(e) => setSelectedTeacher({ ...selectedTeacher, name: e.target.value.trimStart() })}
                    />
                </div>
                {/* Input: Hours per week */}
                <div className="col-span-2">
                    <Label>Max. hours/week</Label>
                    <Input
                        type="number"
                        min={1}
                        className="w-full mt-2"
                        value={selectedTeacher.maxHoursPerWeek}
                        onChange={(e) => setSelectedTeacher({
                            ...selectedTeacher,
                            maxHoursPerWeek: isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value)
                        })}
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
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data.subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.name}>
                                                {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {/* Button: Delete subject */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const updatedSubjects = selectedTeacher.subjects.filter((element, idx) => idx !== index);
                                        setSelectedTeacher({
                                            ...selectedTeacher,
                                            subjects: updatedSubjects,
                                        });
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
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
                        const updatedSubjects = [
                            ...selectedTeacher.subjects,
                            data.subjects[0].name,
                        ];
                        setSelectedTeacher({
                            ...selectedTeacher,
                            subjects: updatedSubjects,
                        });
                    }}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
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
                        <CardTitle>Teachers</CardTitle>
                        <CardDescription>
                            Manage all teachers and their subjects
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">

                        {/* Search bar */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                            <PlusCircle className="mr-2 h-4 w-4" />
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
                                <TableHead>Max. Hours per Week</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {
                                filteredTeachers.map((teacherItem) => (
                                    <TableRow key={teacherItem.id}>

                                        {/* Teacher name */}
                                        <TableCell className="font-medium">
                                            {teacherItem.name}
                                        </TableCell>

                                        {/* Teacher subjects */}
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {teacherItem.subjects.map((subject, index) => (
                                                    <Badge key={index} variant="outline">
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
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Edit button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEditDialog(teacherItem)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {/* Delete button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDeleteDialog(teacherItem)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                        <DialogTitle>Add Teacher</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new teacher
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTeacher && isAddDialogOpen && add_edit_dialog_content}
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
                            disabled={selectedTeacher && isAddDialogOpen && !selectedTeacher.name.trim()}
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
                        <DialogTitle>Edit Teacher</DialogTitle>
                        <DialogDescription>
                            Edit the details of the teacher
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTeacher && isEditDialogOpen && add_edit_dialog_content}
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
                            disabled={selectedTeacher && isEditDialogOpen && !selectedTeacher.name.trim()}
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
                        <DialogTitle>Delete Teacher</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the teacher: {selectedTeacher.name}?
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

export default SettingsTeachers;
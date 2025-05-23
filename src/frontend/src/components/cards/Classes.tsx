import { useState } from "react";

// Components
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

// Icons
import {
    PlusCircle,
    Search,
    Edit,
    Trash2
} from "lucide-react";

function Classes({ data, setData }) {
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

    const handleAddSave = () => {
        setData({
            ...data, 
            classes: [...data.classes, selectedClass]
        });
        setIsAddDialogOpen(false);
    }

    // Handle edit class
    const handleOpenEditDialog = (classItem) => {
        setIsEditDialogOpen(true);
        setSelectedClass(classItem);
    }

    const handleEditSave = () => {
        const updatedClasses = data.classes.map((classItem) => (classItem.id === selectedClass.id ? selectedClass : classItem));
        setData({
            ...data,
            classes: updatedClasses
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
            classes: updatedClasses
        });
        setIsDeleteDialogOpen(false);
    }

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
                                                        {subject.name} ({subject.hoursPerWeek}h/week)
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>

                                        {/* Action buttons */}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Edit button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEditDialog(classItem)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {/* Delete button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDeleteDialog(classItem)}
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
                        <DialogTitle>Add class</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new class
                        </DialogDescription>
                    </DialogHeader>
                    {
                        selectedClass && isAddDialogOpen && (
                            <div className="flex flex-col gap-4">
                                {/* Input: Name */}
                                <div className="flex flex-col gap-2">
                                    <Label>Name</Label>
                                    <Input
                                        value={selectedClass.name}
                                        onChange={(e) => setSelectedClass({ ...selectedClass, name: e.target.value })}
                                    />
                                </div>
                                {/* Subjects */}
                                <div className="flex flex-col gap-2 max-h-64 overflow-scroll">
                                    <Label className="pt-2">Subjects</Label>
                                    <div className="flex flex-col gap-2">
                                        {selectedClass.subjects.map(
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
                                                            {data.subjects.map((subject) => (
                                                                <SelectItem key={subject} value={subject}>
                                                                    {subject}
                                                                </SelectItem>
                                                            ))}
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
                                                                hoursPerWeek: parseInt(e.target.value),
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
                                                ...selectedClass.subjects,
                                                { name: data.subjects[0], hoursPerWeek: 1 },
                                            ];
                                            setSelectedClass({
                                                ...selectedClass,
                                                subjects: updatedSubjects,
                                            });
                                        }}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add subject
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                    <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                        <Button className="col-span-2" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button className="col-span-2" onClick={handleAddSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={isEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit class</DialogTitle>
                        <DialogDescription>
                            Edit the details of the class
                        </DialogDescription>
                    </DialogHeader>
                    {
                        selectedClass && isEditDialogOpen && (
                            <div className="flex flex-col gap-4">
                                {/* Input: Name */}
                                <div className="flex flex-col gap-2">
                                    <Label>Name</Label>
                                    <Input
                                        value={selectedClass.name}
                                        onChange={(e) => setSelectedClass({ ...selectedClass, name: e.target.value })}
                                    />
                                </div>
                                {/* Subjects */}
                                <div className="flex flex-col gap-2 max-h-64 overflow-scroll">
                                    <Label className="pt-2">Subjects</Label>
                                    <div className="flex flex-col gap-2">
                                        {selectedClass.subjects.map(
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
                                                            {data.subjects.map((subject) => (
                                                                <SelectItem key={subject} value={subject}>
                                                                    {subject}
                                                                </SelectItem>
                                                            ))}
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
                                                                hoursPerWeek: parseInt(e.target.value),
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
                                                ...selectedClass.subjects,
                                                { name: data.subjects[0], hoursPerWeek: 1 },
                                            ];
                                            setSelectedClass({
                                                ...selectedClass,
                                                subjects: updatedSubjects,
                                            });
                                        }}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add subject
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                    <DialogFooter className="grid grid-cols-4 gap-2 mt-1">
                        <Button className="col-span-2" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button className="col-span-2" onClick={handleEditSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog open={isDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete class</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete class: {selectedClass.name}?
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

export default Classes;
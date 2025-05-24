import { useState } from "react";

// Components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../ui/table";

// Icons
import { Search } from "lucide-react";

function DisplayTeachers({ data }) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter teachers for search
    const filteredTeachers = data.teachers.filter((teacherItem) => teacherItem.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row xl:flex-col items-center justify-between">
                <div className="text-center pb-4 xl:pb-4 sm:text-left sm:pb-0">
                    <CardTitle>Teachers</CardTitle>
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
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Subjects</TableHead>
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
                                </TableRow>
                            ))
                        }
                    </TableBody>

                </Table>
            </CardContent>
        </Card>
    );
}

export default DisplayTeachers;
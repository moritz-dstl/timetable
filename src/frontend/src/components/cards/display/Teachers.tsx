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
import { SearchIcon } from "lucide-react";

function DisplayTeachers({ data }) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter teachers for search
    const filteredTeachers = data.teachers.filter((teacherItem) => teacherItem.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Card aria-labelledby="display-teachers-card-title">
            <CardHeader className="flex flex-col sm:flex-row xl:flex-col items-center justify-between">
                <div className="text-center pb-4 xl:pb-4 sm:text-left sm:pb-0">
                    <CardTitle id="display-teachers-card-title">Teachers</CardTitle>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                    {/* Search bar */}
                    <div className="relative">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden={true} />
                        <Input
                            id="display-teachers-search-bar"
                            type="search"
                            placeholder="Search"
                            className="pl-8 w-[250px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search teacher"
                            tabIndex={10}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Table aria-labelledby="display-teachers-card-title">
                    <TableHeader aria-label="Columns">
                        <TableRow aria-label="Column Names">
                            <TableHead>Name</TableHead>
                            <TableHead>Subjects</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody aria-label="Rows">
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
                                                <Badge key={index} variant="outline" aria-label={
                                                    `${subject}` +
                                                    (index < teacherItem.subjects.length - 1 ? ", " : "")
                                                }>
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
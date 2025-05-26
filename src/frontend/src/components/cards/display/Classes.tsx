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

function DisplayClasses({ data }) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter classes for search
    const filteredClasses = data.classes.filter((classItem) => classItem.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row xl:flex-col items-center justify-between">
                <div className="text-center pb-4 xl:pb-4 sm:text-left sm:pb-0">
                    <CardTitle>Classes</CardTitle>
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
                                </TableRow>
                            ))
                        }
                    </TableBody>

                </Table>
            </CardContent>
        </Card>
    );
}

export default DisplayClasses;
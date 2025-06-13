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

/**
 * Renders a searchable list of all classes and their associated subjects.
 * 
 * This component includes:
 * - A card header with a title and search input.
 * - A searchable table that displays:
 *   - Class names.
 *   - Subjects assigned to each class with their respective weekly hours.
 *
 * @param data - The data object.
 *
 * @returns {JSX.Element}
 */
function DisplayClasses({ data }) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter classes for search
    const filteredClasses = data.classes.filter((classItem) =>
        classItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card aria-labelledby="display-classes-card-title">
            <CardHeader className="flex flex-col sm:flex-row xl:flex-col items-center justify-between">
                <div className="text-center pb-4 xl:pb-4 sm:text-left sm:pb-0">
                    <CardTitle id="display-classes-card-title">Classes</CardTitle>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                    {/* Search bar */}
                    <div className="relative">
                        <SearchIcon
                            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                            aria-hidden={true}
                        />
                        <Input
                            id="display-classes-search-bar"
                            type="search"
                            placeholder="Search"
                            className="pl-8 w-[250px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search class"
                            tabIndex={10}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Table aria-labelledby="display-classes-card-title">
                    <TableHeader aria-label="Columns">
                        <TableRow aria-label="Column Names">
                            <TableHead>Name</TableHead>
                            <TableHead>Subjects</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody aria-label="Rows">
                        {
                            filteredClasses.map((classItem) => (
                                <TableRow key={classItem.id} aria-label={`Class: ${classItem.name}`}>
                                    {/* Class name */}
                                    <TableCell className="font-medium">
                                        {classItem.name}
                                    </TableCell>

                                    {/* Class subjects with hours per week */}
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {classItem.subjects.map((subject, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    aria-label={
                                                        `${subject.name} (${subject.hoursPerWeek} hours per week)` +
                                                        (index < classItem.subjects.length - 1 ? ", " : "")
                                                    }
                                                >
                                                    <span className="flex flex-nowrap gap-1">
                                                        {subject.name}
                                                        <span className="font-normal" aria-hidden={true}>
                                                            {subject.hoursPerWeek}h/week
                                                        </span>
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
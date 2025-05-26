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

// Icons
import { Search } from "lucide-react";

function DisplaySubjects({ data }) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter subjects for search
    const filteredSubjects = data.subjects.filter((subjectItem) => subjectItem.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row xl:flex-col items-center justify-between">
                <div className="text-center pb-4 xl:pb-4 sm:text-left sm:pb-0">
                    <CardTitle>Subjects</CardTitle>
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

            <CardContent className="flex flex-wrap gap-2">
                {
                    filteredSubjects.map((subjectItem) => (
                        <Badge key={subjectItem.id} variant="outline">
                            {subjectItem.name}
                        </Badge>
                    ))
                }
            </CardContent>
        </Card>
    );
}

export default DisplaySubjects;
// Components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../ui/card";

// Icons
import { LibraryBigIcon } from "lucide-react";

function TotalSubjects({ data }) {
    return (
        <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Subjects
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <LibraryBigIcon className="h-5 w-5 text-muted-foreground" aria-hidden={true} />
                        <span className="text-2xl font-bold">
                            {data.subjects.length}
                        </span>
                    </div>
                </CardContent>
            </Card>
    );
}

export default TotalSubjects;
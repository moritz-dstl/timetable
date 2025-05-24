// Components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../ui/card";

// Icons
import { Users } from "lucide-react";

function TotalTeachers({ data }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                    Total Teachers
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                        {data.teachers.length}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export default TotalTeachers;
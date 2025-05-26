// Components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../ui/card";

// Icons
import { GraduationCap } from "lucide-react";

function TotalClasses({ data }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                    Total Classes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                        {data.classes.length}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export default TotalClasses;
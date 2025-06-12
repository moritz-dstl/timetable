// Components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../ui/card";

// Icons
import { UsersIcon } from "lucide-react";

/**
 * TotalTeachers component – displays the number of teachers in the dataset.
 * 
 * It includes:
 * - A card header with a title and icon.
 * - A card content showing the teacher icon and numeric count based on the provided data.
 *
 * @param data - The data object.
 *
 * @returns {JSX.Element}
 */
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
                    <UsersIcon className="h-5 w-5 text-muted-foreground" aria-hidden={true} />
                    <span className="text-2xl font-bold">
                        {data.teachers.length}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export default TotalTeachers;
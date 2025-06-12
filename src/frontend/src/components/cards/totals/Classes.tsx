// Components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../ui/card";

// Icons
import { GraduationCapIcon } from "lucide-react";

/**
 * TotalClasses component – displays the number of classes in the dataset.
 * 
 * It includes:
 * - A card header with a title and icon.
 * - A card content showing the class icon and numeric count based on the provided data.
 *
 * @param data - The data object.
 *
 * @returns {JSX.Element}
 */
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
                    <GraduationCapIcon className="h-6 w-6 text-muted-foreground" aria-hidden={true} />
                    <span className="text-2xl font-bold">
                        {data.classes.length}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export default TotalClasses;
// Components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../ui/card";

// Icons
import { MailIcon } from "lucide-react";

function DisplayUser({ data }) {
    return (
        <Card className="flex flex-col items-center justify-between">
            <CardHeader className="pb-2">
                <CardTitle aria-label="School Name" className="text-xl font-bold text-primary">
                    {data.user.schoolName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div aria-label="Email" className="flex flex-row items-center gap-2">
                    <MailIcon className="h-5 w-5 text-muted-foreground" aria-hidden={true} />
                    {data.user.email}
                </div>
            </CardContent>
        </Card>
    );
}

export default DisplayUser;
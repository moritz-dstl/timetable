import { useEffect, useState } from "react";
import Cookies from "universal-cookie";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "../components/ui/tabs";

// Pages
import Welcome from "./Welcome";
import Overview from "./Overview";
import Settings from "./Settings";
import Timetables from "./Timetables";

function Home() {
    const cookies = new Cookies();

    // If user is not logged in
    if (!cookies.get("auth")) {
        return <Welcome />;
    }

    const [isLoading, setIsLoading] = useState(true);

    const [classes, setClasses] = useState({});
    const [subjects, setSubjects] = useState<string[]>([]);

    // Load data once on page load
    useEffect(() => {
        const userClasses = [
            {
                id: 1,
                name: "1A",
                subjects: [
                    { name: "Math", hoursPerWeek: 5 },
                    { name: "English", hoursPerWeek: 4 },
                    { name: "Science", hoursPerWeek: 3 },
                ],
            },
            {
                id: 2,
                name: "2B",
                subjects: [
                    { name: "Math", hoursPerWeek: 4 },
                    { name: "English", hoursPerWeek: 4 },
                    { name: "History", hoursPerWeek: 2 },
                ],
            },
            {
                id: 3,
                name: "3C",
                subjects: [
                    { name: "Math", hoursPerWeek: 5 },
                    { name: "Physics", hoursPerWeek: 3 },
                    { name: "Chemistry", hoursPerWeek: 3 },
                ],
            },
        ];
        setClasses(userClasses);

        const userSubjects = ["Math", "English", "Science", "Physics", "Chemistry", "History"];
        setSubjects(userSubjects);

        setIsLoading(false);
    }, []);

    return (
        <div className="min-h-[calc(100vh-130px)] flex bg-gray-50 flex-nowrap">

            <Tabs defaultValue="overview" className="w-full p-4">
                <div className="flex justify-between">
                    <div></div>
                    <TabsList className="m-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="timetables">Timetables</TabsTrigger>
                    </TabsList>
                    <div></div>
                </div>

                <TabsContent value="overview" className="space-y-6">
                    <Overview />
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Settings isLoading={isLoading} classes={classes} setClasses={setClasses} subjects={subjects} />
                </TabsContent>

                <TabsContent value="timetables" className="space-y-6">
                    <Timetables />
                </TabsContent>

            </Tabs>

        </div>
    );
}

export default Home;
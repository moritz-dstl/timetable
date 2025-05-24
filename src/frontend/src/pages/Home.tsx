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
    const [data, setData] = useState({});

    // Load data once on page load
    useEffect(() => {
        const user = {
            schoolName: "DHBW-Stuttgart",
            email: "admin@example.com"
        }

        const settings = {
            preferEarlyPeriods: true,
            allowDoubleLessons: true,
            numPeriodsPerDay: 8,
            maxConsecutivePeriods: 6,
            maxRepetitionsSubjectPerDay: 2,
            breakWindow: {
                start: 4,
                end: 6,
            },
        };

        const classes = [
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

        const teachers = [
            {
                id: 1,
                name: "Mr. Smith",
                subjects: ["Math", "English", "History"],
                maxHoursPerWeek: 18
            },
            {
                id: 2,
                name: "Mrs. Smith",
                subjects: ["Physics", "Chemistry", "Science"],
                maxHoursPerWeek: 20
            }
        ];

        const subjects = [
            {
                id: 1,
                name: "Math",
                maxParallel: 0,
                forceDoubleLesson: true
            },
            {
                id: 2,
                name: "English",
                maxParallel: 0,
                forceDoubleLesson: false
            },
            {
                id: 3,
                name: "Science",
                maxParallel: 2,
                forceDoubleLesson: false
            },
            {
                id: 4,
                name: "Physics",
                maxParallel: 2,
                forceDoubleLesson: false
            },
            {
                id: 5,
                name: "Chemistry",
                maxParallel: 2,
                forceDoubleLesson: true
            },
            {
                id: 6,
                name: "History",
                maxParallel: 0,
                forceDoubleLesson: false
            },
        ]

        setData({
            user: user,
            settings: settings,
            classes: classes,
            teachers: teachers,
            subjects: subjects
        });

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
                    <Overview isLoading={isLoading} data={data} />
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Settings isLoading={isLoading} data={data} setData={setData} />
                </TabsContent>

                <TabsContent value="timetables" className="space-y-6">
                    <Timetables />
                </TabsContent>

            </Tabs>

        </div>
    );
}

export default Home;
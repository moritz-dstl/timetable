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
import Timetable from "./Timetable";

/**
 * Fetches and prepares data from the API.
 *
 * This asynchronous function performs the following tasks:
 * - Delays execution for 500ms to show a loading effect.
 * - Fetches the user's school name and scheduling settings and processes that data.
 * - Updates the application state using provided setter functions and caches the result in localStorage.
 *
 * @async
 * @function apiFetchData
 * @param {Object} cookies - A cookie management object with a `.get` method to retrieve stored cookies.
 * @param {Function} setData - React state setter function to update the scheduling data in the application.
 * @param {Function} setIsLoading - React state setter function to update the loading status.
 */
async function apiFetchData(cookies, setData, setIsLoading) {
    // Wait 500ms for loading effect
    await new Promise((resolve) => setTimeout(resolve, 500));

    var user = {
        schoolName: "",
        email: atob(cookies.get("user"))
    }

    var settings = {
        preferEarlyPeriods: true,
        preferDoubleLessons: true,
        numPeriods: 8,
        maxRepetitionsSubjectPerDay: 2,
        breakAtPeriod: 6,
    };

    var timetable = {
        durationToGenerateSeconds: 10,
        numPeriods: settings.numPeriods,
        exists: false,
        classes: [],
        teachers: [],
        lessons: []
    };

    var subjects: {
        id: number;
        name: string;
        maxParallel: number;    // 0 if doesn't matter
        forceDoubleLesson: boolean
    }[] = [];

    var teachers: {
        id: number;
        name: string;
        subjects: Array<string>;
        maxHoursPerWeek: number;
    }[] = [];

    var classes: {
        id: number;
        name: string;
        subjects: Array<{ name: string; hoursPerWeek: number; }>;
    }[] = [];

    // Get user school name
    await fetch(`${import.meta.env.VITE_API_ENDPOINT}/User/get_school`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then((res) => res.json())
        .then((json) => user.schoolName = json["school_name"])
        .catch((error) => {
            console.error(error);
        });

    // Get settings, classes, teachers, and subjects
    await fetch(`${import.meta.env.VITE_API_ENDPOINT}/Settings/get`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then((res) => res.json())
        .then((json) => {
            const isObjectEmpty = (obj) => Object.keys(obj).length === 0;

            const jsonSettings = json["settings"];
            const jsonSchool = json["school"];
            const jsonForceDoubleLesson = json["prefer_block_subjects"];
            const jsonMaxParallel = json["subject_parallel_limits"];
            const jsonTeachers = json["teachers"];
            const jsonTeacherSubjects = json["teacher_subjects"];
            const jsonClasses = json["classes"];

            if (!isObjectEmpty(jsonSettings) && !isObjectEmpty(jsonSchool)) {
                // Settings
                settings.preferEarlyPeriods = Boolean(jsonSettings["prefer_early_hours"]);
                settings.preferDoubleLessons = Boolean(jsonSettings["allow_block_scheduling"]);
                settings.maxRepetitionsSubjectPerDay = jsonSettings["max_hours_per_day"];
                settings.breakAtPeriod = jsonSettings["global_break"];
                settings.numPeriods = jsonSchool["hours_per_day"];
                timetable.durationToGenerateSeconds = jsonSettings["max_time_for_solving"];

                // Timetable
                timetable.numPeriods = jsonSchool["hours_per_day"];

                // Subjects
                const subjectsArray = JSON.parse(jsonSchool["subjects"].replace(/'/g, '"'));
                subjectsArray.forEach((subject, index) => {
                    const isMaxParallelSet = jsonMaxParallel.find((subjectItem) => subjectItem["subject_name"] === subject);
                    const maxParallel = isMaxParallelSet ? isMaxParallelSet["max_parallel"] : 0;
                    const forceDoubleLesson = jsonForceDoubleLesson.find((subjectItem) => subjectItem["subject_name"] === subject) ? true : false;

                    subjects.push({
                        id: index,
                        name: subject,
                        maxParallel: maxParallel,
                        forceDoubleLesson: forceDoubleLesson
                    });
                });

                // Classes
                const classesArray = JSON.parse(jsonSchool["classes"].replace(/'/g, '"'));
                classesArray.forEach((cls, index) => {
                    const allSubjectsForClass = jsonClasses.filter((classSubject) => cls === classSubject["class_name"]).map((classSubject) => ({ name: classSubject["subject"], hoursPerWeek: classSubject["hours_per_week"] }));

                    classes.push({
                        id: index,
                        name: cls,
                        // Sort by name
                        subjects: allSubjectsForClass.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)),
                    });
                });

                // Teachers
                jsonTeachers.forEach((teacher) => {
                    const teacherID = teacher["Tid"];
                    const allSubjectsForTeacher = jsonTeacherSubjects.filter((teacherSubject) => teacherID === teacherSubject["Tid"]).map((teacherSubject) => teacherSubject["subject"]);

                    teachers.push({
                        id: teacherID,
                        name: teacher["name"],
                        subjects: allSubjectsForTeacher.sort(),
                        maxHoursPerWeek: teacher["max_hours"]
                    });
                });

            }

            const allData = {
                user: user,
                timetable: timetable,
                newChangesMade: false,
                settings: settings,
                // Sort by name using localeCompare with numeric option for natural order
                classes: classes.sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
                ),
                // Sort by name
                teachers: teachers.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)),
                subjects: subjects.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)),
            };

            setData(allData);
            localStorage.setItem("data", JSON.stringify(allData));

            setIsLoading(false);
        })
        .catch((error) => {
            console.error(error);
        });
}

/**
 * The main entry point for users.
 *
 * This element:
 * - Checks for user authentication via cookies.
 * - If the user is not authenticated, renders the Welcome screen.
 * - On initial render, attempts to load cached data from localStorage.
 * - If no cached data is found, fetches user and scheduling data from the backend.
 * - Renders tab-based navigation (Overview, Settings, Timetable) once data is loaded.
 *
 * @returns {JSX.Element}
 */
function Home() {
    const cookies = new Cookies();

    // If user is not logged in
    if (!cookies.get("user")) {
        return <Welcome />;
    }

    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<{
        user?: any;
        timetable?: any;
        newChangesMade?: boolean;
        settings?: any;
        classes?: any[];
        teachers?: any[];
        subjects?: any[];
    }>({});

    // Load data once on page load
    useEffect(() => {
        const storedData = localStorage.getItem("data");
        if (storedData) {
            setData(JSON.parse(storedData));
            setIsLoading(false);
            return;
        }
        apiFetchData(cookies, setData, setIsLoading);
    }, []);


    return (
        <main aria-label="Main Content" className="min-h-[calc(100vh-347px)] pb-8 flex bg-gray-50 flex-nowrap">
            <Tabs defaultValue="overview" className="w-full p-4">
                <div className="flex justify-center">
                    <TabsList
                        aria-label="Tabs"
                        className="m-4"
                    >
                        {/* Overview */}
                        <TabsTrigger
                            id="tab-overview"
                            value="overview"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    document.querySelector<HTMLElement>("#display-classes-search-bar")?.focus();
                                }
                            }}
                        >
                            Overview
                        </TabsTrigger>

                        {/* Settings */}
                        <TabsTrigger
                            id="tab-settings"
                            value="settings"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    if (!isLoading) {
                                        document.querySelector<HTMLElement>(data.newChangesMade ? "#settings-button-discard" : "#content-settings-general")?.focus();
                                    }
                                }
                            }}
                        >
                            Settings
                        </TabsTrigger>

                        {/* Timetable */}
                        <TabsTrigger
                            id="tab-timetable"
                            value="timetable"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === "Tab") {
                                    event.preventDefault();
                                    document.querySelector<HTMLElement>("#tab-overview")?.focus();
                                }
                                else if (event.key === "Enter") {
                                    event.preventDefault();
                                    document.querySelector<HTMLElement>("#timetable-generate-button")?.focus();
                                }
                            }}
                        >
                            Timetable
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Overview */}
                <TabsContent
                    id="content-overview"
                    value="overview"
                    className="space-y-6"
                    aria-label="Overview"
                >
                    <Overview isLoading={isLoading} data={data} />
                </TabsContent>

                {/* Settings */}
                <TabsContent
                    id="content-settings"
                    value="settings"
                    className="space-y-6"
                    aria-label="Settings"
                >
                    <Settings isLoading={isLoading} data={data} setData={setData} />
                </TabsContent>

                {/* Timetable */}
                <TabsContent
                    id="content-timetable"
                    value="timetable"
                    className="space-y-6"
                    aria-label="Timetable"
                >
                    <Timetable isLoading={isLoading} data={data} setData={setData} />
                </TabsContent>

            </Tabs>
        </main>
    );
}

export default Home;
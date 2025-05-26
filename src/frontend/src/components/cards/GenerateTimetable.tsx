// Components
import { Button } from "../ui/button";

// Icons
import { RefreshCw } from "lucide-react";

function GenerateTimetable({ data, setData }) {
    const handleGenerate = () => {
        setData({ ...data, timetable: { ...data.timetable, isGenerating: true } });
        localStorage.setItem("data", JSON.stringify({ ...data, timetable: { ...data.timetable, isGenerating: true } }));

        setTimeout(() => {
            const timetable = {
                isGenerating: false,
                exists: true,
                numOfPeriods: 8,
                classes: ["1A", "2B", "3C"],
                teachers: ["Mr. Smith", "Mrs. Smith"],
                lessons: [
                    {
                        id: 1,
                        day: "Monday",
                        period: 1,
                        class: "1A",
                        subject: "Math",
                        teacher: "Mr. Smith",
                    },
                    {
                        id: 2,
                        day: "Monday",
                        period: 2,
                        class: "1A",
                        subject: "English",
                        teacher: "Mr. Smith",
                    },
                    {
                        id: 3,
                        day: "Monday",
                        period: 3,
                        class: "1A",
                        subject: "Physics",
                        teacher: "Mrs. Smith",
                    },
                    {
                        id: 4,
                        day: "Monday",
                        period: 1,
                        class: "2B",
                        subject: "Chemistry",
                        teacher: "Mrs. Smith",
                    },
                    {
                        id: 5,
                        day: "Tuesday",
                        period: 2,
                        class: "2B",
                        subject: "Science",
                        teacher: "Mrs. Smith",
                    },
                    {
                        id: 6,
                        day: "Wednesday",
                        period: 4,
                        class: "3C",
                        subject: "History",
                        teacher: "Mr. Smith",
                    },
                    {
                        id: 7,
                        day: "Wednesday",
                        period: 5,
                        class: "3C",
                        subject: "English",
                        teacher: "Mr. Smith",
                    },
                    {
                        id: 8,
                        day: "Thursday",
                        period: 6,
                        class: "2B",
                        subject: "Math",
                        teacher: "Mr. Smith",
                    },
                    {
                        id: 9,
                        day: "Friday",
                        period: 7,
                        class: "1A",
                        subject: "Physics",
                        teacher: "Mrs. Smith",
                    },
                    {
                        id: 10,
                        day: "Friday",
                        period: 8,
                        class: "2B",
                        subject: "Chemistry",
                        teacher: "Mrs. Smith",
                    },
                ]
            };

            // When using setTimeout, closures capture the initial state, 
            // so to ensure the latest state is used, update state with a 
            // function that receives the current value.
            setData(prevData => {
                const newData = { ...prevData, timetable: timetable };
                localStorage.setItem("data", JSON.stringify(newData));
                return newData;
            });
            
        }, 15 * 1000);
    }

    return (
        <>
            {data.newChangesMade && !data.timetable.isGenerating && <p className="text-center text-gray-500">Please save or discard the changes made in settings in order to generate a timetable.</p>}
            <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={data.timetable.isGenerating || data.newChangesMade}
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${data.timetable.isGenerating && "animate-spin"}`} />
                {data.timetable.isGenerating ? "Generating..." : "Generate Timetable"}
            </Button >
        </>
    );
}

export default GenerateTimetable;
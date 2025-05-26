import { useState, useEffect } from "react";

// Components
import {
    Card,
    CardContent,
    CardHeader,
} from "../../ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch";

// Icons
import { Download } from "lucide-react";

// Function to choose background color color from any string value
function stringToBackgroundColor(string) {
    const colors = ["bg-red-100", "bg-orange-100", "bg-green-100", "bg-sky-100", "bg-blue-100", "bg-purple-100", "bg-fuchsia-100"];

    var charSum = 0;
    for (var i = 0; i < string.length; i++)
        charSum += string.charCodeAt(i);

    return colors[Math.abs(charSum % colors.length)];
}

function DisplayTimetable({ data }) {
    const [selectedViewClassTeacher, setSelectedViewClassTeacher] = useState("class");
    const [allClassesTeachers, setAllClassesTeacheres] = useState(data.timetable.classes);
    const [selectedClassTeacher, setSelectedClassTeacher] = useState(allClassesTeachers[0]);

    const [useColors, setUseColors] = useState(false);

    // Reload once a new timetable was generated
    useEffect(() => {
        setSelectedViewClassTeacher("class");
        setAllClassesTeacheres(data.timetable.classes);
        setSelectedClassTeacher(data.timetable.classes[0]);
    }, [data.timetable.isGenerating]);

    // Filter classes for search
    const filteredLessonsByClass = data.timetable.lessons.filter((lessonItem) => lessonItem.class === selectedClassTeacher);
    const filteredLessonsByTeacher = data.timetable.lessons.filter((lessonItem) => lessonItem.teacher === selectedClassTeacher);
    const filteredLessons = selectedViewClassTeacher === "class" ? filteredLessonsByClass : filteredLessonsByTeacher;

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const rangePeriods = Array.from({ length: data.timetable.numOfPeriods }, (_, i) => i + 1);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-row gap-2 sm:gap-4 items-center justify-between">
                    <div className="flex flex-row gap-2 sm:gap-4 w-full">
                        {/* Select view class or teacher */}
                        <Select
                            value={selectedViewClassTeacher}
                            onValueChange={(value) => {
                                setSelectedViewClassTeacher(value);

                                const listAllClassesteachers = value === "class" ? data.timetable.classes : data.timetable.teachers;
                                setAllClassesTeacheres(listAllClassesteachers);
                                setSelectedClassTeacher(listAllClassesteachers[0]);
                            }}
                            disabled={true ? !data.timetable.exists || data.timetable.isGenerating : false}
                        >
                            <SelectTrigger className="w-[50%] sm:w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="class">Class</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                            </SelectContent>
                        </Select>
                        {/* Select class or teacher */}
                        <Select
                            value={selectedClassTeacher}
                            onValueChange={setSelectedClassTeacher}
                            disabled={true ? !data.timetable.exists || data.timetable.isGenerating : false}
                        >
                            <SelectTrigger className="w-[50%] sm:w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    allClassesTeachers.map((item, index) => (
                                        <SelectItem key={index} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Export button */}
                    <Button onClick={undefined} disabled={true ? !data.timetable.exists || data.timetable.isGenerating : false}>
                        <Download className="mr-0 sm:mr-2 h-4 w-4" />
                        <p className="hidden sm:block">Export</p>
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-scroll rounded-xl">
                            <table className="w-full border-hidden">
                                {/* Head: Days of the week */}
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="p-3 pt-4 align-center">
                                            <Switch checked={useColors} onCheckedChange={setUseColors} />
                                        </th>
                                        {daysOfWeek.map((day) => (
                                            <th key={day} className="p-3 border text-sm w-[19%]">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        // For every row (period)
                                        rangePeriods.map((period) => (
                                            <tr key={period}>
                                                {/* First column */}
                                                <td className="p-2 border text-sm font-bold text-center bg-gray-50">
                                                    {period}
                                                </td>
                                                {
                                                    daysOfWeek.map((day, index) => {
                                                        // Get lesson that matches day and period
                                                        const lesson = filteredLessons.filter((lessonItem) => lessonItem.day === day && lessonItem.period === period)[0];

                                                        return (
                                                            // Display lesson for day and period if it exists
                                                            <td key={index} className="p-1 border">
                                                                {lesson ? (
                                                                    <div className={`min-h-20 p-2 rounded text-center ${useColors && stringToBackgroundColor(lesson.subject)}`}>
                                                                        <div className="text-sm font-medium">
                                                                            {lesson.subject}
                                                                        </div>
                                                                        <div className="text-xs mt-1">
                                                                            {lesson.teacher}
                                                                        </div>
                                                                        <div className="text-xs mt-1">
                                                                            {lesson.class}
                                                                        </div>
                                                                    </div>
                                                                ) : <div className="min-h-20 p-2"></div>}
                                                            </td>
                                                        );
                                                    })
                                                }
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}

export default DisplayTimetable;
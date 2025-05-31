import { useState, useEffect } from "react";

// Create and export PDF
import ReactDOMServer from "react-dom/server";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
import { Boxes, Download } from "lucide-react";

/**
 * Generates a JSX representation of a timetable for a given class or teacher.
 *
 * @param data - The data object
 * @param selectedViewClassTeacher - Determines whether to display the timetable by "class" or "teacher".
 * @param selectedClassTeacher - The currently selected class or teacher whose timetable is to be displayed.
 * @param useColors - Boolean indicating whether to apply background colors to subjects.
 * @param setUseColors - State setter function to toggle the use of colors.
 * @param isExport - Optional flag indicating if the timetable is being rendered for export, which disables certain UI elements.
 * @returns A JSX element representing the timetable table for the selected class or teacher.
 */
function getHTMLTimetable(data, selectedViewClassTeacher, selectedClassTeacher, useColors, setUseColors, isExport = false) {
    // Filter classes for selection
    const filteredLessonsByClass = data.timetable.lessons.filter((lessonItem) => lessonItem.class === selectedClassTeacher);
    const filteredLessonsByTeacher = data.timetable.lessons.filter((lessonItem) => lessonItem.teacher === selectedClassTeacher);
    const filteredLessons = selectedViewClassTeacher === "class" ? filteredLessonsByClass : filteredLessonsByTeacher;

    // All subjects for coloring
    const allLessonSubjects = [...new Set(data.timetable.lessons.map((lessonItem) => lessonItem.subject))];
    const bgColors = [
        "bg-red-200",
        "bg-blue-200",
        "bg-green-200",
        "bg-yellow-200",
        "bg-orange-200",
        "bg-purple-200",
        "bg-cyan-200",
        "bg-pink-200",
        "bg-lime-200",
        "bg-indigo-200",
        "bg-emerald-200",
        "bg-fuchsia-200",
        "bg-teal-200",
        "bg-amber-200",
        "bg-sky-200",
        "bg-rose-200",
        "bg-violet-200",
    ];

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const rangePeriods = Array.from({ length: data.timetable.numOfPeriods }, (_, i) => i + 1);

    return (
        <div className="overflow-scroll rounded-xl">
            <table className="w-full border-hidden">
                {/* Head: Days of the week */}
                <thead>
                    <tr className="bg-gray-50">
                        <th className="p-3 pt-4 border align-center">
                            {!isExport && (
                                <Switch checked={useColors} onCheckedChange={setUseColors} />
                            )}
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
                                                    <div className={`min-h-20 p-2 rounded text-center ${useColors && bgColors[allLessonSubjects.indexOf(lesson.subject) % bgColors.length]}`}>
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
    );
}

function DisplayTimetable({ data }) {
    const [selectedViewClassTeacher, setSelectedViewClassTeacher] = useState("class");
    const [allClassesTeachers, setAllClassesTeacheres] = useState(data.timetable.classes);
    const [selectedClassTeacher, setSelectedClassTeacher] = useState(allClassesTeachers[0]);

    const [useColors, setUseColors] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Reload once a new timetable was generated
    useEffect(() => {
        setSelectedViewClassTeacher("class");
        setAllClassesTeacheres(data.timetable.classes);
        setSelectedClassTeacher(data.timetable.classes[0]);
    }, [data.timetable.exists]);

    const handleExport = () => {
        setIsExporting(true);

        // Recursive function that adds timetable at index as page to pdf.
        // Returns when all timetables were added.
        const pdfAddTimetable = (index) => {
            // All timetables added -> Save and exit
            if (index >= timetables.length) {
                // Add a footer before saving
                const pageCount = pdf.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(8);
                    pdf.text(
                        `Page ${i} of ${pageCount}`,
                        pageWidth - pdfMargin,
                        pageHeight - 7,
                        { align: "right" }
                    );
                    pdf.text(
                        "Generated by Free Online Timetable Generator",
                        pdfMargin,
                        pageHeight - 7
                    );
                }

                pdf.save("your-fottg-timetable.pdf");
                element.remove();
                setIsExporting(false);

                return;
            }

            element.innerHTML = ReactDOMServer.renderToStaticMarkup(
                <div className="w-[1000px]">
                    <div className="flex justify-center w-full mb-16">
                        <Boxes className="h-16 w-16" color="#FF9100" />
                    </div>
                    <div className="m-10">
                        <div className="flex justify-between">
                            <p className="text-xl font-bold">{data.user.schoolName}</p>
                            <span className="flex flex-row items-center gap-1">
                                <p className="text-md">{timetables[index].type}: </p>
                                <p className="text-xl font-bold">{timetables[index].name}</p>
                            </span>
                        </div>
                        <br />
                        {timetables[index].content}
                    </div>
                </div>
            );

            html2canvas(element).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");

                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
                const pdfWidth = imgWidth * ratio;
                const pdfHeight = imgHeight * ratio;

                // Creating pdf object already has page, no need to add one
                if (!isFirstPage) pdf.addPage(pdfFormat, pdfOrientation);
                isFirstPage = false;

                pdf.addImage(imgData, "PNG", pdfMargin, pdfMargin, pdfWidth, pdfHeight);

                pdfAddTimetable(index + 1);
            });
        };

        const timetables = [
            // All class timetables
            ...data.timetable.classes.map((nameClass) => ({
                type: "Class",
                name: nameClass,
                content: getHTMLTimetable(data, "class", nameClass, useColors, setUseColors, true)
            })),
            // All teacher timetables
            ...data.timetable.teachers.map((nameTeacher) => ({
                type: "Teacher",
                name: nameTeacher,
                content: getHTMLTimetable(data, "teacher", nameTeacher, useColors, setUseColors, true)
            }))
        ];

        // Create element to temporily place html that is added to the pdf.
        // Hide from plain sight. Is deleted when finished.
        const element = document.createElement("div");
        element.style.position = "absolute";
        element.style.left = "-9999px";
        document.body.appendChild(element);

        const pdfOrientation = "portrait";
        const pdfFormat = "A4";
        const pdfMargin = 15; // mm

        const pdf = new jsPDF({
            orientation: pdfOrientation,
            unit: "mm",
            format: pdfFormat,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const availableWidth = pageWidth - pdfMargin * 2;
        const availableHeight = pageHeight - pdfMargin * 2;

        let isFirstPage = true;

        // Recursively add timetables to pdf
        pdfAddTimetable(0);

        // Saving and exit happens in function because creating pdf is asynchronously
    }

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
                            disabled={!data.timetable.exists}
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
                            disabled={!data.timetable.exists}
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
                    <Button onClick={handleExport} disabled={!data.timetable.exists || isExporting} >
                        <Download className="mr-0 sm:mr-2 h-4 w-4" />
                        <p className="hidden sm:block">{isExporting ? "Exporting..." : "Export"}</p>
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <Card>
                    <CardContent className="p-0">
                        {getHTMLTimetable(data, selectedViewClassTeacher, selectedClassTeacher, useColors, setUseColors)}
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}

export default DisplayTimetable;
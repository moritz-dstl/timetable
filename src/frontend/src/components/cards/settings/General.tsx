import { useEffect } from "react";

// Components
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../ui/card";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import { Slider } from "../../ui/slider";
import { Separator } from "../../ui/separator";

function SettingsGeneral({ data, setData }) {
    // Ensure dependent settings remain valid when the number of periods per day changes.
    // If related settings exceed the new value, adjust them accordingly.
    useEffect(() => {
        setData({
            ...data,
            settings: {
                ...data.settings,
                maxConsecutivePeriods: data.settings.numPeriodsPerDay < data.settings.maxConsecutivePeriods ? data.settings.numPeriodsPerDay : data.settings.maxConsecutivePeriods,
                maxRepetitionsSubjectPerDay: data.settings.numPeriodsPerDay < data.settings.maxRepetitionsSubjectPerDay ? data.settings.numPeriodsPerDay : data.settings.maxRepetitionsSubjectPerDay,
                breakWindow: {
                    ...data.settings.breakWindow,
                    end: data.settings.numPeriodsPerDay < data.settings.breakWindow.end ? data.settings.numPeriodsPerDay : data.settings.breakWindow.end,
                    start: Math.min(
                        data.settings.breakWindow.start,
                        (data.settings.numPeriodsPerDay < data.settings.breakWindow.end ? data.settings.numPeriodsPerDay : data.settings.breakWindow.end) - 1
                    ),
                }
            }
        })
    }, [data.settings.numPeriodsPerDay]);

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-center sm:text-left">
                    <CardTitle>General</CardTitle>
                    <CardDescription>
                        Set general settings
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">

                <div className="grid grid-rows-2 gap-2">
                    {/* Switch: Prefer early periods */}
                    <div className="flex flex-row gap-3 items-center">
                        <Switch
                            checked={data.settings.preferEarlyPeriods}
                            onCheckedChange={(checked) => setData({
                                ...data,
                                newChangesMade: true,
                                settings: { ...data.settings, preferEarlyPeriods: checked }
                            })}
                        />
                        <Label>Prefer early periods</Label>
                    </div>
                    {/* Switch: Allow consecutive periods */}
                    <div className="flex flex-row gap-3 items-center">
                        <Switch
                            checked={data.settings.allowDoubleLessons}
                            onCheckedChange={(checked) => setData({
                                ...data,
                                newChangesMade: true,
                                settings: { ...data.settings, allowDoubleLessons: checked }
                            })}
                        />
                        <Label>Allow double lessons</Label>
                    </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-8">
                    <div className="flex flex-col gap-4">
                        {/* Input: Num of periods per day */}
                        <div className="flex flex-col gap-2">
                            <Label>Number of periods per day</Label>
                            <Input
                                type="number"
                                min={4}
                                value={data.settings.numPeriodsPerDay}
                                onChange={(e) => setData({
                                    ...data,
                                    newChangesMade: true,
                                    settings: { ...data.settings, numPeriodsPerDay: isNaN(parseInt(e.target.value)) || parseInt(e.target.value) < 4 ? 4 : parseInt(e.target.value) }
                                })}
                            />
                        </div>
                        {/* Slider: Break window */}
                        <div className="flex flex-col gap-2">
                            <Label>Break window in periods</Label>
                            <Slider
                                min={1}
                                max={data.settings.numPeriodsPerDay}
                                step={1}
                                value={[data.settings.breakWindow.start, data.settings.breakWindow.end]}
                                onValueChange={([start, end]) => setData({
                                    ...data,
                                    newChangesMade: true,
                                    settings: {
                                        ...data.settings,
                                        breakWindow: {
                                            ...data.settings.breakWindow,
                                            start: start >= end ? start - 1 : start,
                                            end: end,
                                        }
                                    }
                                })}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Slider: Max consecutive periods */}
                        <div className="flex flex-col gap-2 min-h-0 md:min-h-[57px]">
                            <Label>Max. number of consecutive periods</Label>
                            <Slider
                                min={1}
                                max={data.settings.numPeriodsPerDay}
                                step={1}
                                value={[data.settings.maxConsecutivePeriods]}
                                onValueChange={([value]) => setData({
                                    ...data,
                                    newChangesMade: true,
                                    settings: { ...data.settings, maxConsecutivePeriods: value }
                                })}
                            />
                        </div>
                        {/* Slider: Max repetitions of subject */}
                        <div className="flex flex-col gap-2">
                            <Label className="md:text-nowrap md:overflow-scroll">Max. number of period repetitions for subject per day</Label>
                            <Slider
                                min={1}
                                max={data.settings.numPeriodsPerDay}
                                step={1}
                                value={[data.settings.maxRepetitionsSubjectPerDay]}
                                onValueChange={([value]) => setData({
                                    ...data,
                                    newChangesMade: true,
                                    settings: { ...data.settings, maxRepetitionsSubjectPerDay: value }
                                })}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default SettingsGeneral;
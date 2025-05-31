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
                breakAtPeriod: data.settings.numPeriodsPerDay < data.settings.breakAtPeriod ? data.settings.numPeriodsPerDay : data.settings.breakAtPeriod,
                maxRepetitionsSubjectPerDay: data.settings.numPeriodsPerDay < data.settings.maxRepetitionsSubjectPerDay ? data.settings.numPeriodsPerDay : data.settings.maxRepetitionsSubjectPerDay,
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
                    {/* Switch: Prefer double lessons */}
                    <div className="flex flex-row gap-3 items-center">
                        <Switch
                            checked={data.settings.preferDoubleLessons}
                            onCheckedChange={(checked) => setData({
                                ...data,
                                newChangesMade: true,
                                settings: { ...data.settings, preferDoubleLessons: checked }
                            })}
                        />
                        <Label>Prefer double lessons</Label>
                    </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-8">
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
                    {/* Slider: Break at period */}
                    <div className="flex flex-col gap-2">
                        <Label>Period designated for a break</Label>
                        <Slider
                            className="lg:min-h-[36px]"
                            min={1}
                            max={data.settings.numPeriodsPerDay}
                            step={1}
                            value={[data.settings.breakAtPeriod]}
                            onValueChange={([value]) => setData({
                                ...data,
                                newChangesMade: true,
                                settings: { ...data.settings, breakAtPeriod: value }
                            })}
                        />
                    </div>
                    {/* Slider: Max number of periods a subject can appear per day */}
                    <div className="flex flex-col gap-2">
                        <Label>Maximum periods per subject per day</Label>
                        <Slider
                            className="lg:min-h-[36px]"
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
            </CardContent>
        </Card>
    );
}

export default SettingsGeneral;
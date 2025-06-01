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
                breakAtPeriod: data.settings.numPeriods - 1 < data.settings.breakAtPeriod ? data.settings.numPeriods - 1 : data.settings.breakAtPeriod,
                maxRepetitionsSubjectPerDay: data.settings.numPeriods < data.settings.maxRepetitionsSubjectPerDay ? data.settings.numPeriods : data.settings.maxRepetitionsSubjectPerDay,
            }
        })
    }, [data.settings.numPeriods]);

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-center sm:text-left">
                    <CardTitle id="general-settings-title">General</CardTitle>
                    <CardDescription id="general-settings-description" aria-labelledby="general-settings-description">
                        Set general settings
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                <div className="grid grid-rows-2 gap-2">
                    {/* Switch: Prefer early periods */}
                    <div className="flex flex-row gap-3 items-center">
                        <Switch
                            id="prefer-early-periods"
                            checked={data.settings.preferEarlyPeriods}
                            aria-checked={data.settings.preferEarlyPeriods}
                            aria-label="Prefer early periods"
                            onCheckedChange={(checked) => setData({
                                ...data,
                                newChangesMade: true,
                                settings: { ...data.settings, preferEarlyPeriods: checked }
                            })}
                            tabIndex={9}
                        />
                        <Label aria-hidden={true}>Prefer early periods</Label>
                    </div>
                    {/* Switch: Prefer double lessons */}
                    <div className="flex flex-row gap-3 items-center">
                        <Switch
                            id="prefer-double-lessons"
                            checked={data.settings.preferDoubleLessons}
                            aria-checked={data.settings.preferDoubleLessons}
                            aria-label="Prefer double lessons"
                            onCheckedChange={(checked) => setData({
                                ...data,
                                newChangesMade: true,
                                settings: { ...data.settings, preferDoubleLessons: checked }
                            })}
                            tabIndex={9}
                        />
                        <Label aria-hidden={true}>Prefer double lessons</Label>
                    </div>
                </div>

                <Separator aria-hidden={true} />

                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Input: Num of periods per day */}
                    <div className="flex flex-col gap-2">
                        <Label id="label-num-of-periods" aria-hidden={true}>Number of periods</Label>
                        <Input
                            id="input-num-periods"
                            type="number"
                            min={4}
                            value={data.settings.numPeriods}
                            aria-labelledby="label-num-of-periods"
                            onChange={(e) => setData({
                                ...data,
                                newChangesMade: true,
                                settings: { ...data.settings, numPeriods: isNaN(parseInt(e.target.value)) || parseInt(e.target.value) < 4 ? 4 : parseInt(e.target.value) }
                            })}
                            tabIndex={9}
                        />
                    </div>
                    {/* Slider: Break at period */}
                    <div className="flex flex-col gap-2">
                        <Label id="label-period-break" aria-hidden={true}>Period designated for a break</Label>
                        <Slider
                            id="slider-period-break"
                            className="lg:min-h-[36px]"
                            step={1}
                            min={2}
                            max={data.settings.numPeriods - 1}
                            value={[data.settings.breakAtPeriod]}
                            aria-valuemin={2}
                            aria-valuemax={data.settings.numPeriods - 1}
                            aria-labelledby="label-period-break"
                            onValueChange={([value]) => setData({
                                ...data,
                                newChangesMade: true,
                                settings: { ...data.settings, breakAtPeriod: value }
                            })}
                            tabIndex={9}
                        />
                    </div>
                    {/* Slider: Max number of periods a subject can appear per day */}
                    <div className="flex flex-col gap-2">
                        <Label id="label-max-repetitions" aria-hidden={true}>Maximum periods per subject per day</Label>
                        <Slider
                            id="slider-max-repetitions"
                            className="lg:min-h-[36px]"
                            min={1}
                            max={data.settings.numPeriods}
                            step={1}
                            value={[data.settings.maxRepetitionsSubjectPerDay]}
                            aria-valuemin={1}
                            aria-valuemax={data.settings.numPeriods}
                            aria-labelledby="label-max-repetitions"
                            onValueChange={([value]) => setData({
                                ...data,
                                newChangesMade: true,
                                settings: { ...data.settings, maxRepetitionsSubjectPerDay: value }
                            })}
                            tabIndex={9}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default SettingsGeneral;
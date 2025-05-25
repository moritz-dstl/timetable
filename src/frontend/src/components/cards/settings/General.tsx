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
import { Separator } from "../../ui/separator";

function SettingsGeneral({ data, setData }) {
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

                {/* <div className="grid grid-rows-1 gap-4 md:grid-cols-2 md:gap-8"> */}
                <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-8">
                    <div className="flex flex-col gap-4">
                        {/* Input: Num of periods per day */}
                        <div className="flex flex-col gap-2">
                            <Label>Number of periods per day</Label>
                            <Input
                                type="number"
                                min={1}
                                value={data.settings.numPeriodsPerDay}
                                onChange={(e) => setData({ 
                                    ...data, 
                                    newChangesMade: true,
                                    settings: { ...data.settings, numPeriodsPerDay: isNaN(parseInt(e.target.value)) ? 8 : parseInt(e.target.value) } 
                                })}
                            />
                        </div>
                        {/* Input: Break window */}
                        <div className="flex flex-col gap-2">
                            <Label>Break window in periods</Label>
                            <div className="flex flex-row items-center gap-2">
                                <Input
                                    type="number"
                                    min={1}
                                    max={data.settings.breakWindow.end - 1}
                                    value={data.settings.breakWindow.start}
                                    onChange={(e) => setData({
                                        ...data,
                                        newChangesMade: true,
                                        settings: {
                                            ...data.settings,
                                            breakWindow: {
                                                ...data.settings.breakWindow,
                                                start: isNaN(parseInt(e.target.value)) ? data.settings.breakWindow.end - 1 : parseInt(e.target.value)
                                            }
                                        }
                                    })}
                                />
                                <Label>-</Label>
                                <Input
                                    type="number"
                                    min={data.settings.breakWindow.start + 1}
                                    max={data.settings.numPeriodsPerDay}
                                    value={data.settings.breakWindow.end}
                                    onChange={(e) => setData({
                                        ...data,
                                        newChangesMade: true,
                                        settings: {
                                            ...data.settings,
                                            breakWindow: {
                                                ...data.settings.breakWindow,
                                                end: isNaN(parseInt(e.target.value)) ? data.settings.breakWindow.start + 1 : parseInt(e.target.value)
                                            }
                                        }
                                    })} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Input: Max consecutive periods */}
                        <div className="flex flex-col gap-2">
                            <Label>Max. number of consecutive periods</Label>
                            <Input
                                type="number"
                                min={1}
                                max={data.settings.numPeriodsPerDay}
                                value={data.settings.maxConsecutivePeriods}
                                onChange={(e) => setData({ 
                                    ...data, 
                                    newChangesMade: true,
                                    settings: { ...data.settings, maxConsecutivePeriods: isNaN(parseInt(e.target.value)) ? 6 : parseInt(e.target.value) } 
                                })}
                            />
                        </div>
                        {/* Input: Max repetitions of subject */}
                        <div className="flex flex-col gap-2">
                            <Label className="md:text-nowrap md:overflow-scroll">Max. number of period repetitions for subject per day</Label>
                            <Input
                                type="number"
                                min={1}
                                max={data.settings.numPeriodsPerDay}
                                value={data.settings.maxRepetitionsSubjectPerDay}
                                onChange={(e) => setData({ 
                                    ...data, 
                                    newChangesMade: true,
                                    settings: { ...data.settings, maxRepetitionsSubjectPerDay: isNaN(parseInt(e.target.value)) ? 2 : parseInt(e.target.value) } 
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
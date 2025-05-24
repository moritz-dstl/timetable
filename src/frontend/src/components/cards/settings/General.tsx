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

function General({ data, setData }) {
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
                            checked={data.general.preferEarlyPeriods}
                            onCheckedChange={(checked) => setData({ ...data, general: { ...data.general, preferEarlyPeriods: checked } })}
                        />
                        <Label>Prefer early periods</Label>
                    </div>
                    {/* Switch: Allow consecutive periods */}
                    <div className="flex flex-row gap-3 items-center">
                        <Switch
                            checked={data.general.allowDoubleLessons}
                            onCheckedChange={(checked) => setData({ ...data, general: { ...data.general, allowDoubleLessons: checked } })}
                        />
                        <Label>Allow double lessons</Label>
                    </div>
                </div>

                {/* <div className="grid grid-rows-1 gap-4 md:grid-cols-2 md:gap-8"> */}
                <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-8">
                    <div className="flex flex-col gap-4">
                        {/* Input: Num of periods per day */}
                        <div className="flex flex-col gap-2">
                            <Label>Number of periods per day:</Label>
                            <Input
                                type="number"
                                min={1}
                                value={data.general.numPeriodsPerDay}
                                onChange={(e) => setData({ ...data, general: { ...data.general, numPeriodsPerDay: isNaN(parseInt(e.target.value)) ? 8 : parseInt(e.target.value) } })}
                            />
                        </div>
                        {/* Input: Break window */}
                        <div className="flex flex-col gap-2">
                            <Label>Break window in periods:</Label>
                            <div className="flex flex-row items-center gap-2">
                                <Input
                                    type="number"
                                    min={1}
                                    max={data.general.breakWindow.end - 1}
                                    value={data.general.breakWindow.start}
                                    onChange={(e) => setData({
                                        ...data,
                                        general: {
                                            ...data.general,
                                            breakWindow: {
                                                ...data.general.breakWindow,
                                                start: isNaN(parseInt(e.target.value)) ? data.general.breakWindow.end - 1 : parseInt(e.target.value)
                                            }
                                        }
                                    })}
                                />
                                <Label>-</Label>
                                <Input
                                    type="number"
                                    min={data.general.breakWindow.start + 1}
                                    max={data.general.numPeriodsPerDay}
                                    value={data.general.breakWindow.end}
                                    onChange={(e) => setData({
                                        ...data,
                                        general: {
                                            ...data.general,
                                            breakWindow: {
                                                ...data.general.breakWindow,
                                                end: isNaN(parseInt(e.target.value)) ? data.general.breakWindow.start + 1 : parseInt(e.target.value)
                                            }
                                        }
                                    })} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Input: Max consecutive periods */}
                        <div className="flex flex-col gap-2">
                            <Label>Max. number of consecutive periods:</Label>
                            <Input
                                type="number"
                                min={1}
                                max={data.general.numPeriodsPerDay}
                                value={data.general.maxConsecutivePeriods}
                                onChange={(e) => setData({ ...data, general: { ...data.general, maxConsecutivePeriods: isNaN(parseInt(e.target.value)) ? 6 : parseInt(e.target.value) } })}
                            />
                        </div>
                        {/* Input: Max repetitions of subject */}
                        <div className="flex flex-col gap-2">
                            <Label className="md:text-nowrap md:overflow-scroll">Max. number of period repetitions for subject per day:</Label>
                            <Input
                                type="number"
                                min={1}
                                max={data.general.numPeriodsPerDay}
                                value={data.general.maxRepetitionsSubjectPerDay}
                                onChange={(e) => setData({ ...data, general: { ...data.general, maxRepetitionsSubjectPerDay: isNaN(parseInt(e.target.value)) ? 2 : parseInt(e.target.value) } })}
                            />
                        </div>

                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default General;
// Components
import { Loader } from "../components/ui/loader"

// Cards
import SettingsDiscardSave from "../components/cards/settings/DiscardSave"
import SettingsGeneral from "../components/cards/settings/General"
import SettingsClasses from "../components/cards/settings/Classes"
import SettingsTeachers from "../components/cards/settings/Teachers"
import SettingsSubjects from "../components/cards/settings/Subjects"

function Settings({ isLoading, data, setData }) {
    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-490px)] flex bg-gray-50 p-4 flex-nowrap justify-center items-center">
                <div className="text-center">
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <>
            <SettingsDiscardSave data={data} setData={setData} />
            <SettingsGeneral data={data} setData={setData} />
            <SettingsClasses data={data} setData={setData} />
            <SettingsTeachers data={data} setData={setData} />
            <SettingsSubjects data={data} setData={setData} />
        </>
    );
}

export default Settings;
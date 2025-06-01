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
            <section
                className="min-h-[calc(100vh-490px)] flex bg-gray-50 p-4 flex-nowrap justify-center items-center"
                aria-busy="true"
                aria-live="polite"
                role="status"
            >
                <div className="text-center">
                    <Loader aria-label="Loading content" />
                </div>
            </section>
        );
    }

    return (
        <>
            {/* Save/Discard */}
            <section
                aria-label="Discard or Save"
                aria-hidden={!data.newChangesMade}
            >
                <SettingsDiscardSave data={data} setData={setData} />
            </section>

            {/* General */}
            <section
                id="content-settings-general"
                role="region"
                aria-labelledby="general-settings-title"
                tabIndex={10}
                onKeyDown={(event) => {
                    if (event.key === "Enter" && document.activeElement?.id === "content-settings-general") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#prefer-early-periods")?.focus();
                    }
                    else if (event.key === "Tab" && document.activeElement?.id === "content-settings-general") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#content-settings-classes")?.focus();
                    }
                    else if (event.key === "Escape") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#content-settings-general")?.focus();
                    }
                }}
            >
                <SettingsGeneral data={data} setData={setData} />
            </section>

            {/* Classes */}
            <section
                id="content-settings-classes"
                role="region"
                aria-labelledby="classes-settings-title"
                tabIndex={20}
                onKeyDown={(event) => {
                    if (event.key === "Enter" && document.activeElement?.id === "content-settings-classes") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#classes-settings-search")?.focus();
                    }
                    else if (event.key === "Tab" && document.activeElement?.id === "content-settings-classes") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#content-settings-teachers")?.focus();
                    }
                    else if (event.key === "Escape") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#content-settings-classes")?.focus();
                    }
                }}
            >
                <SettingsClasses data={data} setData={setData} />
            </section>

            {/* Teachers */}
            <section
                id="content-settings-teachers"
                role="region"
                aria-labelledby="teachers-settings-title"
                tabIndex={30}
                onKeyDown={(event) => {
                    if (event.key === "Enter" && document.activeElement?.id === "content-settings-teachers") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#teachers-settings-search")?.focus();
                    }
                    else if (event.key === "Tab" && document.activeElement?.id === "content-settings-teachers") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#content-settings-subjects")?.focus();
                    }
                    else if (event.key === "Escape") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#content-settings-teachers")?.focus();
                    }
                }}
            >
                <SettingsTeachers data={data} setData={setData} />
            </section>

            {/* Subjects */}
            <section
                id="content-settings-subjects"
                role="region"
                aria-labelledby="subjects-settings-title"
                tabIndex={40}
                onKeyDown={(event) => {
                    if (event.key === "Enter" && document.activeElement?.id === "content-settings-subjects") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#subjects-settings-search")?.focus();
                    }
                    else if (event.key === "Tab" && document.activeElement?.id === "content-settings-subjects") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#footer")?.focus();
                    }
                    else if (event.key === "Escape") {
                        event.preventDefault();
                        document.querySelector<HTMLElement>("#content-settings-subjects")?.focus();
                    }
                }}
            >
                <SettingsSubjects data={data} setData={setData} />
            </section>
        </>
    );
}

export default Settings;
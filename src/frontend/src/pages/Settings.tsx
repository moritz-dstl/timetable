// Cards
import Classes from "../components/cards/Classes"
import Teachers from "../components/cards/Teachers"

function Settings({ isLoading, classes, setClasses, teachers, setTeachers, subjects }) {
    if (!isLoading) {
        return (
            <>
                <Classes classes={classes} setClasses={setClasses} subjects={subjects} />
                <Teachers teachers={teachers} setTeachers={setTeachers} subjects={subjects} />
            </>
        );
    }
}

export default Settings;
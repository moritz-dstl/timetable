// Cards
import Classes from "../components/cards/Classes"

function Settings({ isLoading, classes, setClasses, subjects }) {
    if (!isLoading) {
        return (
            <>
                <Classes classes={classes} setClasses={setClasses} subjects={subjects} />
            </>
        );
    }
}

export default Settings;
// Cards
import General from "../components/cards/settings/General"
import Classes from "../components/cards/settings/Classes"
import Teachers from "../components/cards/settings/Teachers"
import Subjects from "../components/cards/settings/Subjects"

function Settings({ isLoading, data, setData }) {
    if (!isLoading) {
        return (
            <>
                <General data={data} setData={setData} />
                <Classes data={data} setData={setData} />
                <Teachers data={data} setData={setData} />
                <Subjects data={data} setData={setData} />
            </>
        );
    }
}

export default Settings;
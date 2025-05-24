// Cards
import Classes from "../components/cards/settings/Classes"
import Teachers from "../components/cards/settings/Teachers"
import Subjects from "../components/cards/settings/Subjects"

function Settings({ isLoading, data, setData }) {
    if (!isLoading) {
        return (
            <>
                <Classes data={data} setData={setData} />
                <Teachers data={data} setData={setData} />
                <Subjects data={data} setData={setData} />
            </>
        );
    }
}

export default Settings;
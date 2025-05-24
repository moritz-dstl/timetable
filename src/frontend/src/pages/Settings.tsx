// Cards
import Classes from "../components/cards/Classes"
import Teachers from "../components/cards/Teachers"
import Subjects from "../components/cards/Subjects"

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
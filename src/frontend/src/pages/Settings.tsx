// Cards
import Classes from "../components/cards/Classes"
import Teachers from "../components/cards/Teachers"

function Settings({ isLoading, data, setData }) {
    if (!isLoading) {
        return (
            <>
                <Classes data={data} setData={setData} />
                <Teachers data={data} setData={setData} />
            </>
        );
    }
}

export default Settings;
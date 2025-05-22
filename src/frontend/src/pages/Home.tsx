import Cookies from "universal-cookie";

function Home() {
    const cookies = new Cookies();

    // If user is not logged in
    if (!cookies.get("auth")) {
        return (
            <div className="min-h-screen flex bg-gray-50 p-4 flex-nowrap justify-center items-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Welcome!</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-50 p-4 flex-nowrap justify-center items-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Your Account</h1>
            </div>
        </div>
    )
}

export default Home;
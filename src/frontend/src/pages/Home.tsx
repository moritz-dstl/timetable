import Cookies from "universal-cookie";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "../components/ui/tabs";

// Pages
import Welcome from "./Welcome";
import Overview from "./Overview";
import Settings from "./Settings";
import Timetables from "./Timetables";

function Home() {
    const cookies = new Cookies();

    // If user is not logged in
    if (!cookies.get("auth")) {
        return <Welcome />;
    }

    return (
        <div className="min-h-[calc(100vh-130px)] flex bg-gray-50 flex-nowrap">

            <Tabs defaultValue="overview" className="w-full p-4">
                <div className="flex justify-between">
                    <div></div>
                    <TabsList className="m-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="timetables">Timetables</TabsTrigger>
                    </TabsList>
                    <div></div>
                </div>

                <TabsContent value="overview" className="space-y-6">
                    <Overview />
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Settings />
                </TabsContent>

                <TabsContent value="timetables" className="space-y-6">
                    <Timetables />
                </TabsContent>

            </Tabs>

        </div>
    );
}

export default Home;
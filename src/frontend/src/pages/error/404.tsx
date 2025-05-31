
// Icons
import { Snail } from "lucide-react";

function Error404() {
    return (
        <div className="min-h-[calc(100vh-347px)] flex bg-gray-50 p-8 flex-nowrap justify-center items-center">
            <div className="flex flex-col group items-center ml-4">
                <div className="hover:-scale-x-100">
                    <Snail className="w-20 h-20" />
                </div>
                <h1 className="text-3xl font-bold">404</h1>
                <h3 className="">Page not found</h3>
            </div>
        </div>
    );
}

export default Error404;
import { useNavigate } from "react-router-dom";

// Components
// Components
import {
    Card,
    CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

// Icons
import { ArrowRight, LayoutDashboard, RefreshCw, Download } from "lucide-react";

function Welcome() {
    const navigate = useNavigate();

    return (
        <>
            {/* Banner */}
            <section className="relative text-white px-8 md:px-16 py-36">
                <div className="absolute inset-0 bg-[url(/img/collage.png)] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/20" />
                <div className="relative px-4 flex flex-col md:flex-row items-center gap-8">
                    <div className="md:w-3/5 space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Free Online Timetable Generator
                        </h1>
                        <p className="text-lg md:text-xl">
                            A comprehensive solution for educational institutions to create
                            optimal timetables with ease.
                        </p>
                        <div className="pt-4 gap-4">
                            <Button size="lg" variant="secondary" className="gap-2 font-semibold" onClick={() => navigate("/register")}>
                                Get started <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features section */}
            <section className="pt-8 pb-4 bg-gray-50">
                <div className="px-8 md:px-16">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">Powerful Features</h2>
                        <p className="text-muted-foreground mx-auto">
                            Our timetable generator offers everything you need to create and manage school schedules efficiently.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                                <LayoutDashboard className="h-6 w-6 mb-4 text-primary" />
                                <h3 className="text-xl font-semibold mb-2 text-center">Resource Management</h3>
                                <p className="text-muted-foreground text-center">Easily manage classes, teachers, and subjects with our intuitive interface.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                                <RefreshCw className="h-6 w-6 mb-4 text-primary" />
                                <h3 className="text-xl font-semibold mb-2 text-center">Timetable Generation</h3>
                                <p className="text-muted-foreground text-center">Generate optimal timetables based on your resources and constraints.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                                <Download className="h-6 w-6 mb-4 text-primary" />
                                <h3 className="text-xl font-semibold mb-2 text-center">Export Timetables</h3>
                                <p className="text-muted-foreground text-center">Download your timetables as PDF for easy distribution.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Screenshot section */}
            <section className="pt-4 pb-8 bg-gray-50">
                <div className="px-8 md:px-16">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">See It In Action</h2>
                        <p className="text-muted-foreground mx-auto">Our intuitive interface makes timetable management a breeze.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        <Card>
                            <CardContent className="p-2">
                                <img
                                    src="/img/overview.png"
                                    alt="Dashboard Screenshot"
                                    className="w-full h-auto rounded-[8px]"
                                />
                                <div className="pt-4 p-4">
                                    <h3 className="font-semibold text-lg">Dashboard Overview</h3>
                                    <p className="text-muted-foreground">
                                        Get a quick overview of all your resources.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-2">
                                <img
                                    src="/img/timetable.png"
                                    alt="Timetable View"
                                    className="w-full h-auto rounded-[8px]"
                                />
                                <div className="pt-4 p-4">
                                    <h3 className="font-semibold text-lg">Timetable View</h3>
                                    <p className="text-muted-foreground">
                                        Interactive timetable with filtering and export option.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-12 bg-primary text-white">
                <div className="px-8 md:px-16 text-center">
                    <h2 className="text-2xl font-bold mb-6">Ready to get started?</h2>
                    <p className="text-lg max-w-xl mx-auto mb-8">Join thousands of schools already using our timetable generator to save time and reduce scheduling headaches.</p>
                    <Button size="lg" variant="secondary" className="gap-2 font-semibold" onClick={() => navigate("/register")}>
                        Create Free Account <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </section>
        </>
    );
}

export default Welcome;
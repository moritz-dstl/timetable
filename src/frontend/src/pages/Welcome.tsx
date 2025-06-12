import { useNavigate } from "react-router-dom";

// Components
import {
    Card,
    CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

// Icons
import { ArrowRightIcon, LayoutDashboardIcon, RefreshCwIcon, DownloadIcon } from "lucide-react";

/**
 * Landing page introducing the timetable generator.
 *
 * This element provides an overview of the application's purpose and features
 * to new or unauthenticated users.
 *
 * It includes the following sections:
 * - Welcome Banner: A hero section with a brief app description and signup button.
 * - Features: Highlights key capabilities.
 * - Screenshots: Displays example views of the dashboard and timetable.
 * - Call to Action: Encourages users to register and start using the platform.
 *
 * @returns {JSX.Element}
 */
function Welcome() {
    const navigate = useNavigate();

    return (
        <main aria-label="Welcom Page">
            {/* Banner */}
            <section
                className="relative text-white px-8 md:px-16 py-36"
                aria-label="Welcome Banner"
            >
                <div className="absolute inset-0 bg-[url(/img/collage.png)] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
                <div className="relative px-4 flex flex-col md:flex-row items-center gap-8">
                    <div className="md:w-3/5 space-y-6">
                        <h1 className="text-4xl md:text-5xl font-black">
                            Free Online Timetable Generator
                        </h1>
                        <p
                            id="banner-description"
                            aria-labelledby="banner-description"
                            className="text-lg md:text-xl"
                        >
                            A comprehensive solution for educational institutions to create optimal timetables with ease.
                        </p>
                        <div className="pt-4 gap-4">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="gap-2 font-semibold"
                                onClick={() => navigate("/register")}
                                aria-label="Get started by creating an account for free"
                            >
                                Get started <ArrowRightIcon className="h-4 w-4" aria-hidden={true} />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features section */}
            <section
                className="pt-8 pb-4 bg-gray-50"
                aria-labelledby="features-heading"
            >
                <div className="px-8 md:px-16">
                    <div className="text-center mb-8">
                        <h2 id="features-heading" className="text-2xl font-bold mb-2" tabIndex={0}>
                            Powerful Features
                        </h2>
                        <p
                            id="features-description"
                            aria-labelledby="features-description"
                            className="text-muted-foreground mx-auto"
                        >
                            Fottg offers everything you need to create and manage school schedules efficiently.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                                <LayoutDashboardIcon className="h-6 w-6 mb-4 text-primary" aria-hidden={true} />
                                <h3 className="text-xl font-semibold mb-2 text-center">
                                    Resource Management
                                </h3>
                                <p
                                    id="resource-management-description"
                                    aria-labelledby="resource-management-description"
                                    className="text-muted-foreground text-center"
                                >
                                    Easily manage classes, teachers, and subjects with our intuitive interface.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                                <RefreshCwIcon className="h-6 w-6 mb-4 text-primary" aria-hidden={true} />
                                <h3 className="text-xl font-semibold mb-2 text-center">
                                    Timetable Generation
                                </h3>
                                <p
                                    id="timetable-generation-description"
                                    aria-labelledby="timetable-generation-description"
                                    className="text-muted-foreground text-center"
                                >
                                    Generate optimal timetables based on your resources and constraints.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                                <DownloadIcon className="h-6 w-6 mb-4 text-primary" aria-hidden={true} />
                                <h3 className="text-xl font-semibold mb-2 text-center">
                                    Export Timetables
                                </h3>
                                <p
                                    id="export-timetables-description"
                                    aria-labelledby="export-timetables-description"
                                    className="text-muted-foreground text-center"
                                >
                                    Download your timetables as PDF for easy distribution.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Screenshot section */}
            <section
                className="pt-4 pb-8 bg-gray-50"
                aria-labelledby="screenshots-heading"
            >
                <div className="px-8 md:px-16">
                    <div className="text-center mb-8">
                        <h2 id="screenshots-heading" className="text-2xl font-bold mb-2" tabIndex={0}>
                            See It In Action
                        </h2>
                        <p
                            id="screenshots-description"
                            aria-labelledby="screenshots-description"
                            className="text-muted-foreground mx-auto"
                        >
                            Our intuitive interface makes timetable management a breeze.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        <Card>
                            <CardContent className="p-2">
                                <img
                                    src="/img/overview.png"
                                    alt="Screenshot of the dashboard overview showing resource summaries"
                                    className="w-full h-auto rounded-[8px]"
                                />
                                <div className="pt-4 p-4">
                                    <h3 className="font-semibold text-lg">Dashboard Overview</h3>
                                    <p
                                        id="dashboard-overview-description"
                                        aria-labelledby="dashboard-overview-description"
                                        className="text-muted-foreground"
                                    >
                                        Get a quick overview of all your resources.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-2">
                                <img
                                    src="/img/timetable.png"
                                    alt="Screenshot of the timetable view with filtering and export options"
                                    className="w-full h-auto rounded-[8px]"
                                />
                                <div className="pt-4 p-4">
                                    <h3 className="font-semibold text-lg">Timetable View</h3>
                                    <p
                                        id="timetable-view-description"
                                        aria-labelledby="timetable-view-description"
                                        className="text-muted-foreground"
                                    >
                                        Interactive timetable with filtering and export option.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA section */}
            <section
                className="py-12 bg-primary text-white"
                aria-labelledby="cta-heading"
            >
                <div className="px-8 md:px-16 text-center">
                    <h2 id="cta-heading" className="text-2xl font-bold mb-6">
                        Ready to get started?
                    </h2>
                    <p
                        id="cta-description"
                        aria-labelledby="cta-description"
                        className="text-lg max-w-xl mx-auto mb-8"
                    >
                        Join thousands of schools already using Fottg to save time and reduce scheduling headaches.
                    </p>
                    <Button
                        size="lg"
                        variant="secondary"
                        className="gap-2 font-semibold"
                        onClick={() => navigate("/register")}
                        aria-label="Create a free account"
                        onKeyDown={(event) => {
                            if (event.key === "Tab") {
                                event.preventDefault();
                                document.querySelector<HTMLElement>("#footer")?.focus();
                            }
                        }}
                    >
                        Create Free Account <ArrowRightIcon className="h-4 w-4" aria-hidden={true} />
                    </Button>
                </div>
            </section>
        </main>
    );
}

export default Welcome;
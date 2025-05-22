// Components
import { Button } from "../components/ui/button";

function Footer() {
    return (
        <footer className="border-t p-4 pt-3 md:pt-4 bg-gray-50">
            <div className="container">
                <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                        Copyright &copy; {new Date().getFullYear()} Timetable Generator
                    </div>

                    {/* TODO: Navigate to pages and create pages */}
                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            // className="flex items-center gap-1"
                        >
                            Imprint
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            // className="flex items-center gap-1"
                        >
                            Privacy Policy
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            // className="flex items-center gap-1"
                        >
                            Terms of Service
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

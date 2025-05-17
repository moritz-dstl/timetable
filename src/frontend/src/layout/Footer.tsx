// Components
import { Button } from "../components/ui/button";

function Footer() {
    return (
        <footer className="border-t p-4 bg-muted/30">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Timetable Generator. All rights reserved.
                    </div>

                    {/* TODO: Navigate to pages and create pages */}
                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                        >
                            Imprint
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                        >
                            Privacy Policy
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
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

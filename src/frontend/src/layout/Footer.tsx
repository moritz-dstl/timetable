
// Icons
import { Boxes } from "lucide-react";

function Footer() {
    // Links except GitHub not implemented (TODO)
    return (
        <footer className="border-t p-8 bg-gray-50">
            <div>
                <div className="grid grid-rows md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center mb-4 gap-2">
                            <Boxes className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">Fottg</span>
                        </div>
                        <p className="text-muted-foreground max-w-xs">
                            A comprehensive solution for educational institutions to create optimal timetables with ease.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-primary">Features</a>
                                </li>
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-primary">FAQ</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-primary">Documentation</a>
                                </li>
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-primary">Tutorials</a>
                                </li>
                                <li>
                                    <a
                                        href="https://github.com/moritz-dstl/timetable/"
                                        target="_blank"
                                        className="text-muted-foreground hover:text-primary"
                                    >
                                        GitHub Repository
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Legal</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-primary">Imprint</a>
                                </li>
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a>
                                </li>
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-primary">Terms of Service</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-border mt-8 pt-8 pb-0 text-center text-muted-foreground">
                    Copyright &copy; {new Date().getFullYear()} Fottg. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;

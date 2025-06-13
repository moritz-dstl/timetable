// Icons
import { BoxesIcon } from "lucide-react";

/**
 * Displays site branding, navigation links, and copyright information.
 *
 * This element includes:
 * - Shows the product name and a brief description.
 * - Provides three navigation sections with links:
 *   - Product: Features, FAQ.
 *   - Resources: Documentation, Tutorials, GitHub Repository.
 *   - Legal: Imprint, Privacy Policy, Terms of Service.
 * - Displays copyright notice with the current year.
 *
 * Note: Most links are placeholders and need implementation (TODO).
 *
 * @returns {JSX.Element}
 */
function Footer() {
    return (
        <footer
            id="footer"
            role="banner"
            className="border-t p-8 bg-gray-50"
            aria-label="Footer"
            tabIndex={99}
            onKeyDown={(event) => {
                if (event.key === "Enter" && document.activeElement?.id === "footer") {
                    event.preventDefault();
                    document.querySelector<HTMLElement>("#product-features-link")?.focus();
                }
                else if (event.key === "Escape") {
                    event.preventDefault();
                    document.querySelector<HTMLElement>("#footer")?.focus();
                }
                else if (event.key === "Tab" && document.activeElement?.id === "footer") {
                    event.preventDefault();
                    document.querySelector<HTMLElement>("#header-icon")?.focus();
                }
            }}
        >
            <div>
                <div className="grid grid-rows md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center mb-4 gap-2">
                            <BoxesIcon className="h-6 w-6 text-primary" aria-hidden={true} />
                            <span id="footer-heading" className="text-xl font-bold">
                                Fottg
                            </span>
                        </div>
                        <p
                            id="footer-description"
                            className="text-muted-foreground max-w-xs"
                            aria-labelledby="footer-description"
                        >
                            A comprehensive solution for educational institutions to create optimal timetables with ease.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        <nav aria-labelledby="footer-product-heading">
                            <h3
                                id="footer-product-heading"
                                className="font-semibold mb-4"
                            >
                                Product
                            </h3>
                            <ul className="space-y-2" aria-labelledby="footer-product-heading">
                                <li aria-labelledby="product-features-link">
                                    <a
                                        id="product-features-link"
                                        href="#"
                                        className="text-muted-foreground hover:text-primary"
                                        tabIndex={99}
                                    >
                                        Features
                                    </a>
                                </li>
                                <li aria-labelledby="product-faq-link">
                                    <a
                                        id="product-faq-link"
                                        href="#"
                                        className="text-muted-foreground hover:text-primary"
                                        tabIndex={99}
                                    >
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </nav>
                        <nav aria-labelledby="footer-resources-heading">
                            <h3
                                id="footer-resources-heading"
                                className="font-semibold mb-4"
                            >
                                Resources
                            </h3>
                            <ul className="space-y-2" aria-labelledby="footer-resources-heading">
                                <li aria-labelledby="resources-documentation-link">
                                    <a
                                        id="resources-documentation-link"
                                        href="#"
                                        className="text-muted-foreground hover:text-primary"
                                        tabIndex={99}
                                    >
                                        Documentation
                                    </a>
                                </li>
                                <li aria-labelledby="resources-tutorials-link">
                                    <a
                                        id="resources-tutorials-link"
                                        href="#"
                                        className="text-muted-foreground hover:text-primary"
                                        tabIndex={99}
                                    >
                                        Tutorials
                                    </a>
                                </li>
                                <li aria-labelledby="resources-github-link">
                                    <a
                                        id="resources-github-link"
                                        href="https://github.com/moritz-dstl/timetable/"
                                        target="_blank"
                                        className="text-muted-foreground hover:text-primary"
                                        tabIndex={99}
                                    >
                                        GitHub Repository
                                    </a>
                                </li>
                            </ul>
                        </nav>
                        <nav aria-labelledby="footer-legal-heading">
                            <h3
                                id="footer-legal-heading"
                                className="font-semibold mb-4"
                            >
                                Legal
                            </h3>
                            <ul className="space-y-2" aria-labelledby="footer-legal-heading">
                                <li aria-labelledby="legal-imprint-link">
                                    <a
                                        id="legal-imprint-link"
                                        href="#"
                                        className="text-muted-foreground hover:text-primary"
                                        tabIndex={99}
                                    >
                                        Imprint
                                    </a>
                                </li>
                                <li aria-labelledby="legal-privacy-link">
                                    <a
                                        id="legal-privacy-link"
                                        href="#"
                                        className="text-muted-foreground hover:text-primary"
                                        tabIndex={99}
                                    >
                                        Privacy Policy
                                    </a>
                                </li>
                                <li aria-labelledby="legal-terms-link">
                                    <a
                                        id="legal-terms-link"
                                        href="#"
                                        className="text-muted-foreground hover:text-primary"
                                        tabIndex={99}
                                        onKeyDown={(event) => {
                                            if (event.key === "Tab") {
                                                event.preventDefault();
                                                document.querySelector<HTMLElement>("#product-features-link")?.focus();
                                            }
                                        }}
                                    >
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
                <div
                    className="border-t border-border mt-8 pt-8 pb-0 text-center text-muted-foreground"
                    id="footer-copyright"
                    aria-label="Copyright"
                >
                    Copyright &copy; {new Date().getFullYear()} Fottg. Made with love.
                </div>
            </div>
        </footer>
    );
}

export default Footer;

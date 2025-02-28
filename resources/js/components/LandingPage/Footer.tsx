import { Link } from '@inertiajs/react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">TaskMaster</h3>
                        <p className="text-gray-400">
                            Simplifying task management for teams of all sizes.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href={route('login')} className="hover:text-white">Features</Link></li>
                            <li><Link href={route('login')} className="hover:text-white">Pricing</Link></li>
                            <li><Link href={route('login')} className="hover:text-white">Integrations</Link></li>
                            <li><Link href={route('login')} className="hover:text-white">Changelog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href={route('login')} className="hover:text-white">About Us</Link></li>
                            <li><Link href={route('login')} className="hover:text-white">Careers</Link></li>
                            <li><Link href={route('login')} className="hover:text-white">Blog</Link></li>
                            <li><Link href={route('login')} className="hover:text-white">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href={route('login')} className="hover:text-white">Help Center</Link></li>
                            <li><Link href={route('login')} className="hover:text-white">Documentation</Link></li>
                            <li><Link href={route('login')} className="hover:text-white">System Status</Link></li>
                            <li><Link href={route('login')} className="hover:text-white">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400">© 2025 TaskMaster. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-white">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white">
                            <i className="fab fa-facebook"></i>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white">
                            <i className="fab fa-linkedin"></i>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white">
                            <i className="fab fa-github"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import { Link } from '@inertiajs/react';
import taskmangerimg from './image/taks-manager.jpg';
const HeroSectionForLandingPage = () =>{
    return (
        <div className="bg-blue-600 text-white">
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-4">Manage Your Tasks Efficiently</h2>
                        <p className="text-xl mb-6">
                            Streamline your workflow, collaborate with your team, and never miss a deadline again.
                        </p>
                        <div className="flex space-x-4">
                            <Link
                                href={route('register')}
                                className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium"
                            >
                                Get Started
                            </Link>
                            <Link
                                href={route('login')}
                                className="bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-md font-medium"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <img
                            src={taskmangerimg}
                            alt="Task Management Dashboard"
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default HeroSectionForLandingPage;

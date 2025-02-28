import { Link } from '@inertiajs/react';

const CTASection = () =>{
    return (
        <div className="bg-blue-600 text-white">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Boost Your Productivity?</h2>
                <p className="text-xl mb-6 max-w-3xl mx-auto">
                    Join thousands of teams already using TaskMaster to streamline their workflows and achieve their
                    goals.
                </p>
                <Link
                    href={route('register')}
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium text-lg inline-block"
                >
                    Start Your Free Trial
                </Link>
            </div>
        </div>
    )
}

export default CTASection

const FeaturesHighlightForLandingPage = () =>{
    return (
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-blue-600 text-2xl mb-4">
                        <i className="fas fa-tasks"></i>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Task Organization</h3>
                    <p className="text-gray-600">
                        Create, categorize, and prioritize tasks with our intuitive interface.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-blue-600 text-2xl mb-4">
                        <i className="fas fa-users"></i>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                    <p className="text-gray-600">
                        Assign tasks to team members and track progress in real-time.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-blue-600 text-2xl mb-4">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
                    <p className="text-gray-600">
                        Measure productivity and identify bottlenecks with detailed reports.
                    </p>
                </div>
            </div>
        </div>
    )
}
export default FeaturesHighlightForLandingPage;

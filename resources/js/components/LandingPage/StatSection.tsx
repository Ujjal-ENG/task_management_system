const StatSection = ()=>{
    return (
        <div className="bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Trusted by Teams</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-4xl font-bold text-blue-600">10,000+</p>
                        <p className="text-gray-600 mt-2">Active Users</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-4xl font-bold text-blue-600">5,000+</p>
                        <p className="text-gray-600 mt-2">Teams</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-4xl font-bold text-blue-600">1M+</p>
                        <p className="text-gray-600 mt-2">Tasks Completed</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-4xl font-bold text-blue-600">99.9%</p>
                        <p className="text-gray-600 mt-2">Uptime</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default StatSection

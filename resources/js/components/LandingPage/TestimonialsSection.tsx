import user1 from './image/user1.jpg';
import user2 from './image/user2.jpg';
import user3 from './image/user3.jpg';

const TestimonialsSection = ()=>{
    return (
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-200">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-600 mb-4">
                        "TaskMaster has revolutionized how our team manages projects. The intuitive interface makes it
                        easy to track progress and meet deadlines."
                    </p>
                    <div className="flex items-center">
                        <img src={user1} alt="User" className="rounded-full mr-3 object-contain w-15" />
                        <div>
                            <p className="font-medium">Sarah Johnson</p>
                            <p className="text-gray-500 text-sm">Project Manager, TechCorp</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-600 mb-4">
                        "Since implementing TaskMaster, we've seen a 30% increase in productivity. The analytics
                        features help us identify and resolve bottlenecks quickly."
                    </p>
                    <div className="flex items-center">
                        <img src={user2} alt="User" className="rounded-full mr-3 object-contain w-15" />
                        <div>
                            <p className="font-medium">Michael Chen</p>
                            <p className="text-gray-500 text-sm">CTO, Innovate Inc.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-600 mb-4">
                        "The collaboration features are fantastic. Our remote team now works together seamlessly, no
                        matter where they're located."
                    </p>
                    <div className="flex items-center">
                        <img src={user3} alt="User" className="rounded-full mr-3 object-contain w-15" />
                        <div>
                            <p className="font-medium">Jessica Rodriguez</p>
                            <p className="text-gray-500 text-sm">Team Lead, Global Solutions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TestimonialsSection

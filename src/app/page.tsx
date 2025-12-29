export default function ComingSoon() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center space-y-8 p-8">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Stay Fit with AI
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto" />
                </div>

                <div className="space-y-2">
                    <p className="text-2xl md:text-3xl text-cyan-400 font-light">
                        Under Construction
                    </p>
                    <p className="text-gray-500">
                        Something amazing is coming. Stay tuned.
                    </p>
                </div>

                <div className="flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

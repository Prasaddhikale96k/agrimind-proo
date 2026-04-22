export default function LMLoading() {
  return (
    <div className="min-h-screen bg-gray-950 p-6 animate-pulse">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-9 bg-white/10 rounded-xl w-72 mb-2" />
            <div className="h-4 bg-white/5 rounded-lg w-96" />
          </div>
          <div className="h-10 bg-white/10 rounded-xl w-36" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="h-72 bg-white/5 border border-white/10 rounded-2xl" />
          <div className="h-72 bg-white/5 border border-white/10 rounded-2xl" />
        </div>

        <div className="h-96 bg-white/5 border border-white/10 rounded-2xl" />
      </div>
    </div>
  );
}
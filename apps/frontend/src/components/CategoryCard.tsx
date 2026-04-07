type CategoryCardProps = {
  title: string;
  progress: number;
  lessons: string;
  tone: string;
};

export function CategoryCard({
  title,
  progress,
  lessons,
  tone,
}: CategoryCardProps) {
  return (
    <article
      className={`rounded-[28px] border-2 border-gray-900 p-5 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] ${tone}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 inline-flex rounded-full border-2 border-gray-900 bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-700">
            {lessons}
          </p>
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-gray-900 bg-white text-lg font-black text-gray-900">
          {progress}%
        </div>
      </div>

      <div className="rounded-full border-2 border-gray-900 bg-white p-1">
        <div
          className="h-4 rounded-full bg-[#9BE564] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </article>
  );
}

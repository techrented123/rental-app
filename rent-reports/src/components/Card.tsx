interface CardProps {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`card p-4 sm:p-6 ${className}`}>
      {title && (
        <h3 className="card-title text-lg font-semibold text-brand dark:text-primary-300 border-b border-slate-200 dark:border-slate-600 pb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

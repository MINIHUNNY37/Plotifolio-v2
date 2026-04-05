import type { PropsWithChildren, ReactNode } from 'react';

interface PageStat {
  label: string;
  value: string;
}

interface PageLayoutShellProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  stats?: PageStat[];
  maxWidthClassName?: string;
}

export const PageLayoutShell = ({
  eyebrow,
  title,
  description,
  actions,
  stats = [],
  maxWidthClassName = 'max-w-[1480px]',
  children,
}: PropsWithChildren<PageLayoutShellProps>) => (
  <div className="page-shell">
    <div className={['page-shell__frame', maxWidthClassName].join(' ')}>
      <section className="page-hero">
        <div className="page-hero__mesh" />
        <div className="page-hero__body">
          <div className="page-hero__copy">
            <div className="page-kicker">{eyebrow}</div>
            <h1 className="page-title">{title}</h1>
            <p className="page-description">{description}</p>
          </div>
          {actions ? <div className="page-actions">{actions}</div> : null}
        </div>
        {stats.length > 0 ? (
          <div className="page-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="page-stat">
                <div className="page-stat__label">{stat.label}</div>
                <div className="page-stat__value">{stat.value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
      {children}
    </div>
  </div>
);

import type { PropsWithChildren, ReactNode } from 'react';

interface OrnatePanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export const OrnatePanel = ({
  title,
  subtitle,
  actions,
  className = '',
  children,
}: PropsWithChildren<OrnatePanelProps>) => (
  <section
    className={[
      'premium-panel-surface relative overflow-hidden rounded-xl',
      className,
    ].join(' ')}
  >
    <div className="pointer-events-none absolute inset-[1px] rounded-[11px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_18%,rgba(0,0,0,0.1)_100%)] opacity-80" />
    {(title || actions) ? (
      <div className="relative flex items-start justify-between gap-3 border-b border-white/5 px-4 py-3">
        <div className="min-w-0">
          {title ? <h3 className="font-display text-[11px] font-extrabold uppercase tracking-[0.28em] text-[var(--st-text)]">{title}</h3> : null}
          {subtitle ? <p className="mt-1 text-xs leading-relaxed text-[var(--st-text-muted)]">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
    ) : null}
    <div className="relative">{children}</div>
  </section>
);

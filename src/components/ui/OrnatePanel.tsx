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
      'relative overflow-hidden rounded-[26px] border border-brass/28 bg-[linear-gradient(180deg,rgba(17,34,53,0.92),rgba(7,11,17,0.96))] shadow-panel backdrop-blur-xl',
      className,
    ].join(' ')}
  >
    <div className="pointer-events-none absolute inset-[1px] rounded-[24px] border border-white/5 bg-panel-sheen opacity-60" />
    {(title || actions) ? (
      <div className="relative flex items-start justify-between gap-3 border-b border-brass/15 px-4 py-3">
        <div>
          {title ? <h3 className="font-display text-sm uppercase tracking-[0.22em] text-parchment">{title}</h3> : null}
          {subtitle ? <p className="mt-1 text-xs text-frost/60">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
    ) : null}
    <div className="relative">{children}</div>
  </section>
);

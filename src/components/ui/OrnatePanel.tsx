import type { PropsWithChildren, ReactNode } from 'react';

interface OrnatePanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: 'default' | 'hero' | 'subtle';
}

export const OrnatePanel = ({
  title,
  subtitle,
  actions,
  className = '',
  contentClassName = '',
  tone = 'default',
  children,
}: PropsWithChildren<OrnatePanelProps>) => (
  <section
    className={[
      'ornate-panel',
      tone === 'hero' ? 'ornate-panel--hero' : '',
      tone === 'subtle' ? 'ornate-panel--subtle' : '',
      className,
    ].join(' ')}
  >
    <div className="ornate-panel__sheen" />
    <div className="ornate-panel__orb ornate-panel__orb--a" />
    <div className="ornate-panel__orb ornate-panel__orb--b" />
    {(title || actions) ? (
      <div className="ornate-panel__header">
        <div>
          {title ? <h3 className="ornate-panel__title">{title}</h3> : null}
          {subtitle ? <p className="ornate-panel__subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="relative z-[1]">{actions}</div> : null}
      </div>
    ) : null}
    <div className={['relative z-[1]', contentClassName].join(' ').trim()}>{children}</div>
  </section>
);

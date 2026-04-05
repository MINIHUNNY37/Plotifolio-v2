import type { PropsWithChildren } from 'react';

interface InspectorFieldRowProps {
  label: string;
}

export const InspectorFieldRow = ({ label, children }: PropsWithChildren<InspectorFieldRowProps>) => (
  <label className="inspector-field">
    <span>{label}</span>
    {children}
  </label>
);

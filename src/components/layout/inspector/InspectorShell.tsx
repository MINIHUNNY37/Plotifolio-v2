import type { PropsWithChildren, ReactNode } from 'react';
import { OrnatePanel } from '../../ui/OrnatePanel';

interface InspectorShellProps {
  title: string;
  subtitle: string;
  tabs?: ReactNode;
}

export const InspectorShell = ({
  title,
  subtitle,
  tabs,
  children,
}: PropsWithChildren<InspectorShellProps>) => (
  <div className="absolute bottom-5 right-4 top-28 z-20 w-[360px]">
    <OrnatePanel className="h-full" subtitle={subtitle} title={title}>
      <div className="flex h-full flex-col">
        {tabs}
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </OrnatePanel>
  </div>
);

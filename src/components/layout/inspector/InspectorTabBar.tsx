interface InspectorTabBarProps<T extends string> {
  tabs: readonly T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export const InspectorTabBar = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: InspectorTabBarProps<T>) => (
  <div className="flex gap-1 overflow-x-auto border-b border-brass/15 px-3 py-2">
    {tabs.map((item) => (
      <button
        key={item}
        className={item === activeTab ? 'inspector-tab inspector-tab-active' : 'inspector-tab'}
        onClick={() => onTabChange(item)}
        type="button"
      >
        {item}
      </button>
    ))}
  </div>
);

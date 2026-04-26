import React, { useState } from 'react';

export interface ThemeColors {
  name: string;
  primary50: string;
  primary100: string;
  primary200: string;
  primary300: string;
  primary400: string;
  primary500: string;
  primary600: string;
  primary700: string;
  primary800: string;
  primary900: string;
  gold50: string;
  gold100: string;
  gold200: string;
  gold300: string;
  gold400: string;
  gold500: string;
  gold600: string;
  gold700: string;
  gold800: string;
  gold900: string;
}

export const DEFAULT_THEMES: ThemeColors[] = [
  {
    name: 'Earthy Brown (Current)',
    primary50: '#faf9f7', primary100: '#f5f3ef', primary200: '#e8e4dc',
    primary300: '#d4cdc0', primary400: '#b8ad9a', primary500: '#9d8f79',
    primary600: '#87786a', primary700: '#6f6259', primary800: '#5c524c',
    primary900: '#4c453f',
    gold50: '#fdfbf7', gold100: '#fbf6ec', gold200: '#f5e8cf',
    gold300: '#edd7b0', gold400: '#e2bb81', gold500: '#d4a15a',
    gold600: '#c08644', gold700: '#a06a38', gold800: '#825532',
    gold900: '#6b462b',
  },
  {
    name: 'Deep Navy Blue',
    primary50: '#f0f4fa', primary100: '#dce5f5', primary200: '#b9cceb',
    primary300: '#8daed9', primary400: '#5b8dc4', primary500: '#3a6fa8',
    primary600: '#2a5690', primary700: '#1e3f72', primary800: '#162d55',
    primary900: '#010f40',
    gold50: '#faf6f0', gold100: '#f2e8d5', gold200: '#e6d0ab',
    gold300: '#d4a15a', gold400: '#c8903f', gold500: '#b07d30',
    gold600: '#96682a', gold700: '#7a5225', gold800: '#5e3d1e',
    gold900: '#452b16',
  },
  {
    name: 'Ocean Teal',
    primary50: '#f0faf7', primary100: '#d5f0ea', primary200: '#abe0d5',
    primary300: '#6fc7b8', primary400: '#3aad9c', primary500: '#1a8f82',
    primary600: '#0e7469', primary700: '#0a5d54', primary800: '#084a43',
    primary900: '#043b35',
    gold50: '#fdfbf0', gold100: '#f9f3d4', gold200: '#f0e1a0',
    gold300: '#e6cc6b', gold400: '#d4b03e', gold500: '#b8942e',
    gold600: '#9c7a22', gold700: '#7e6119', gold800: '#614a12',
    gold900: '#48370d',
  },
  {
    name: 'Forest Green',
    primary50: '#f2f7f2', primary100: '#dceadc', primary200: '#b8d4b8',
    primary300: '#8fb98f', primary400: '#6a9e6a', primary500: '#4a834a',
    primary600: '#376b37', primary700: '#285428', primary800: '#1c3f1c',
    primary900: '#0f2d0f',
    gold50: '#faf8f0', gold100: '#f0ead2', gold200: '#e0d0a0',
    gold300: '#ccb36e', gold400: '#b89a48', gold500: '#9e8234',
    gold600: '#846a28', gold700: '#6a531e', gold800: '#513e15',
    gold900: '#3b2c0f',
  },
  {
    name: 'Charcoal Slate',
    primary50: '#f5f5f6', primary100: '#e8e8eb', primary200: '#ced1d6',
    primary300: '#a8adb6', primary400: '#7d8590', primary500: '#5c636e',
    primary600: '#484f58', primary700: '#3a4048', primary800: '#2d3238',
    primary900: '#1e2228',
    gold50: '#fdfaf5', gold100: '#f6edd8', gold200: '#ecd5a8',
    gold300: '#ddb870', gold400: '#c99640', gold500: '#ad7c2e',
    gold600: '#916424', gold700: '#754e1d', gold800: '#5a3a16',
    gold900: '#422910',
  },
  {
    name: 'Royal Purple',
    primary50: '#f5f0fa', primary100: '#e6d9f5', primary200: '#ccb3eb',
    primary300: '#a87dd9', primary400: '#8850c2', primary500: '#6b35a5',
    primary600: '#56288a', primary700: '#431e6e', primary800: '#321654',
    primary900: '#240e3d',
    gold50: '#faf8f0', gold100: '#f0e8d0', gold200: '#e0cc96',
    gold300: '#d0ac5c', gold400: '#c09238', gold500: '#a87a28',
    gold600: '#8c6420', gold700: '#704e1a', gold800: '#563a14',
    gold900: '#3f2a0f',
  },
];

interface ThemePickerProps {
  currentTheme: ThemeColors;
  onThemeChange: (theme: ThemeColors) => void;
}

const ThemePicker: React.FC<ThemePickerProps> = ({ currentTheme, onThemeChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customTheme, setCustomTheme] = useState<ThemeColors>({ ...currentTheme });

  const handleCustomColorChange = (key: keyof ThemeColors, value: string) => {
    const updated = { ...customTheme, [key]: value };
    setCustomTheme(updated);
    if (key !== 'name') {
      onThemeChange(updated);
    }
  };

  const exportCSS = () => {
    const lines = [
      `/* ${currentTheme.name} */`,
      `primary: {`,
      `  50: '${currentTheme.primary50}',`,
      `  100: '${currentTheme.primary100}',`,
      `  200: '${currentTheme.primary200}',`,
      `  300: '${currentTheme.primary300}',`,
      `  400: '${currentTheme.primary400}',`,
      `  500: '${currentTheme.primary500}',`,
      `  600: '${currentTheme.primary600}',`,
      `  700: '${currentTheme.primary700}',`,
      `  800: '${currentTheme.primary800}',`,
      `  900: '${currentTheme.primary900}',`,
      `},`,
      `gold: {`,
      `  50: '${currentTheme.gold50}',`,
      `  100: '${currentTheme.gold100}',`,
      `  200: '${currentTheme.gold200}',`,
      `  300: '${currentTheme.gold300}',`,
      `  400: '${currentTheme.gold400}',`,
      `  500: '${currentTheme.gold500}',`,
      `  600: '${currentTheme.gold600}',`,
      `  700: '${currentTheme.gold700}',`,
      `  800: '${currentTheme.gold800}',`,
      `  900: '${currentTheme.gold900}',`,
      `},`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  };

  const [saveToast, setSaveToast] = useState(false);

  const saveCustomTheme = () => {
    const name = prompt('Name this theme:', 'My Custom Theme');
    if (!name) return;
    const saved = { ...customTheme, name };
    const customs: ThemeColors[] = JSON.parse(localStorage.getItem('demo-custom-themes') || '[]');
    const existing = customs.findIndex(c => c.name === name);
    if (existing >= 0) {
      customs[existing] = saved;
    } else {
      customs.push(saved);
    }
    localStorage.setItem('demo-custom-themes', JSON.stringify(customs));
    onThemeChange(saved);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Minimized toggle button */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: currentTheme.primary900 }}
          title="Open Theme Picker"
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </button>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div
          className="rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
          style={{
            width: '380px',
            maxHeight: '85vh',
            backgroundColor: 'white',
            border: `2px solid ${currentTheme.primary200}`,
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: currentTheme.primary900, color: 'white' }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <h3 className="font-semibold text-sm">Theme Customizer</h3>
            </div>
            <div className="flex items-center gap-2">
              {saveToast && (
                <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Saved!</span>
              )}
              {activeTab === 'custom' && (
                <button
                  onClick={saveCustomTheme}
                  className="text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: currentTheme.primary600, color: 'white' }}
                >
                  Save
                </button>
              )}
              <button
                onClick={exportCSS}
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: currentTheme.gold600, color: 'white' }}
              >
                Export
              </button>
              <button
                onClick={() => setExpanded(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: currentTheme.primary200 }}>
            <button
              onClick={() => setActiveTab('presets')}
              className="flex-1 py-2 text-sm font-medium transition-colors"
              style={{
                borderBottom: activeTab === 'presets' ? `2px solid ${currentTheme.primary900}` : '2px solid transparent',
                color: activeTab === 'presets' ? currentTheme.primary900 : currentTheme.primary500,
              }}
            >
              Presets
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className="flex-1 py-2 text-sm font-medium transition-colors"
              style={{
                borderBottom: activeTab === 'custom' ? `2px solid ${currentTheme.primary900}` : '2px solid transparent',
                color: activeTab === 'custom' ? currentTheme.primary900 : currentTheme.primary500,
              }}
            >
              Custom
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 110px)' }}>
            {activeTab === 'presets' && (
              <div className="p-3 space-y-2">
                {DEFAULT_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => onThemeChange(theme)}
                    className="w-full p-3 rounded-xl border-2 transition-all text-left"
                    style={{
                      borderColor: currentTheme.name === theme.name ? currentTheme.primary900 : currentTheme.primary100,
                      backgroundColor: currentTheme.name === theme.name ? currentTheme.primary50 : 'white',
                    }}
                  >
                    <p className="text-xs font-semibold mb-2" style={{ color: currentTheme.primary900 }}>
                      {theme.name}
                    </p>
                    <div className="flex gap-1">
                      {[theme.primary900, theme.primary700, theme.primary500, theme.primary300, theme.primary100,
                        theme.gold600, theme.gold400, theme.gold200].map((color, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-md border"
                          style={{ backgroundColor: color, borderColor: currentTheme.primary200 }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="p-3 space-y-4">
                {/* Primary Colors */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: currentTheme.primary900 }}>
                    Primary Colors
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ['primary900', '900 (Darkest)'],
                      ['primary800', '800'],
                      ['primary700', '700'],
                      ['primary600', '600'],
                      ['primary500', '500'],
                      ['primary400', '400'],
                      ['primary300', '300'],
                      ['primary200', '200'],
                      ['primary100', '100'],
                      ['primary50', '50 (Lightest)'],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customTheme[key as keyof ThemeColors] as string}
                          onChange={(e) => handleCustomColorChange(key as keyof ThemeColors, e.target.value)}
                          className="w-8 h-8 rounded border cursor-pointer"
                          style={{ borderColor: currentTheme.primary200 }}
                        />
                        <div>
                          <p className="text-xs" style={{ color: currentTheme.primary600 }}>{label}</p>
                          <p className="text-xs font-mono" style={{ color: currentTheme.primary400 }}>
                            {customTheme[key as keyof ThemeColors] as string}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gold/Accent Colors */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: currentTheme.primary900 }}>
                    Accent (Gold) Colors
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ['gold900', '900 (Darkest)'],
                      ['gold800', '800'],
                      ['gold700', '700'],
                      ['gold600', '600 (CTA)'],
                      ['gold500', '500'],
                      ['gold400', '400'],
                      ['gold300', '300'],
                      ['gold200', '200'],
                      ['gold100', '100'],
                      ['gold50', '50 (Lightest)'],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customTheme[key as keyof ThemeColors] as string}
                          onChange={(e) => handleCustomColorChange(key as keyof ThemeColors, e.target.value)}
                          className="w-8 h-8 rounded border cursor-pointer"
                          style={{ borderColor: currentTheme.primary200 }}
                        />
                        <div>
                          <p className="text-xs" style={{ color: currentTheme.primary600 }}>{label}</p>
                          <p className="text-xs font-mono" style={{ color: currentTheme.primary400 }}>
                            {customTheme[key as keyof ThemeColors] as string}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: currentTheme.primary900 }}>
                    Preview
                  </p>
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: currentTheme.primary200 }}>
                    <div className="p-3" style={{ backgroundColor: customTheme.primary900 }}>
                      <p className="text-white text-sm font-serif">Heading on Dark</p>
                      <p style={{ color: customTheme.primary200 }} className="text-xs">Subtext on dark</p>
                      <button
                        className="mt-2 px-3 py-1 text-white text-xs rounded"
                        style={{ backgroundColor: customTheme.gold600 }}
                      >
                        CTA Button
                      </button>
                    </div>
                    <div className="p-3" style={{ backgroundColor: customTheme.primary50 }}>
                      <p className="text-sm font-serif" style={{ color: customTheme.primary900 }}>Heading on Light</p>
                      <p className="text-xs" style={{ color: customTheme.primary700 }}>Body text</p>
                      <button
                        className="mt-2 px-3 py-1 text-white text-xs rounded"
                        style={{ backgroundColor: customTheme.primary900 }}
                      >
                        Primary Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Current theme name */}
          <div
            className="px-4 py-2 text-center border-t"
            style={{ backgroundColor: currentTheme.primary50, borderColor: currentTheme.primary100 }}
          >
            <p className="text-xs" style={{ color: currentTheme.primary500 }}>
              Active: {currentTheme.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePicker;

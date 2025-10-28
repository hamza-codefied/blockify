import { theme } from 'antd';

export const getAntdTheme = (isDark = false) => {
  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#00B894',
      borderRadius: 8,
      wireframe: false,
    },
    components: {
      Layout: {
        bodyBg: isDark ? '#1f2937' : '#fafafa',
        headerBg: isDark ? '#111827' : '#ffffff',
        footerBg: isDark ? '#111827' : '#f9fafb',
      },
      Card: {
        headerBg: isDark ? '#1f2937' : '#ffffff',
      },
      Tabs: {
        inkBarColor: '#00B894',
        itemSelectedColor: '#00B894',
        itemHoverColor: '#00B894',
        itemActiveColor: '#00B894',
      },
      Menu: {
        itemBg: isDark ? '#1f2937' : '#ffffff',
        itemSelectedBg: isDark ? '#374151' : '#f3f4f6',
        itemSelectedColor: '#00B894',
      },
      Table: {
        headerBg: isDark ? '#1f2937' : '#ffffff',
        bodySortBg: isDark ? '#1f2937' : '#ffffff',
      },
      Input: {
        colorBgContainer: isDark ? '#1f2937' : '#ffffff',
        colorBorder: isDark ? '#374151' : '#d1d5db',
        colorText: isDark ? '#e5e7eb' : '#111827',
      },
      Select: {
        colorBgContainer: isDark ? '#1f2937' : '#ffffff',
        colorBorder: isDark ? '#374151' : '#d1d5db',
      },
      DatePicker: {
        colorBgContainer: isDark ? '#1f2937' : '#ffffff',
      },
      Modal: {
        contentBg: isDark ? '#1f2937' : '#ffffff',
        headerBg: isDark ? '#1f2937' : '#ffffff',
      },
      Drawer: {
        colorBgElevated: isDark ? '#1f2937' : '#ffffff',
      },
      Popover: {
        colorBgElevated: isDark ? '#1f2937' : '#ffffff',
      },
      Dropdown: {
        colorBgElevated: isDark ? '#1f2937' : '#ffffff',
      },
      Tooltip: {
        colorBgSpotlight: isDark ? '#111827' : '#1f2937',
      },
      Tag: {
        defaultBg: isDark ? '#374151' : '#f3f4f6',
      },
      Timeline: {
        colorText: isDark ? '#e5e7eb' : '#111827',
      },
      Switch: {
        colorPrimary: '#00B894',
      },
      Checkbox: {
        colorPrimary: '#00B894',
      },
      Radio: {
        colorPrimary: '#00B894',
      },
      Button: {
        primaryColor: '#ffffff',
        primaryShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
      },
    },
  };
};

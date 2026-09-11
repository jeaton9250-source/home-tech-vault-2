import { Platform } from 'react-native';

export const colors = {
  navy: '#14283B',
  navySoft: '#203A50',
  cream: '#F5F1E8',
  paper: '#FFFEFA',
  ink: '#17212A',
  muted: '#6C7881',
  line: '#E2DED3',
  olive: '#788A4A',
  oliveDark: '#5E7135',
  oliveWash: '#EEF1E4',
  sand: '#E8DFCF',
  rust: '#A65C4F',
  amber: '#B88636',
  white: '#FFFFFF',
};

export const fonts = {
  serif: Platform.select({ ios: 'Iowan Old Style', android: 'serif', default: 'Georgia' }),
  sans: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'system-ui' }),
};

export const shadows = {
  card: {
    shadowColor: '#14283B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
  },
};

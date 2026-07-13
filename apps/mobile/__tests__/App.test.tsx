import { render } from '@testing-library/react-native';

import App from '../App';

describe('App', () => {
  it('boots and shows the app root', () => {
    const { getByTestId, getByText } = render(<App />);
    expect(getByTestId('app-root')).toBeTruthy();
    expect(getByText('Boja')).toBeTruthy();
  });
});

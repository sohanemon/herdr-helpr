import React from 'react';
import { render, Text } from 'ink';
import { setTimeout } from 'timers/promises';

const App = () => <Text color="green">Hello from Ink!</Text>;
render(<App />);
setTimeout(500).then(() => process.exit(0));

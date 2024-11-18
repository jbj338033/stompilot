import { ThemeProvider } from "./components/ThemeProvider";
import { AppRouter } from "./routes";

export const App = () => {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
};

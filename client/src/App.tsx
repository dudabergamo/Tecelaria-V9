import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import RegisterMemory from "./pages/RegisterMemory";
import RegisterMemoryFromQuestion from "./pages/RegisterMemoryFromQuestion";
import MemoriesTimeline from "./pages/MemoriesTimeline";
import Caixinhas from "./pages/Caixinhas";
import SortearPergunta from "./pages/SortearPergunta";
import ManageKit from "@/pages/ManageKit";
import Profile from "@/pages/Profile";
import MemoryDetail from "./pages/MemoryDetail";
import EditMemory from "./pages/EditMemory";
import Login from "./pages/Login";
import Callback from "./pages/Callback";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/callback" component={Callback} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/registrar-memoria" component={RegisterMemory} />
      <Route path="/registrar-memoria-caixinha" component={RegisterMemoryFromQuestion} />
      <Route path="/minhas-memorias" component={MemoriesTimeline} />
      <Route path="/caixinhas" component={Caixinhas} />
      <Route path="/sortear-pergunta" component={SortearPergunta} />
      <Route path="/gerenciar-kit" component={ManageKit} />
      <Route path="/perfil" component={Profile} />
      <Route path="/memoria/:id" component={MemoryDetail} />
      <Route path="/editar-memoria/:id" component={EditMemory} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
import Signup from "./pages/Signup";
import EmailConfirmation from "./pages/EmailConfirmation";
import Conclusion from "./pages/Conclusion";
import CompleteSignup from "./pages/CompleteSignup";
import Callback from "./pages/Callback";
 
function Router() {
  return (
    <Switch>
      {/* Rotas públicas */}
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/email-confirmation" component={EmailConfirmation} />
      <Route path="/complete-signup" component={CompleteSignup} />
      <Route path="/callback" component={Callback} />

      {/* Rotas protegidas */}
      <Route path="/conclusion" component={(props) => <ProtectedRoute component={Conclusion} {...props} />} />
      <Route path="/onboarding" component={(props) => <ProtectedRoute component={Onboarding} {...props} />} />
      <Route path="/dashboard" component={(props) => <ProtectedRoute component={Dashboard} {...props} />} />
      <Route path="/registrar-memoria" component={(props) => <ProtectedRoute component={RegisterMemory} {...props} />} />
      <Route path="/registrar-memoria-caixinha" component={(props) => <ProtectedRoute component={RegisterMemoryFromQuestion} {...props} />} />
      <Route path="/minhas-memorias" component={(props) => <ProtectedRoute component={MemoriesTimeline} {...props} />} />
      <Route path="/caixinhas" component={(props) => <ProtectedRoute component={Caixinhas} {...props} />} />
      <Route path="/sortear-pergunta" component={(props) => <ProtectedRoute component={SortearPergunta} {...props} />} />
      <Route path="/gerenciar-kit" component={(props) => <ProtectedRoute component={ManageKit} {...props} />} />
      <Route path="/perfil" component={(props) => <ProtectedRoute component={Profile} {...props} />} />
      <Route path="/memoria/:id" component={(props) => <ProtectedRoute component={MemoryDetail} {...props} />} />
      <Route path="/editar-memoria/:id" component={(props) => <ProtectedRoute component={EditMemory} {...props} />} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

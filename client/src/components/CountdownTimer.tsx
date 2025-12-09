import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CountdownTimerProps {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  onExtend?: () => void;
  showExtendButton?: boolean;
  notStartedMessage?: string;
  startAfterDays?: number;
}

export function CountdownTimer({
  title,
  description,
  startDate,
  endDate,
  totalDays,
  onExtend,
  showExtendButton = false,
  notStartedMessage,
  startAfterDays,
}: CountdownTimerProps) {
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const hasNotStarted = startAfterDays !== undefined && daysSinceStart < startAfterDays;
  
  const timeRemaining = endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
  const progress = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));

  // Determinar cor baseada no tempo restante
  const getColor = () => {
    const percentage = (daysRemaining / totalDays) * 100;
    if (percentage > 30) return "text-green-600";
    if (percentage > 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = () => {
    const percentage = (daysRemaining / totalDays) * 100;
    if (percentage > 30) return "bg-green-600";
    if (percentage > 10) return "bg-yellow-600";
    return "bg-red-600";
  };

  const isExpired = daysRemaining === 0;
  const isNearExpiry = daysRemaining <= 7 && daysRemaining > 0;

  // Se o prazo ainda não iniciou, mostrar mensagem especial
  if (hasNotStarted && notStartedMessage) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {notStartedMessage}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Inicia no dia {startAfterDays} do programa
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isNearExpiry ? "border-yellow-500 border-2" : ""} ${isExpired ? "border-red-500 border-2" : ""}`}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {isNearExpiry && (
            <AlertCircle className="h-5 w-5 text-yellow-600 animate-pulse" />
          )}
          {isExpired && (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className={`text-4xl font-bold ${getColor()}`}>
                {daysRemaining}
              </span>
              <span className="text-muted-foreground ml-2">
                {daysRemaining === 1 ? "dia restante" : "dias restantes"}
              </span>
            </div>
          </div>

          <Progress value={progress} className={`h-2 [&>div]:${getProgressColor()}`} />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Início: {startDate.toLocaleDateString("pt-BR")}</span>
            <span>Término: {endDate.toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Prazo encerrado. {onExtend ? "Adquira uma prorrogação para continuar." : ""}
            </p>
          </div>
        )}

        {isNearExpiry && !isExpired && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 font-medium">
              ⏰ Seu prazo está acabando! {onExtend ? "Considere adquirir uma prorrogação." : ""}
            </p>
          </div>
        )}

        {showExtendButton && onExtend && (daysRemaining <= 7) && (
          <Button 
            onClick={onExtend} 
            variant={isExpired ? "default" : "outline"}
            className="w-full"
          >
            {isExpired ? "Prorrogar Agora (R$ 97/mês)" : "Prorrogar Prazo (R$ 97/mês)"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

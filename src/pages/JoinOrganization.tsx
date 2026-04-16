import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Shield, ArrowRight, AlertCircle, CheckCircle2, Home } from "lucide-react";
import { useInviteLink, InviteData } from "@/hooks/organization/useInviteLink";
import { useAuth } from "@/contexts/AuthContext";

const PERMISSION_LABELS: Record<string, string> = {
  'profile_views': 'Visualizações do Perfil',
  'view_profile': 'Ver Perfil Completo',
  'link_clicks': 'Cliques em Links',
  'leads': 'Leads Gerados',
  'connections': 'Conexões de Rede',
  'view_connections': 'Ver Conexões',
  'contact_info': 'Informações de Contacto',
  'analytics': 'Analytics Completo',
  'view_analytics': 'Ver Analytics',
  'performance_metrics': 'Métricas de Performance',
};

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  'profile_views': 'A organização pode ver quantas pessoas visitaram o seu perfil',
  'view_profile': 'A organização poderá ver informações do seu perfil',
  'link_clicks': 'A organização pode ver estatísticas de cliques nos seus links',
  'leads': 'A organização pode aceder aos leads que você gerou',
  'connections': 'A organização pode ver as conexões de rede que estabeleceu',
  'view_connections': 'A organização poderá ver a sua rede de contactos',
  'contact_info': 'A organização pode aceder às suas informações de contacto',
  'analytics': 'A organização pode ver análises detalhadas da sua atividade',
  'view_analytics': 'A organização poderá ver as suas estatísticas de desempenho',
  'performance_metrics': 'A organização pode ver todas as suas métricas de desempenho',
};

const ROLE_LABELS: Record<string, string> = {
  'employee': 'Funcionário',
  'manager': 'Gestor',
  'admin': 'Administrador',
};

const JoinOrganization = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { getInvitationByToken, acceptInvitation, loading } = useInviteLink();

  const [invitation, setInvitation] = useState<InviteData | null>(null);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [accepting, setAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load invitation data
  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setError('Link de convite inválido');
        setInviteLoading(false);
        return;
      }

      const data = await getInvitationByToken(token);
      
      if (!data) {
        setError('Este convite é inválido, já foi utilizado ou expirou.');
        setInviteLoading(false);
        return;
      }

      setInvitation(data);
      // Pre-select all requested permissions
      setSelectedPermissions(data.permissions_requested);
      setInviteLoading(false);
    };

    if (!authLoading) {
      loadInvitation();
    }
  }, [token, authLoading]);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev =>
      checked
        ? [...prev, permissionId]
        : prev.filter(p => p !== permissionId)
    );
  };

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    const result = await acceptInvitation(token, selectedPermissions);
    setAccepting(false);

    if (result.success) {
      setSuccess(true);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      setError(result.error || 'Erro ao aceitar convite');
    }
  };

  const handleLoginRedirect = () => {
    // Redirect to login with the invitation token
    navigate(`/login?signup=true&invitation=${token}`);
  };

  // Loading state
  if (authLoading || inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">A carregar convite...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Convite Inválido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Bem-vindo à Equipa!</CardTitle>
            <CardDescription>
              Foi adicionado à organização com sucesso. A redirecionar para o dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {invitation?.organization_logo ? (
              <Avatar className="h-16 w-16 mx-auto mb-4">
                <AvatarImage src={invitation.organization_logo} />
                <AvatarFallback>
                  <Building2 className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            )}
            <CardTitle>Junte-se a {invitation?.organization_name}</CardTitle>
            <CardDescription>
              Foi convidado para entrar nesta organização como{' '}
              <Badge variant="secondary" className="ml-1">
                {ROLE_LABELS[invitation?.role || 'employee'] || invitation?.role}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Para aceitar este convite, precisa de ter uma conta PocketCV.
            </p>
            <Button onClick={handleLoginRedirect} size="lg" className="w-full">
              Criar Conta ou Entrar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="ghost" asChild>
              <Link to="/">Voltar ao Início</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Authenticated - show accept invitation form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {invitation?.organization_logo ? (
            <Avatar className="h-16 w-16 mx-auto mb-4">
              <AvatarImage src={invitation.organization_logo} />
              <AvatarFallback>
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          )}
          <CardTitle>Aceitar Convite</CardTitle>
          <CardDescription>
            Junte-se a <strong>{invitation?.organization_name}</strong> como{' '}
            <Badge variant="secondary">
              {ROLE_LABELS[invitation?.role || 'employee'] || invitation?.role}
            </Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Position/Department info */}
          {(invitation?.position || invitation?.department) && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              {invitation.position && (
                <p><strong>Cargo:</strong> {invitation.position}</p>
              )}
              {invitation.department && (
                <p><strong>Departamento:</strong> {invitation.department}</p>
              )}
            </div>
          )}

          {/* Privacy Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <Label className="font-medium">Controlo de Privacidade</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Escolha que informações quer partilhar com a organização:
            </p>
            
            <div className="space-y-3 pt-2">
              {invitation?.permissions_requested.map((permissionId) => (
                <div key={permissionId} className="flex items-start space-x-3">
                  <Checkbox
                    id={permissionId}
                    checked={selectedPermissions.includes(permissionId)}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permissionId, !!checked)
                    }
                  />
                  <div className="grid gap-0.5 leading-none">
                    <Label
                      htmlFor={permissionId}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {PERMISSION_LABELS[permissionId] || permissionId}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {PERMISSION_DESCRIPTIONS[permissionId]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button
            onClick={handleAccept}
            disabled={accepting || loading}
            size="lg"
            className="w-full"
          >
            {accepting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Aceitar e Entrar
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link to="/">Recusar Convite</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinOrganization;

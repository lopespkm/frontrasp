import { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  Key, 
  Building, 
  Globe, 
  Settings, 
  Eye, 
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Shield,
  Database,
  RefreshCw,
  CreditCard
} from "lucide-react"
import { Poppins } from 'next/font/google'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["100", "200", "300","400","500", "600", "700"],
})

interface Credentials {
  // PixUp credentials
  pixup_client_id?: string;
  pixup_client_secret?: string;
  pixup_base_url?: string;
  is_configured: boolean;
}

export default function CredentialsPage() {
  const { token } = useAuth();
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState({
    pixup_client_id: '',
    pixup_client_secret: '',
    pixup_base_url: 'https://api.pixupbr.com/v2'
  });

  const fetchCredentials = async () => {
    if (!token) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://api.ultrapanel.shop/v1/api/setting', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar credenciais');
      }

      const settings = data.data[0] || {};
      setCredentials({
        // PixUp credentials
        pixup_client_id: settings.pixup_client_id || '',
        pixup_client_secret: settings.pixup_client_secret || '',
        pixup_base_url: settings.pixup_base_url || 'https://api.pixupbr.com/v2',
      
        // Check if PixUp is configured
        is_configured: !!(
          settings.pixup_client_id && 
          settings.pixup_client_secret && 
          settings.pixup_base_url
        )
      });
      
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [token]);

  const handleEdit = () => {
    if (credentials) {
      setEditForm({
        pixup_client_id: credentials.pixup_client_id || '',
        pixup_client_secret: credentials.pixup_client_secret || '',
        pixup_base_url: credentials.pixup_base_url || 'https://api.pixupbr.com/v2'
      });
      setIsEditModalOpen(true);
      setEditError('');
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditForm({
      pixup_client_id: '',
      pixup_client_secret: '',
      pixup_base_url: 'https://api.pixupbr.com/v2'
    });
    setEditError('');
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateCredentials = async () => {
    if (!token) return;
    
    setEditLoading(true);
    setEditError('');
    
    try {
      const response = await fetch('https://api.ultrapanel.shop/v1/api/setting/credentials', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar credenciais');
      }

      toast.success('Credenciais PixUp atualizadas com sucesso!');
      handleCloseEditModal();
      await fetchCredentials();
      
    } catch (err: any) {
      setEditError(err.message);
      toast.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  const maskSecret = (secret: string) => {
    if (!secret) return '';
    if (secret.length <= 8) return '*'.repeat(secret.length);
    return secret.substring(0, 4) + '*'.repeat(secret.length - 8) + secret.substring(secret.length - 4);
  };

  if (loading) {
    return (
      <div className={poppins.className}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-neutral-700 bg-neutral-800 px-4">
              <SidebarTrigger className="-ml-1 text-neutral-400 hover:text-white" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-neutral-600" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#" className="text-neutral-400 hover:text-white">
                      Administração
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block text-neutral-600" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/v2/administrator/settings" className="text-neutral-400 hover:text-white">
                      Configurações
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-neutral-600" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white font-medium">Carregando...</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className={poppins.className}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-neutral-700 bg-neutral-800 px-4">
            <SidebarTrigger className="-ml-1 text-neutral-400 hover:text-white" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-neutral-600" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#" className="text-neutral-400 hover:text-white">
                    Administração
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-neutral-600" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/v2/administrator/settings" className="text-neutral-400 hover:text-white">
                    Configurações
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-neutral-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white font-medium">Credenciais PixUp</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          
          <div className="flex flex-1 flex-col gap-6 p-6 bg-neutral-900">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="text-neutral-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Credenciais PixUp</h1>
                  <p className="text-neutral-400 text-sm">
                    Gerencie as credenciais de integração com a PixUp para processamento de pagamentos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleEdit} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Credenciais
                </Button>
                <Button 
                  onClick={fetchCredentials} 
                  variant="outline"
                  className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <Card className="bg-neutral-800 border-neutral-700">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Status Card */}
            <Card className="bg-neutral-800 border-neutral-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    credentials?.is_configured 
                      ? 'bg-green-500/20' 
                      : 'bg-red-500/20'
                  }`}>
                    <CreditCard className={`w-6 h-6 ${
                      credentials?.is_configured 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Status da Integração PixUp
                    </h3>
                    <p className="text-neutral-400 text-sm">
                      {credentials?.is_configured 
                        ? 'Credenciais PixUp configuradas corretamente' 
                        : 'Credenciais PixUp não configuradas'
                      }
                    </p>
                  </div>
                </div>
                <Badge className={
                  credentials?.is_configured 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }>
                  {credentials?.is_configured ? 'Configurado' : 'Não Configurado'}
                </Badge>
              </div>
            </Card>

            {/* Credentials Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client ID */}
              <Card className="bg-neutral-800 border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-400" />
                    Client ID
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(credentials?.pixup_client_id || '', 'client_id')}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {copiedField === 'client_id' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-neutral-400" />
                    <div className="flex-1">
                      <p className="text-neutral-400 text-sm">Identificador do Cliente</p>
                      <p className="text-white font-mono text-sm break-all">
                        {credentials?.pixup_client_id || 'Não configurado'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Client Secret */}
              <Card className="bg-neutral-800 border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    Client Secret
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="text-neutral-400 hover:text-white"
                    >
                      {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(credentials?.pixup_client_secret || '', 'client_secret')}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {copiedField === 'client_secret' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-neutral-400" />
                    <div className="flex-1">
                      <p className="text-neutral-400 text-sm">Chave Secreta do Cliente</p>
                      <p className="text-white font-mono text-sm break-all">
                        {showSecrets 
                          ? credentials?.pixup_client_secret || 'Não configurado'
                          : maskSecret(credentials?.pixup_client_secret || '')
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Base URL */}
              <Card className="bg-neutral-800 border-neutral-700 p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-400" />
                    Base URL da API
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(credentials?.pixup_base_url || '', 'base_url')}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {copiedField === 'base_url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-neutral-400" />
                    <div className="flex-1">
                      <p className="text-neutral-400 text-sm">URL Base da API PixUp</p>
                      <p className="text-white font-mono text-sm break-all">
                        {credentials?.pixup_base_url || 'https://api.pixupbr.com/v2'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* PixUp Information Card */}
            <Card className="bg-neutral-800 border-neutral-700 p-6">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sobre a PixUp</h3>
                  <p className="text-neutral-400 text-sm mb-3">
                    A PixUp é uma plataforma de pagamentos que oferece soluções completas para processamento 
                    de transações financeiras, incluindo PIX, cartões de crédito e débito.
                  </p>
                  <ul className="text-neutral-400 text-sm space-y-1">
                    <li>• Processamento de pagamentos em tempo real</li>
                    <li>• Suporte a múltiplas formas de pagamento</li>
                    <li>• API RESTful com documentação completa</li>
                    <li>• Webhooks para notificações de status</li>
                    <li>• Ambiente de sandbox para testes</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Security Notice */}
            <Card className="bg-neutral-800 border-neutral-700 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Aviso de Segurança</h3>
                  <p className="text-neutral-400 text-sm mb-3">
                    As credenciais da PixUp são informações sensíveis que permitem acesso aos serviços de pagamento. 
                    Mantenha essas informações seguras e não as compartilhe com pessoas não autorizadas.
                  </p>
                  <ul className="text-neutral-400 text-sm space-y-1">
                    <li>• Nunca compartilhe suas credenciais em repositórios públicos</li>
                    <li>• Use variáveis de ambiente em produção</li>
                    <li>• Monitore regularmente as transações</li>
                    <li>• Configure webhooks para notificações em tempo real</li>
                    <li>• Teste sempre em ambiente sandbox antes da produção</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-neutral-800 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Editar Credenciais PixUp
            </DialogTitle>
          </DialogHeader>
          
          {editError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{editError}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_id" className="text-neutral-300">Client ID</Label>
              <Input
                id="client_id"
                type="text"
                value={editForm.pixup_client_id}
                onChange={(e) => handleEditFormChange('pixup_client_id', e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white font-mono"
                placeholder="Digite o Client ID da PixUp"
                disabled={editLoading}
              />
              <p className="text-neutral-500 text-xs">
                Identificador único fornecido pela PixUp para sua aplicação
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_secret" className="text-neutral-300">Client Secret</Label>
              <Input
                id="client_secret"
                type="password"
                value={editForm.pixup_client_secret}
                onChange={(e) => handleEditFormChange('pixup_client_secret', e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white font-mono"
                placeholder="Digite o Client Secret da PixUp"
                disabled={editLoading}
              />
              <p className="text-neutral-500 text-xs">
                Chave secreta para autenticação. Mantenha esta informação segura.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="base_url" className="text-neutral-300">Base URL</Label>
              <Input
                id="base_url"
                type="url"
                value={editForm.pixup_base_url}
                onChange={(e) => handleEditFormChange('pixup_base_url', e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white font-mono"
                placeholder="https://api.pixupbr.com/v2"
                disabled={editLoading}
              />
              <p className="text-neutral-500 text-xs">
                URL base da API PixUp BR. Use https://sandbox-api.pixupbr.com/v2 para testes.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCloseEditModal}
              className="flex-1 bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600"
              disabled={editLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateCredentials}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={editLoading}
            >
              {editLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Salvar Credenciais'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
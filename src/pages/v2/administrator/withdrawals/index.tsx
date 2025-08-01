import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ArrowDownLeft, Clock, CreditCard, DollarSign, Loader2, Check, X, Eye } from "lucide-react"
import { Poppins } from 'next/font/google'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["100", "200", "300","400","500", "600", "700"],
})

// Interfaces para os dados da API
interface User {
  id: string;
  username: string;
  email: string;
}

interface Withdrawal {
  id: string;
  userId: string;
  walletId: string;
  amount: string;
  document: string;
  pix_key: string;
  pix_type: string;
  currency: string;
  symbol: string;
  status: boolean;
  payment_method: string;
  metadata: any;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  user: User;
}

interface WithdrawalsResponse {
  success: boolean;
  data: {
    withdrawals: Withdrawal[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Função para formatar valores monetários
const formatCurrency = (amount: string, symbol: string = 'R$') => {
  const numericAmount = parseFloat(amount);
  return `${symbol} ${numericAmount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Função para formatar data
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export default function WithdrawalsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Função para buscar saques da API
  const fetchWithdrawals = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      const response = await fetch(`https://api.ultrapanel.shop/v1/api/admin/withdrawals?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token inválido ou expirado');
        }
        throw new Error('Erro ao carregar saques');
      }
      
      const data: WithdrawalsResponse = await response.json();
      
      if (data.success) {
        setWithdrawals(data.data.withdrawals);
        setPagination(data.data.pagination);
      } else {
        throw new Error('Erro na resposta da API');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar saques:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token) {
      fetchWithdrawals();
    } else if (!authLoading && !token) {
      setError('Usuário não autenticado. Faça login para continuar.');
      setLoading(false);
    }
  }, [token, authLoading]);

  const filteredWithdrawals = withdrawals.filter(withdrawal => 
    withdrawal.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.amount.includes(searchTerm) ||
    withdrawal.pix_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.document.includes(searchTerm)
  );

  // Calcular estatísticas
  const stats = {
    totalProcessed: withdrawals
      .filter(w => w.status === true)
      .reduce((sum, w) => sum + parseFloat(w.amount), 0),
    totalPending: withdrawals
      .filter(w => w.status === false)
      .reduce((sum, w) => sum + parseFloat(w.amount), 0),
    totalRequests: withdrawals.length
  };

  const statsCards = [
    {
      title: "Total processado",
      value: formatCurrency(stats.totalProcessed.toString()),
      icon: ArrowDownLeft,
      description: "Saques confirmados",
      color: "text-green-400"
    },
    {
      title: "Total pendente",
      value: formatCurrency(stats.totalPending.toString()),
      icon: Clock,
      description: "Aguardando processamento",
      color: "text-yellow-400"
    },
    {
      title: "Total de Solicitações",
      value: stats.totalRequests.toString(),
      icon: CreditCard,
      description: "Pedidos de saque",
      color: "text-yellow-400"
    }
  ];

  const getStatusColor = (status: boolean) => {
    return status
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Processado' : 'Pendente';
  };

  const getPixTypeColor = (pixType: string) => {
    const colors = {
      'EMAIL': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'CPF': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'CNPJ': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'PHONE': 'bg-green-500/10 text-green-400 border-green-500/20',
      'RANDOM': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
    return colors[pixType as keyof typeof colors] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  // Função para aprovar saque
  const handleApprove = async (withdrawalId: string) => {
    try {
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`https://api.ultrapanel.shop/v1/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao aprovar saque');
      }

      // Recarregar a lista após aprovação
      await fetchWithdrawals(pagination.page);
    } catch (err) {
      console.error('Erro ao aprovar saque:', err);
      alert('Erro ao aprovar saque. Tente novamente.');
    }
  };

  // Função para negar saque
  const handleReject = async (withdrawalId: string) => {
    try {
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`https://api.ultrapanel.shop/v1/api/admin/withdrawals/${withdrawalId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao negar saque');
      }

      // Recarregar a lista após rejeição
      await fetchWithdrawals(pagination.page);
    } catch (err) {
      console.error('Erro ao negar saque:', err);
      alert('Erro ao negar saque. Tente novamente.');
    }
  };

  // Função para visualizar detalhes
  const handleView = (withdrawalId: string) => {
    console.log('Visualizar saque:', withdrawalId);
    // Implementar modal ou página de detalhes
  };

  return (
    <div className={poppins.className}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-neutral-700 bg-neutral-800 px-4">
            <SidebarTrigger className="-ml-1 text-neutral-400 hover:text-white" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-neutral-600"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#" className="text-neutral-400 hover:text-white">
                    Administração
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-neutral-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white font-medium">Saques</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          
          <div className="flex flex-1 flex-col gap-6 p-6 bg-neutral-900">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-neutral-300" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Gerenciar Saques</h1>
                  <p className="text-neutral-400 text-sm">
                    {loading ? 'Carregando...' : `Total de ${pagination.total} solicitações`}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statsCards.map((stat, index) => (
                  <Card key={index} className="bg-neutral-800 border-neutral-700 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-neutral-400 text-sm font-medium mb-1">{stat.title}</p>
                        <p className={`text-2xl font-bold mb-2 ${stat.color}`}>{stat.value}</p>
                        <p className="text-neutral-500 text-xs">{stat.description}</p>
                      </div>
                      <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center ml-4">
                        <stat.icon className="w-6 h-6 text-neutral-400" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Search Section */}
            <Card className="bg-neutral-800 border-neutral-700 p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Buscar por usuário, ID, chave PIX, documento ou valor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-400 focus:border-yellow-500"
                  />
                </div>
                <Button variant="outline" className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600">
                  Filtros
                </Button>
              </div>
            </Card>

            {/* Withdrawals Table */}
            <Card className="bg-neutral-800 border-neutral-700">
              <div className="p-6 border-b border-neutral-700">
                <h3 className="text-lg font-semibold text-white">Lista de Saques</h3>
                <p className="text-neutral-400 text-sm">
                  {loading ? 'Carregando...' : `Mostrando ${filteredWithdrawals.length} de ${pagination.total} solicitações`}
                </p>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mx-auto mb-4" />
                  <p className="text-neutral-400">Carregando saques...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Erro ao carregar saques</h3>
                  <p className="text-neutral-400 text-sm mb-4">{error}</p>
                  <Button onClick={() => fetchWithdrawals()} className="bg-yellow-600 hover:bg-yellow-700">
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <div style={{ minWidth: '1200px' }}>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-neutral-700 hover:bg-neutral-700/50">
                            <TableHead className="text-neutral-300 font-medium w-[180px]">ID do Saque</TableHead>
                            <TableHead className="text-neutral-300 font-medium w-[100px]">Status</TableHead>
                            <TableHead className="text-neutral-300 font-medium w-[120px]">Usuário</TableHead>
                            <TableHead className="text-neutral-300 font-medium w-[180px]">Email</TableHead>
                            <TableHead className="text-neutral-300 font-medium w-[100px]">Valor</TableHead>
                            <TableHead className="text-neutral-300 font-medium w-[150px]">Chave PIX</TableHead>
                            <TableHead className="text-neutral-300 font-medium w-[80px]">Tipo PIX</TableHead>
                            <TableHead className="text-neutral-300 font-medium w-[120px]">Documento</TableHead>
                            <TableHead className="text-neutral-300 font-medium w-[150px]">Data Criação</TableHead>
                            <TableHead className="text-neutral-300 font-medium w-[150px]">Data Processamento</TableHead>
                            <TableHead className="text-neutral-300 font-medium w-[120px] text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredWithdrawals.map((withdrawal) => (
                            <TableRow key={withdrawal.id} className="border-neutral-700 hover:bg-neutral-700/30">
                              <TableCell className="text-neutral-400 font-mono text-xs">
                                {withdrawal.id.substring(0, 8)}...{withdrawal.id.substring(withdrawal.id.length - 8)}
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(withdrawal.status)}>
                                  {getStatusText(withdrawal.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-white font-medium">{withdrawal.user.username}</TableCell>
                              <TableCell className="text-neutral-300">{withdrawal.user.email}</TableCell>
                              <TableCell className="text-green-400 font-medium">
                                {formatCurrency(withdrawal.amount, withdrawal.symbol)}
                              </TableCell>
                              <TableCell className="text-neutral-300 font-mono text-xs">{withdrawal.pix_key}</TableCell>
                              <TableCell>
                                <Badge className={getPixTypeColor(withdrawal.pix_type)}>
                                  {withdrawal.pix_type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-neutral-300 font-mono">{withdrawal.document}</TableCell>
                              <TableCell className="text-neutral-300">{formatDate(withdrawal.created_at)}</TableCell>
                              <TableCell className="text-neutral-300">
                                {withdrawal.processed_at ? (
                                  formatDate(withdrawal.processed_at)
                                ) : (
                                  <span className="text-neutral-500">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleView(withdrawal.id)}
                                    className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                    title="Visualizar detalhes"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {!withdrawal.status && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleApprove(withdrawal.id)}
                                        className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                        title="Aprovar saque"
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleReject(withdrawal.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        title="Negar saque"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  {filteredWithdrawals.length === 0 && !loading && (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-neutral-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Nenhum saque encontrado</h3>
                      <p className="text-neutral-400 text-sm">Tente ajustar os filtros de busca</p>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
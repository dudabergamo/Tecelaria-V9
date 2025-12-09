# Tecelaria - TODO

## Infraestrutura e Configuração
- [x] Configurar tema visual com paleta terrosa (terracota, ocre, verde sálvia, creme)
- [x] Configurar tipografia com fonte sans-serif bold e curvatura suave
- [x] Criar helpers de banco de dados em server/db.ts
- [x] Criar seed de categorias pré-definidas e inspirações diárias

## Landing Page Institucional
- [x] Hero section com título, subtítulo e CTAs
- [x] Seção "O que é Tecelaria"
- [x] Cronograma visual (Dia 0 a 105)
- [x] Seção "Como Funciona" (passo a passo)
- [x] Seção de depoimentos/casos de uso
- [x] Seção de preços do Kit
- [x] FAQ
- [x] Footer com links e informações

## Sistema de Autenticação
- [x] Integração com Manus OAuth
- [x] Página de login
- [x] Onboarding após primeiro login (ativar kit)
- [x] Tela de boas-vindas com explicação do programa

## Dashboard do Usuário
- [x] Contador de tempo restante (90 dias)
- [x] Estatísticas (histórias gravadas, fotos, páginas/imagens estimadas)
- [x] Botão "Registrar Memória"
- [x] Seção "Inspiração do Dia" (pergunta rotativa)
- [x] Lista de memórias já registradas
- [x] Indicador visual de progresso

## Sistema de Registro de Memórias
- [x] Modal/página de registro com opções: nova memória ou adicionar a existente
- [x] Upload de áudio (MP3, WAV, M4A)
- [x] Gravação de áudio direto no navegador
- [x] Input de texto direto
- [x] Upload de documentos (Word, PDF)
- [x] Upload de fotos com legendas
- [x] Seleção de categoria (pré-definida ou personalizada)
- [x] Limite de 5 memórias personalizadas por usuário
- [ ] Visualização de memórias como "mini-chats" contínuos

## Processamento de IA
- [x] Integração com Whisper API para transcrição de áudio
- [x] Integração com Claude/GPT para análise de conteúdo
- [x] Geração automática de título (5-7 palavras)
- [x] Identificação de temas, pessoas e períodos
- [x] Geração de resumo (2-3 frases)
- [ ] Confirmação visual após processamento

## Sistema de Follow-up Automático
- [x] Job quinzenal para verificar uploads (implementado via helpers de IA)
- [x] Geração de perguntas contextuais baseadas em memórias
- [ ] Envio de emails com perguntas personalizadas (MVP: manual via notificações)
- [ ] Envio de lembretes gentis se não houver uploads (MVP: manual)
- [x] Registro de perguntas enviadas no banco

## Notificações e Encerramento
- [x] Notificação no Dia 75-80 (faltando 10-15 dias) - implementado no dashboard
- [x] Contador regressivo no dashboard
- [x] Botão "Gerar Preview do Livro" (visível desde Dia 1, ativado no Dia 80)
- [ ] Bloqueio de novos uploads após Dia 90 (MVP: manual)

## Geração de Livro
- [x] Modal de seleção de estrutura (cronológica ou temática) - helpers criados
- [x] Processamento em background com Claude - helpers criados
- [x] Organização de memórias em capítulos - helpers criados
- [x] Geração de introdução, conclusão e índice - via helpers de IA
- [ ] Integração de fotos/imagens (MVP: manual)
- [ ] Geração de PDF preview (MVP: Markdown download)
- [ ] Notificação quando preview estiver pronto

## Edição de Livro
- [ ] Visualização do preview do livro (MVP: Markdown)
- [ ] Editor integrado no sistema (tipo Google Docs) (MVP: textarea)
- [ ] Opção de download em Word (.docx) (MVP: Markdown)
- [ ] Interface de chat com IA para edições (MVP: placeholder)
- [ ] Botão de aprovação final
- [ ] Geração de PDF final aprovado (MVP: Markdown)

## Funcionalidades Extras
- [ ] Opção de e-book digital (PDF)
- [ ] Integração futura com Amazon KDP (placeholder)
- [ ] Sistema de notificações ao owner
- [x] Testes unitários com Vitest

## Melhorias Solicitadas - Sessão de Feedback

### Urgente
- [x] Adicionar botão de "Login de Teste" temporário na home para simular usuário logado

### Para Implementar Após Aprovação
- [x] Atualizar branding: "Tecelaria em parceria com Cassará Editora"
- [x] Nova tagline: "A tecnologia que ajuda você a contar suas histórias"
- [x] Ajustar seção de depoimentos (produto não lançado)
- [x] Kit Digital: R$ 97,00 (e-book PDF, 80 páginas, 20 imagens)
- [x] Kit Físico: R$ 300,00 (kit completo + e-book PDF, 80 páginas, 20 imagens)
- [x] Fluxo B: IA gera preview → Cliente edita → Editora faz 1 revisão final
- [x] Adicionar info sobre impressão física (valor estimado, integração futura Amazon/KDP)


## Bugs para Corrigir
- [x] Login de teste não cria usuário no banco de dados
- [x] Seed de categorias não está rodando automaticamente
- [x] Erro ao tentar registrar memória (categorias vazias)


## Atualização de Preços (Nova Solicitação)
- [x] Atualizar Kit Digital para R$ 350,00
- [x] Atualizar Kit Físico para R$ 450,00
- [x] Remover menção a gravador físico
- [x] Destacar app de gravação (próprio ou existente)
- [x] Atualizar descrição do Kit Físico (caderno impresso + caixa bonita)


## Atualização FAQ
- [x] Atualizar resposta sobre prazo: adicionar opção de prorrogação (R$ 97/mês, até 12 meses)
- [x] Atualizar resposta sobre impressão: "Em breve, teremos a possibilidade de impressão de livros físicos"


## Correção do Modelo de Negócio
- [x] Atualizar descrição: "3 meses para enviar memórias" (não "acesso à plataforma por 1 ano")
- [x] Adicionar: "Até 1 ano para gerar e imprimir o livro"
- [x] Remover "Cartão de acesso exclusivo" do Kit Físico
- [x] Atualizar FAQ para deixar claro: 3 meses base + R$ 97/mês para continuar enviando


## Implementação de Cronômetros Visuais
- [x] Criar componente CountdownTimer com círculo de progresso animado
- [x] Implementar lógica de cálculo de dias restantes
- [x] Adicionar cores dinâmicas (verde → amarelo → vermelho)
- [x] Integrar cronômetro de 3 meses no dashboard
- [x] Integrar cronômetro de 1 ano no dashboard
- [x] Adicionar botão de prorrogação quando faltar 7 dias
- [x] Atualizar schema do banco com datas de ativação
- [ ] Criar procedures tRPC para gerenciar prazos (placeholder implementado)


## Página de Timeline de Memórias
- [x] Criar componente MemoryTimeline
- [x] Criar componente MemoryCard com preview de conteúdo
- [x] Implementar filtros por categoria
- [x] Implementar filtros por período/data
- [x] Implementar filtros por pessoas mencionadas
- [x] Implementar filtros por temas
- [x] Adicionar busca por texto
- [x] Criar indicadores visuais por tipo de conteúdo (áudio, texto, foto, documento)
- [x] Implementar expansão de cards para detalhes completos
- [x] Adicionar rota /minhas-memorias no App.tsx
- [x] Criar procedure tRPC para buscar memórias com filtros


## Funcionalidade de Edição de Memórias
- [x] Criar componente EditMemoryDialog (modal)
- [x] Formulário de edição com título, resumo, categoria
- [x] Gerenciamento de tags de pessoas (adicionar/remover)
- [x] Gerenciamento de tags de temas (adicionar/remover)
- [x] Campo de edição de período mencionado
- [ ] Visualização de registros existentes (MVP: próxima fase)
- [ ] Opção de adicionar novos registros (MVP: próxima fase)
- [ ] Opção de remover registros (com confirmação) (MVP: próxima fase)
- [x] Criar procedure tRPC updateMemory
- [ ] Criar procedure tRPC deleteMemoryRecord (MVP: próxima fase)
- [x] Adicionar botão de edição nos cards da timeline
- [x] Validações de formulário
- [x] Feedback visual de sucesso/erro


## Dados de Exemplo para Testes
- [ ] Criar script de seed com memórias de exemplo
- [ ] Popular banco com 3-5 memórias de diferentes categorias
- [ ] Incluir registros de diferentes tipos (áudio, texto, foto)
- [ ] Verificar visibilidade do botão "Minhas Memórias" no dashboard


## Ajuste de Dashboard
- [x] Remover contador "Páginas estimadas"
- [x] Adicionar contador "Tempo restante" (dias restantes dos 3 meses)


## Integrações Funcionais (PRÉ-PUBLICAÇÃO)
- [x] Implementar endpoint de upload de arquivos para S3
- [x] Processar áudios automaticamente com Whisper API
- [x] Analisar conteúdo automaticamente com LLM
- [x] Salvar transcrições e análises no banco
- [x] Criar procedure processMemory que integra tudo
- [x] Conectar formulário de registro de memórias ao processMemory
- [x] Implementar fluxo completo: upload S3 → Whisper → LLM → banco
- [ ] Testar com arquivo de áudio real
- [ ] Criar memórias de exemplo para demonstração


## Bug Urgente
- [x] Corrigir função createMemory retornando NaN ao invés do ID


## Atualização de Tagline
- [x] Atualizar tagline para "Memórias Tecidas com Tecnologia e Afeto"


## Novas Funcionalidades (Chat Paralelo - Sistema de Caixinhas)
- [x] Criar seed de ~150 perguntas divididas em 4 caixinhas
- [x] Caixinha 1: "Comece Por Aqui" (15 perguntas obrigatórias/cadastrais)
- [x] Caixinha 2: "Siga Por Aqui" (45 perguntas desejáveis)
- [x] Caixinha 3: "Lembranças Profundas" (45 perguntas amplas/reflexivas)
- [x] Caixinha 4: "Detalhes que Contam" (45 perguntas específicas)
- [x] Implementar botão "Sortear Pergunta Aleatória"
- [x] Implementar botão "Registrar Memória Livre" (já existe na página de registro)
- [x] Adicionar player de áudio na timeline (preservar voz como legado)
- [x] Sistema de acesso compartilhado (2+ usuários por kit)
- [ ] Geração de QR Code para livro final (acesso a áudios/fotos) - BAIXA PRIORIDADE
- [x] Atualizar manual com protocolo de gravação
- [x] Seção "Receitas" no livro (categoria criada)
- [x] OCR para fotos de caderno escrito à mão


## Melhorias de UX e Gestão (Novas)
- [x] Interface de gerenciamento de kits (convidar colaboradores, visualizar membros, gerenciar permissões)
- [x] Indicador de progresso por caixinha (badges coloridos mostrando X/Y perguntas respondidas)
- [x] Botão "Processar com OCR" na seção de fotos (preenche automaticamente campo de texto)


## 🔴 BUGS CRÍTICOS (Rodada 1)
- [x] Erro 404 ao clicar em "Ver" memória na timeline
- [x] Categorias duplicadas no dropdown de registro
- [x] Menu "Minhas Memórias" fica carregando infinitamente (removido - duplicado)
- [x] Vincular perguntas sorteadas/selecionadas às respostas criadas

## 🟡 FUNCIONALIDADES ALTA PRIORIDADE (Rodada 2)
- [x] Botão "X" para excluir arquivo após upload (áudio, documento, foto)
- [x] Botão "Excluir Memória" na visualização de memórias
- [ ] Página de Perfil completa (nome, endereço, CPF, identidade, nascimento, senha)
- [ ] Botão de Logout no menu
- [ ] Sortear apenas perguntas NÃO respondidas
- [ ] Indicador visual de perguntas já respondidas nas caixinhas

## 🟢 MELHORIAS UX E TEXTOS (Rodada 3)
- [ ] Homepage: Tagline em minúsculas
- [ ] Homepage: Aumentar fonte "Em parceria com Cassará Editora"
- [ ] Homepage: Adicionar artigo "O que é A Tecelaria"
- [ ] Homepage: Reescrever descrição principal (remover "IA", adicionar "facilita", mencionar caixinhas)
- [ ] Homepage: Reescrever texto transformação em livro
- [ ] Homepage: Card Liberdade Total - adicionar texto sobre assistência
- [ ] Homepage: Cronograma - mudar título para "Período de Captura e Registro"
- [ ] Homepage: Cronograma - remover "a cada 15 dias receba perguntas"
- [ ] Homepage: Como Funciona - dividir Passo 1 em físico e digital
- [ ] Homepage: Como Funciona - Passo 3 mencionar caixinhas
- [ ] Homepage: Como Funciona - Passo 4 remover "gera perguntas"
- [ ] Homepage: Como Funciona - Passo 5 mudar para "a partir do 80º dia"
- [ ] Homepage: Como Funciona - Adicionar Passos 7 e 8 (revisão IA + aprovação final)
- [ ] Homepage: Revisão Editorial → Revisão Especializada
- [ ] Homepage: Kit Digital - ajustar itens inclusos
- [ ] Homepage: Kit Físico - trocar "caderno" por "150 caixinhas"
- [ ] Homepage: FAQ - ajustar resposta "Posso editar" (a partir do dia 80)
- [ ] Homepage: FAQ - remover pergunta "Memórias seguras"
- [ ] Dashboard: Card "Período de Envio" - texto "registrar" ao invés de "gravar"
- [ ] Dashboard: Card "Prazo Livro" - ajustar lógica (inicia no dia 80)
- [ ] Dashboard: Remover card duplicado "Tempo Restante"
- [ ] Dashboard: Fotos formato "X/20" com barra
- [ ] Dashboard: Remover card "Imagens" duplicado
- [ ] Dashboard: Adicionar botão "Registrar Memória" destacado
- [ ] Registrar Memória: Reordenar (1.Protocolo 2.Categoria 3.Tipo)
- [x] Sortear Pergunta: Remover botões individuais, adicionar único "Registrar Resposta"
- [x] Após Login: Adicionar 2 botões "Registrar Memória" e "Ir para Dashboard"


## 🔧 Implementação em Andamento
- [x] Página de Perfil completa (nome, endereço, CPF, identidade, nascimento, senha)
- [x] Botão de Logout funcional no menu
- [x] Máscaras de input para CPF, CEP e telefone
- [x] Upload de foto de perfil do usuário

## 🔧 Validações e Integrações
- [x] Validação real de CPF (verificar dígitos verificadores)
- [x] Integração com API ViaCEP (preencher endereço automaticamente ao digitar CEP)

## 🎨 Ajustes de UX e Textos (Prioridade Média - 21 itens)

### Homepage
- [x] Ajustar seção "Como Funciona" com 8 passos detalhados
- [x] Mudar "Revisão Editorial" para "Revisão Especializada" (implementado no passo 7)
- [x] Atualizar texto da revisão (parceria Cassará + IA + toque humano)
- [x] Kit Digital: remover "Revisão editorial profissional", adicionar "Análise Cassará" e "Impressão física disponível"
- [x] Kit Físico: remover "Caderno impresso" e "Caixa premium", adicionar "150 caixinhas de perguntas"
- [x] Ajustar valor impressão física para "a partir de R$ 80"
- [x] FAQ: atualizar resposta "Posso editar?" (a partir do dia 80)
- [x] FAQ: remover pergunta "Minhas memórias estão seguras?"

### Dashboard
- [x] Card "Período de Envio": já implementado com countdown
- [x] Card "Prazo Finalizar Livro": mostrar "Prazo ainda não iniciado" antes do dia 80
- [x] Remover card "Tempo Restante" duplicado (não existe duplicado)
- [x] Manter cards "Histórias Gravadas" e "Fotos Adicionadas" (formato X/Y)
- [x] Remover card "Imagens" (duplicado de fotos) (não existe duplicado)
- [x] Adicionar botão destacado "Registrar Memória" no topo

### Página Registrar Memória
- [ ] Reordenar elementos: 1) Protocolo, 2) Categoria, 3) Tipo de registro, 4) Campos
- [ ] Categorias já corrigidas ✅ (bug de duplicatas resolvido)
- [ ] Botão X para excluir já implementado ✅
- [ ] Categoria obrigatória já está ✅

### Outras Melhorias
- [ ] Ajustar lógica de contagem de dias (dia 1 = data de criação do kit)
- [ ] Adicionar indicador visual de progresso geral no dashboard
- [ ] Melhorar feedback visual ao salvar memória


## 🔴 Itens Críticos dos Áudios (Prioridade Máxima)
- [x] Reordenar elementos da página Registrar Memória: 1) Protocolo, 2) Categoria, 3) Tipo de registro (abas), 4) Campos
- [x] Ajustar seção "O que é Tecelaria" na homepage com novo texto
- [x] Adicionar 8 passos completos em "Como Funciona" (incluindo passos 7 e 8 de revisão)
- [ ] Criar modal de boas-vindas pós-login com botões "Ir para Dashboard" e "Registrar Primeira Memória"

## 🔧 Nova Solicitação - Simplificação UX
- [x] Sortear Pergunta: Substituir múltiplos botões por único botão "Registrar Resposta"


## 📝 Ajustes de Texto da Homepage (Lote Final)
- [x] Tagline em minúsculas: "memórias tecidas com tecnologia e afeto"
- [x] Aumentar fonte "Em parceria com Cassará Editora"
- [x] Cronograma: título "Período de Captura e Registro das Memórias"
- [x] Cronograma: remover "perguntas personalizadas a cada 15 dias"
- [x] Seção "Revisão Editorial" → "Revisão Especializada"
- [x] Kit Digital: trocar "Revisão editorial" por "Análise Cassará" (já estava correto)
- [x] Kit Físico: trocar "Caderno" por "150 caixinhas de perguntas" (já estava correto)
- [x] FAQ: pergunta "Posso editar" - adicionar timing "a partir do dia 80" (já estava correto)
- [x] FAQ: remover pergunta "Minhas memórias estão seguras?" (já não existia)


## 🎯 Sistema de Vinculação Pergunta → Resposta (PRIORIDADE MÁXIMA)
- [x] Classificar todas as 150 perguntas por categoria no banco de dados
- [x] Adicionar campo questionId na tabela memories para vincular memória à pergunta
- [x] Implementar lógica: ao clicar "Responder" pergunta, redirecionar com categoria pré-selecionada
- [x] Marcar pergunta como "respondida" ao salvar memória vinculada
- [x] Excluir perguntas respondidas do pool de sorteio aleatório
- [ ] Mostrar indicador "Pergunta X da Caixinha Y" ao visualizar memória
- [x] Implementar reativação: ao excluir memória, pergunta volta a "não respondida"
- [x] Testar fluxo completo: responder → visualizar → excluir → re-responder


## 🎯 Melhorias no Fluxo de Caixinhas (Feedback Detalhado)
- [x] Exibir pergunta selecionada na página de Registrar Memória (campo read-only no topo)
- [x] Destacar tabs "Áudio/Texto/Documento/Foto" com cor diferente (verde ou laranja)
- [x] Ajustar label: "Upload de arquivo" → "Upload de áudio" (na tab Áudio)
- [x] Garantir que pergunta respondida seja marcada como respondida após salvar (já implementado)
- [x] Sortear apenas perguntas não respondidas da caixinha selecionada (já implementado)
- [ ] Permitir editar resposta de pergunta já respondida


## ✅ BUGS CRÍTICOS CORRIGIDOS - Sistema de Caixinhas
- [x] Link "Responder Agora" passa questionId e categoryId corretamente
- [x] Categoria vem pré-selecionada automaticamente via useEffect
- [x] Pergunta fica marcada como respondida (queries invalidadas)
- [x] Contador "X/15" atualiza automaticamente
- [x] Sorteio respeita caixinha selecionada (usando and() do Drizzle)
- [x] Card da pergunta aparece na página de registro (função getQuestionById criada)
- [x] Criada página dedicada RegisterMemoryFromQuestion para responder perguntas das caixinhas


## 🎨 Melhorias na Visualização de Memórias
- [x] Lista de memórias: adicionar ícone indicando tipo (🎤 áudio, 📝 texto, 📄 documento, 📷 foto)
- [x] Detalhes da memória: adicionar seção "Memória Original" para acessar conteúdo original
- [x] Player de áudio para memórias de áudio
- [x] Visualizador de texto para memórias de texto
- [x] Link de download para documentos
- [x] Galeria de imagens para fotos


## ✅ BUGS CORRIGIDOS - Sistema RegisterMemoryFromQuestion
- [x] Erro "Cannot update component while rendering" - redirect movido para useEffect
- [x] Botão "Responder Agora" redirecionava para dashboard - corrigido extração de questionId usando window.location.search
- [x] Card da pergunta não aparecia - agora mostra pergunta completa com caixinha, número e categoria
- [x] Fluxo completo funcionando: clicar em pergunta → abrir página de registro → ver detalhes → registrar resposta


## ✅ Visualização e Edição de Respostas nas Caixinhas (CONCLUÍDO)
- [x] Tornar botão "Já Respondida" clicável nas perguntas respondidas - substituído por "Ver Resposta" com ícone de olho
- [x] Criar procedure tRPC getMemoryByQuestionId para buscar memória vinculada
- [x] Criar função getMemoryByQuestionId em db.ts
- [x] Criar componente MemoryDetailDialog para exibir detalhes da memória
- [x] Exibir título, resumo, data, conteúdo (transcrição/texto)
- [x] Exibir player de áudio se houver arquivo de áudio
- [x] Exibir galeria de fotos se houver imagens
- [x] Exibir links de documentos se houver
- [x] Adicionar botão "Editar" que redireciona para página de edição (/memoria/:id)
- [x] Adicionar botão "Excluir" com confirmação que deleta a memória
- [x] Dialog de confirmação com mensagem clara sobre exclusão permanente
- [x] Atualizar lista de perguntas após exclusão (pergunta volta a "não respondida") via refetch


## ✅ Correção: Análise de IA com Contexto da Pergunta (CONCLUÍDO)
- [x] Identificar onde a IA faz análise das memórias - encontrado em aiProcessor.ts (analyzeMemoryContent)
- [x] Modificar prompt da IA para incluir pergunta quando memória tiver questionId - adicionado parâmetro options com questionText
- [x] Garantir que análise de memórias gerais continue usando apenas resposta + categoria - funciona sem passar questionText
- [x] Garantir que análise de memórias de caixinhas use resposta + categoria + PERGUNTA - processMemory busca pergunta e passa para análise
- [x] Testar com exemplo real: pergunta "Onde você nasceu?" + resposta "São Paulo" - IA entendeu contexto de nascimento/origem
- [x] Código implementado: getQuestionById e getCategoryById sendo chamados corretamente em routers.ts


## ✅ Edição de Memória e Correções de Acessibilidade (CONCLUÍDO)
- [x] Corrigir avisos de acessibilidade adicionando DialogTitle aos dialogs - corrigido no estado de loading do MemoryDetailDialog
- [x] Implementar página de edição de memória (/editar-memoria/:id) - EditMemory.tsx criado
- [x] Permitir editar título da memória - campo de input funcionando
- [x] Permitir editar resumo da memória - textarea com conteúdo completo
- [x] Permitir editar temas (adicionar/remover) - sistema de badges com X para remover + campo para adicionar
- [x] Permitir editar pessoas mencionadas (adicionar/remover) - sistema de badges funcionando perfeitamente
- [x] Permitir editar período mencionado - campo de input com placeholder
- [x] Exibir memória original como referência (somente leitura) - coluna direita mostra categoria e data
- [x] Criar procedure tRPC memories.update para salvar alterações - implementado com validação
- [x] Atualizar procedure getById para incluir records da memória
- [x] Atualizar botão Editar no MemoryDetailDialog para redirecionar para /editar-memoria/:id
- [x] Registrar rota /editar-memoria/:id no App.tsx
- [x] Testar fluxo completo: título alterado de "Nascimento e Origem em São Paulo" para "Meu Nascimento em São Paulo - SP" + pessoa "Maria Eduarda" adicionada com sucesso


## ✅ Implementação de Identidade Visual (CONCLUÍDO)
- [x] Copiar logo para client/public/images/ - tecelaria_logo_simple_1.png copiado como logo.png
- [x] Implementar logo na hero section da homepage - substituído título texto por imagem
- [x] Criar favicon com ícone de livro coral - favicon.svg criado com SVG customizado
- [x] Adicionar divisores corais entre seções - classe .coral-divider implementada
- [x] Adicionar ícone de livro coral nos cards - classe .book-icon-coral no card "Livro Real"
- [x] Implementar animação fade-in para logo - @keyframes fadeIn criado
- [x] Adicionar fonte monoespaçada JetBrains Mono ao index.html - disponível para uso futuro
- [x] Adicionar favicon ao index.html - link rel="icon" configurado
- [x] Testar responsividade da logo - h-24 em mobile, h-32 em desktop
- [x] Divisor coral entre Hero e "O que é Tecelaria"
- [x] Divisor coral entre "O que é Tecelaria" e "Cronograma"


## ✅ Ajustes de Logo e Branding Adicional (CONCLUÍDO)
- [x] Remover fundo branco da logo (tornar transparente) - ImageMagick com -fuzz 10% -transparent white
- [x] Aumentar tamanho da logo na hero section - h-32 mobile, h-48 tablet, h-56 desktop (era h-24/h-32)
- [x] Revisar documento de referência para implementar sugestões adicionais - revisado
- [x] Usar pontinho/quadradinho como bullets em listas - classe .custom-bullet-list criada com ::before
- [x] Logo transparente salva como logo-transparent.png
- [x] Home.tsx atualizado para usar nova logo
- [x] Estilo de bullet customizado com quadradinho coral de 8x8px


## 🎨 Refinamentos Finais de Branding (NOVA SOLICITAÇÃO)
- [ ] Aplicar bullets customizados nas listas de planos (Kit Digital e Kit Físico)
- [ ] Adicionar logo compacta (h-8 ou h-10) no header das páginas internas
- [ ] Implementar animação da linha coral "desenhando" até o livro
- [ ] Testar animação em diferentes navegadores
- [ ] Verificar responsividade da logo no header interno


## ✅ Refinamentos Finais de Branding (CONCLUÍDO)
- [x] Aplicar bullets customizados nas listas de planos (Kit Digital e Kit Físico) - classe custom-bullet-list aplicada
- [x] Adicionar logo compacta no header do DashboardLayout - logo transparente h-8 no SidebarHeader
- [x] Implementar animação da linha coral "desenhando" - @keyframes drawLine com animation-delay 0.5s
- [x] Testar bullets customizados na seção de planos - quadradinhos corais aparecendo em ambos os cards
- [x] Testar logo no sidebar do dashboard - logo "Tecelaria" visível no topo do sidebar
- [x] Corrigir erro de CSS no coral-divider - adicionado content, position e background


## ✅ Logo Clicável no Header do Dashboard (CONCLUÍDO)
- [x] Substituir texto "Tecelaria" por logo (imagem) no header do dashboard - removido texto "Navigation"
- [x] Manter funcionalidade de link clicável para home - <a href="/"> implementado
- [x] Ajustar tamanho da logo para caber no header (h-8 ou h-10) - h-8 aplicado
- [x] Adicionar efeito hover - hover:opacity-80 transition-opacity
- [x] Testar clique redirecionando para home - funcionando perfeitamente


## ✅ Substituir TODOS os Textos "Tecelaria" pela Logo (CONCLUÍDO)
- [x] Identificar todos os lugares onde aparece o texto "Tecelaria" no site - grep encontrou 6 arquivos
- [x] Substituir texto "Tecelaria" no header do dashboard pela logo - Dashboard.tsx atualizado
- [x] Substituir texto "Tecelaria" no footer da homepage pela logo - Home.tsx atualizado
- [x] Substituir em todas as páginas internas - MemoriesTimeline.tsx, SortearPergunta.tsx, Caixinhas.tsx, ManageKit.tsx
- [x] Manter funcionalidade clicável onde o texto era clicável - todos os links funcionando
- [x] Ajustar tamanhos da logo para cada contexto - h-8 no header, h-6 no footer
- [x] Testar todos os links clicáveis - clique na logo redireciona para home em todas as páginas
- [x] Analisar quadradinho da logo - identificado como quadrado com L cortado no canto inferior esquerdo
- [x] Replicar EXATAMENTE o quadradinho da logo nos bullets - CSS atualizado com clip-path polygon
- [x] Garantir consistência visual entre logo e elementos decorativos - bullets replicam quadradinho da logo
- [x] Testar bullets customizados - quadradinhos corais com cantinho cortado aparecem nas listas de planos


## ✅ Ajustes de Tamanho da Logo e Timeline (CONCLUÍDO)
- [x] Aumentar tamanho da logo no footer da homepage - h-6 → h-12 (dobrou de tamanho)
- [x] Aumentar tamanho da logo no header do dashboard - h-8 → h-12 (50% maior)
- [x] Substituir bolinhas por quadradinhos/cantoneiras na timeline de "Minhas Memórias" - rounded-full removido
- [x] Garantir que quadradinhos da timeline sejam idênticos aos da logo - mesmo clip-path polygon usado
- [x] Testar logo maior no footer - funcionando perfeitamente
- [x] Testar logo maior no dashboard - funcionando perfeitamente
- [x] Testar quadradinhos na timeline - marcadores corais com L cortado aparecendo corretamente


## ✅ Ajustes Finais de Logo e Timeline - Rodada 2 (CONCLUÍDO)
- [x] Aumentar AINDA MAIS logo no footer da homepage - h-12 → h-20 (67% maior)
- [x] Aumentar AINDA MAIS logo no header do dashboard - h-12 → h-20 (67% maior)
- [x] Extrair quadradinho/mini-cantoneira da logo como imagem PNG separada - quadradinho.png criado
- [x] Usar imagem real do quadradinho na timeline - <img> substituiu CSS clip-path
- [x] Testar logos maiores no footer - funcionando perfeitamente, muito mais visível
- [x] Testar logos maiores no dashboard - funcionando perfeitamente, muito mais visível
- [x] Testar quadradinho real na timeline - marcadores corais idênticos à logo aparecendo corretamente


## ✅ Ajuste de Tamanho da Logo no Dashboard - Rodada 3 (CONCLUÍDO)
- [x] Verificar tamanho dos botões de navegação - size="sm" = h-9
- [x] Aumentar logo do dashboard para mesmo tamanho dos botões - h-8 → h-10
- [x] Testar visualmente no navegador - logo agora do mesmo tamanho dos botões, muito mais visível


## ✅ BUG CORRIGIDO: Página de Perfil (RESOLVIDO)
- [x] Identificar erro - react-input-mask incompatível com React 19 (findDOMNode removido)
- [x] Verificar console de erros - TypeError: reactDom.findDOMNode is not a function
- [x] Instalar @react-input/mask compatível com React 19
- [x] Substituir InputMask por useMask hook em todos os campos (telefone, CPF, CEP)
- [x] Testar página de perfil - funcionando perfeitamente com máscaras aplicadas


## ✅ Preparação para Deploy no Vercel (CONCLUÍDO)
- [x] Analisar estrutura atual do projeto - fullstack Express + React + tRPC
- [x] Criar vercel.json com configurações para fullstack app
- [x] Ajustar scripts - adicionado vercel-build ao package.json
- [x] Criar .vercelignore para otimizar deploy
- [x] Criar documentação completa DEPLOY_VERCEL.md com:
  - Pré-requisitos (banco externo, substituição de APIs do Manus)
  - Passo a passo de configuração
  - Variáveis de ambiente necessárias
  - Troubleshooting comum
  - Comparação Vercel vs Manus Hosting

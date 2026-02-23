
# Convite de Casamento - Felipe & Rayssa

Este é o sistema completo do casamento de Felipe Augusto e Rayssa Caldeira, incluindo convite interativo, confirmação de presença (RSVP), lista de presentes e o Manual dos Padrinhos.

## 🚀 Como Vincular ao GitHub e Publicar

Para colocar este projeto no seu GitHub e ativar o deploy automático (cada vez que você salvar, o site atualiza sozinho), siga estes passos:

### 1. Vincular ao GitHub (Terminal)
Abra o terminal na pasta deste projeto e execute os seguintes comandos:
```bash
# Iniciar o repositório git
git init

# Adicionar todos os arquivos (o .gitignore protegerá sua senha)
git add .

# Criar a primeira versão
git commit -m "Projeto Finalizado: Convite, Manual e Painel"

# Criar a branch principal
git branch -M main

# CONECTAR AO SEU GITHUB:
# Crie um repositório vazio no seu GitHub e troque a URL abaixo:
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# Enviar os arquivos
git push -u origin main
```

### 2. Ativar o Firebase App Hosting
1. No [Firebase Console](https://console.firebase.google.com/), entre no seu projeto.
2. Vá em **App Hosting** no menu lateral.
3. Clique em **Começar** e conecte sua conta do GitHub.
4. Selecione o repositório que você acabou de criar.
5. O Firebase detectará as configurações automaticamente e gerará um link público para o seu convite.

## 🛠️ Acesso Administrativo
- **Página de Login**: `/login`
- **Usuário**: `admin`
- **Senha**: `admin`
*(O sistema está configurado para aceitar essas credenciais e entrar com segurança).*

## ✨ Funcionalidades
- **Convite Interativo**: Com música e animações fluidas.
- **Manual dos Padrinhos**: Área exclusiva com paleta de cores e inspirações.
- **Painel Administrativo**: Gestão de convidados, presentes e configurações.
- **Exportação**: Lista de convidados disponível em PDF e CSV.
- **Inteligência Artificial**: Gerador de mensagens para agradecimentos aos convidados.

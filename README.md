# Simulador de Atendimento e Orçamento via WhatsApp

> Aplicação web interativa desenvolvida com **HTML5**, **CSS3** e **TypeScript**, projetada para agilizar o primeiro atendimento comercial de negócios locais, prestadores de serviço e profissionais autônomos.

## Sobre o Projeto

Muitos negócios perdem vendas ou gastam horas repetindo informações básicas no atendimento manual pelo WhatsApp. Este projeto apresenta um fluxo simples e direto: o cliente seleciona os serviços desejados, visualiza o cálculo automático com regra de desconto progressivo e envia o resumo estruturado diretamente para o WhatsApp.

O código foi pensado como um projeto demonstrativo de portfólio, priorizando **clareza arquitetural**, **tipagem estática**, **acessibilidade** e **facilidade de adaptação** para diferentes clientes ou nichos.

## Funcionalidades

- **Cálculo dinâmico em tempo real:** soma os serviços selecionados conforme o usuário marca ou desmarca as opções.
- **Desconto progressivo automático:** aplica 10% de desconto ao selecionar 2 ou mais serviços e exibe o valor economizado na tela.
- **Validação amigável de formulário:** verifica seleção mínima de serviço e preenchimento do nome/negócio antes do envio, com mensagens acessíveis sem uso de `alert()`.
- **Integração com WhatsApp (`wa.me`):** monta uma mensagem organizada com itens, valores, melhor horário de contato e total estimado, codificada com `encodeURIComponent`.
- **Layout responsivo (Mobile-First):** estruturado com CSS Grid, Flexbox e variáveis de tema (`:root`) para facilitar ajustes visuais.

## Tecnologias Utilizadas

- **HTML5:** marcação semântica (`<header>`, `<main>`, `<section>`, `<footer>`), atributos `data-*` e acessibilidade (`aria-live`, `role="alert"`).
- **CSS3:** *custom properties* (variáveis CSS), layout responsivo e estados de foco para navegação por teclado.
- **TypeScript:** interfaces (`ServicoSelecionado`, `ResumoOrcamento`), tipagem estrita de elementos DOM, separação entre cálculo e interface e documentação em formato JSDoc.

## Estrutura de Arquivos

```text
simulador-atendimento-whatsapp/
├── index.html      # Estrutura da página e dados dos serviços
├── style.css       # Estilos, variáveis de cor e responsividade
├── script.ts       # Código-fonte tipado em TypeScript
├── script.js       # Código JavaScript compilado para execução no navegador
├── tsconfig.json   # Configurações de compilação do TypeScript
└── README.md       # Documentação do projeto
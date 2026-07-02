A Ideia do Projeto
O objetivo central é criar uma plataforma de gerenciamento de sessões de RPG onde o foco é a gestão de dados essenciais (usuários, mesas e personagens) sem sobrecarregar o backend com mecânicas de jogo complexas. O sistema serve como o "núcleo de registro", onde os jogadores se autenticam, criam personagens e se vinculam a mesas específicas.

Modelagem do Banco de Dados
Para este sistema, utilizaremos uma arquitetura relacional (SQLite) baseada em quatro tabelas principais.

1. Tabela users (Usuários)
Esta é a base do sistema. Armazena as credenciais de acesso.

Campos: id (PK), username, password (hash).

Propósito: Autenticação e identificação do dono de uma conta.

2. Tabela tables (Mesas)
Representa o grupo de jogo ou a sessão.

Campos: id (PK), name, game_master_id (FK para users).

Propósito: Organizar onde os personagens estão inseridos. Um mestre cria uma mesa e convida os jogadores.

3. Tabela characters (Personagens)
A entidade principal para o jogador.

Campos: id (PK), name, class, level, user_id (FK para users), table_id (FK para tables).

Propósito: Armazenar os dados estáticos e de progressão do herói.

4. Tabela inventory (Inventário)
Diferente de sistemas complexos, aqui o inventário é estático e simples.

Campos: id (PK), character_id (FK para characters), item_name, description.

Propósito: Apenas listar os itens que o personagem possui.

Nota de Escopo: Conforme solicitado, não existe lógica de "equipar" ou "usar". O inventário é apenas um repositório de texto/dados para consulta rápida, sem gatilhos de alteração de atributos ou estados de item.

Interação entre as Tabelas
O relacionamento entre os dados é definido por chaves estrangeiras que garantem a integridade da sessão:

Vínculo Usuário-Personagem: Um User pode possuir múltiplos Characters. Isso permite que o jogador gerencie vários heróis em diferentes campanhas.

Vínculo Usuário-Mesa: O User que cria a Table assume a função de Mestre (game_master_id).

Vínculo Mesa-Personagem: O Character é obrigatoriamente vinculado a uma Table. Isso mantém o isolamento das sessões (personagens da "Mesa A" não aparecem na "Mesa B").

Vínculo Personagem-Inventário: Cada Character possui uma lista de entradas na tabela inventory. Como não há funcionalidade de "equipar", o backend apenas retorna a lista completa de itens associada ao character_id quando solicitado.

Filosofia de Design: Menos é Mais
Remover a funcionalidade de "equipar e usar" itens reduz drasticamente a necessidade de:

Estados Complexos: Não precisamos de flags como is_equipped ou durability.

Lógica de Middleware: O backend não precisa validar se o personagem tem requisitos para usar um item.

Performance: As queries são simplificadas, focadas apenas em Leitura (SELECT) e Escrita (INSERT/DELETE) direta, tornando o sistema extremamente rápido e fácil de manter.
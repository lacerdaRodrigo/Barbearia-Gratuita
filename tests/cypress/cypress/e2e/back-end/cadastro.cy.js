
describe('POST /cadastrar usuarios', () => {

  const usuario = {
    nome: "Rodrigo Teste",
    email: "teste@teste.com",
    telefone: "31984288495",
    senha: "123456"
  }

  it('registrar novo usuario', () => {

    cy.cadastrar_usuario(usuario)
      .then(response => {
        expect(response.status).to.eq(201);
        expect(response.body.mensagem).to.eq(`Usuário com o email: ${usuario.email} cadastrado com sucesso!`)
      })
  })

  context('sem campo: nome , email , telefone e senha  ', () => {

    let usuario

    beforeEach(() => {
      usuario = {
        nome: 'Rodrigo Teste04',
        email: 'teste@teste.com.br',
        telefone: '31984288495',
        senha: '123456'
      }
    })

    it('registrar usuario com email ja cadastrado', () => {

      const usuario = {
        nome: "Marcos Teste",
        email: "teste@teste.com",
        telefone: "1234567890",
        senha: "123456"
      }

      cy.cadastrar_usuario(usuario)
        .then(response => {
          expect(response.status).to.eq(409);
          expect(response.body.mensagem).to.eq('Email já cadastrado.')
        })
    })

    it('registrar usuario com email invalido', () => {

      const usuario = {
        nome: "Rodrigo Teste",
        email: "teste.com",
        telefone: "31984288495",
        senha: "123456"
      }

      cy.cadastrar_usuario(usuario)
        .then(response => {
          expect(response.status).to.eq(400)
          expect(response.body.mensagem).to.eq('E-mail inválido ou campo vazio.')
        })
    })


    it('registrar usuario sem o campo nome', () => {

      delete usuario.nome

      cy.cadastrar_usuario(usuario)
        .then(response => {
          expect(response.status).to.eq(400)
          expect(response.body.mensagem).to.eq('Nome de usuário é obrigatório.')
        })
    })

    it('registrar usuario sem o campo email', () => {
      delete usuario.email

      cy.cadastrar_usuario(usuario)
        .then(response => {
          expect(response.status).to.eq(400)
          expect(response.body.mensagem).to.eq('E-mail inválido ou campo vazio.')
        })
    })

    it('registrar usuario sem o campo telefone', () => {
      delete usuario.telefone

      cy.cadastrar_usuario(usuario)
        .then(response => {
          expect(response.status).to.eq(400)
          expect(response.body.mensagem).to.eq('Telefone é obrigatório.')
        })
    })

    it('registrar usuario sem o campo senha', () => {
      delete usuario.senha

      cy.cadastrar_usuario(usuario)
        .then(response => {
          expect(response.status).to.eq(400)
          expect(response.body.mensagem).to.eq('Senha é obrigatória.')
        })
    })

    it('registrar usuario sem o campo email e telefone', () => {
      delete usuario.email
      delete usuario.telefone

      cy.cadastrar_usuario(usuario)
        .then(response => {
          expect(response.status).to.eq(400)
          expect(response.body.mensagem).to.eq('Email e telefone são obrigatórios para dar sequência')
        })

    })
  })

})

describe('GET /listar usuarios', () => {

  it('listar usuarios cadastrados', () => {

    const usuario = {
      nome: "Rodrigo Teste",
      email: "teste@teste.com",
      telefone: "31984288495",
    }

    cy.lista_usuarios(usuario)
      .then(response => {
        expect(response.status).to.eq(200);

        //Verifica a propriedade 'nome' desse elemento
        expect(response.body).to.be.an('array').and.not.be.empty;
        const primeiroUsuarioNaLista = response.body[0];
        expect(primeiroUsuarioNaLista.nome).to.eq(usuario.nome);
        expect(primeiroUsuarioNaLista.email).to.eq(usuario.email);
        expect(primeiroUsuarioNaLista.telefone).to.eq(usuario.telefone);
      })

  })
});


describe('DELETE /deletar todos usuarios', () => {

  it('deletar todos usuarios cadastrados', () => {
    cy.deletar_usuarios()
      .then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.mensagem).to.eq('Todos os usuários deletados com sucesso')
      })
  })
})


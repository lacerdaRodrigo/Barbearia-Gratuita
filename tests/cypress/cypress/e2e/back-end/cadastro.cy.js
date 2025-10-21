
describe('POST /cadastrar usuarios', () => {

  it('registrar novo usuario', () => {

    const usuario = {
      nome: "Rodrigo Teste",
      email: "teste@teste.com",
      telefone: "31984288495",
      senha: "123456"
    }

    cy.deletar_usuarios();

    cy.cadastrar_usuario(usuario)
      .then(response => {
        expect(response.status).to.eq(201);
        expect(response.body.mensagem).to.eq(`Usuário com o email: ${usuario.email} cadastrado com sucesso!`)
      })
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
          expect(response.body.mensagem).to.eq('Email e senha são obrigatórios para dar sequência')
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


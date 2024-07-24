const transportador = require("../conexoes/nodemailer")
const knex = require("../conexoes/pg")
const compiladorHtml = require("../utils/compiladorHtml")

const cadastrarEmail = async (req, res) => {
    const { nome, email } = req.body

    if (!nome || !email) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' })
    }

    try {
        await knex('emails').insert({ nome, email })
        return res.status(201).json({ mensagem: 'Cadastro efetuado com sucesso!' })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

const enviarNewsletter = async (req, res) => {
    const { texto } = req.body

    try {
        const emails = await knex('emails')

        for (const email of emails) {

            const html = await compiladorHtml('./src/templates/newsletter.html', {
                usuario: email.nome,
                texto: texto,
            })

            transportador.sendMail({
                from: `<${process.env.MAIL_FROM}>`,
                to: `${email.nome} <${email.email}>`,
                subject: 'Newsletter Cubos Academy',
                html: html,
            })
        }

        res.status(204).send()
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

module.exports = { cadastrarEmail, enviarNewsletter }
import nodemailer from 'nodemailer';
import { env } from 'process';
import { v4 as uuidv4 } from 'uuid';
import { IServiceOptions } from './IServiceOptions';
import clienteRepository from '../database/repositories/userRepository';
import Error404 from '../errors/Error404';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { getConfig } from '../config';
import jwt from 'jsonwebtoken';
import EmpresaRepository from '../database/repositories/empresaRepository';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';

export default class SmtpService {

    options: IServiceOptions;

    constructor(options) {
        this.options = options;
    }

    async convidar (email, link) {
        let transporter = await this.createTransporter()
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: env.NODEMAILER_FROM, 
          to: email, 
          subject: env.NODEMAILER_INVITATION, 
          text: '', 
          html:
            'Olá, você foi convidado para o sistema Constal como nutricionista. <p>Clique no link abaixo para acessar o sistema.</p><p><a href=' +
            link +
            '>Acessar sistema</a></p><p>Se você não reconhece esse convite, ignore este email.</p><p>Obrigado,</p><p>Souleve</p>', // html body
        })
    
        transporter.close()
    
        return info
      }

    async enviarVerificacaoBackOffice(email) {

        let cliente = await this.options.database.user.findOne({
            where: { email }
          });

        if (cliente == null) {
            throw new Error404;
        }

        let baseUrl = env.NODEMAILER_BASE_URL || '';
        let verificarUrl = env.NODEMAILER_VERIFY_URL
        let id = cliente[0].id;
        let token = await this.gerarToken(id);

        let link = baseUrl + verificarUrl + '/' + id + '/' + token ;

        await clienteRepository.sendVerificationUpdateToken(cliente[0].id, token, this.options);

        // create reusable transporter object using the default SMTP transport
        let transporter = await this.createTransporter();

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: env.NODEMAILER_FROM, // sender address
            to: email, // list of receivers
            subject: env.NODEMAILER_VERIFY_SUBJECT, // Subject line
            text: "", // plain text body
            html: "Verifique sua conta para o app Souleve <p>Olá,</p><p>Clique no link abaixo para verificar o seu email.</p><p><a href=" + link + ">Verificar email</a></p><p>Sua senha de login é '123456' sem as aspas e deve ser mudada em 'Perfil' no aplicativo por motivos de segurança</p><p>Se você não solicitou essa verificação, ignore este email.</p><p>Obrigado,</p><p>Souleve</p>" // html body
        });

        transporter.close();

        return info;
    }

    // async..await is not allowed in global scope, must use a wrapper
    async enviarVerificacao(email) {
        const transaction = SequelizeRepository.getTransaction(
            this.options,
          );
        let cliente = await this.options.database.user.findOne({
            where: { email },
            transaction
          });

        if (cliente == null) {
            throw new Error404;
        }

        let baseUrl = env.NODEMAILER_BASE_URL || '';
        let verificarUrl = env.NODEMAILER_VERIFY_URL
        let id = cliente.id;
        let token = await this.gerarToken(id);

        let link = baseUrl+'checar-email/' + id /*+ '/' + token*/ ;

        await clienteRepository.sendVerificationUpdateToken(cliente.id, token, this.options);

        // create reusable transporter object using the default SMTP transport
        let transporter = await this.createTransporter();

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: env.NODEMAILER_FROM, // sender address
            to: email, // list of receivers
            subject: env.NODEMAILER_VERIFY_SUBJECT, // Subject line
            text: "", // plain text body
            html: "Verifique sua conta para o app/site Constal </h1> <h2 color: 'red',>Olá,</h2><p>Clique no link abaixo para confirmar seu email.</p><p><a style='text-decoration: none; display: flex; align-items: center; justify-content: center; width: 160px; height: 35px; color: white; background-color: #58A4B0; border-radius: 6px; text-align: center; padding: 15px 0 0 80px' href=" + link + ">Verificar email</a></p><p>Se você não solicitou, ignore este email.</p><p>Obrigado,</p><img src='http://dev.42dias.com.br/Clientes/constal/static/media/logo.dbfcbed5.png' />" // html body
        });

        transporter.close();

        return info;
    }

    async enviarResetarSenha(email) {

        const transaction = SequelizeRepository.getTransaction(
            this.options,
          );
        let cliente = await this.options.database.user.findOne({
            where: { email },
            transaction
          });

        if (cliente == null) {
            throw new Error404;
        }

        let baseUrl = env.NODEMAILER_BASE_URL || '';
        let resetarUrl = env.NODEMAILER_RESET_URL
        let id = cliente.id;
        //let token = cliente.token;
        const token = jwt.sign(
            { id: cliente.id },
            getConfig().AUTH_JWT_SECRET,
            { expiresIn: getConfig().AUTH_JWT_EXPIRES_IN },
          );
        let hash = await clienteRepository.generateRecuperarSenhaToken(cliente.id, token, this.options);

        //let link = `${baseUrl}/${resetarUrl}/${id}/${token}/${hash}`;
        let link = baseUrl+'resetar-senha/'+token;
        // create reusable transporter object using the default SMTP transport
        let transporter = await this.createTransporter();

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: process.env.NODEMAILER_FROM, // sender address
            to: email, // list of receivers
            subject: env.NODEMAILER_RESET_SUBJECT, // Subject line
            text: "", // plain text body
            html: "<h1>Troque sua senha de acesso para a Constal</h1> <h2>Olá,</h2><p>Clique no link abaixo para trocar sua senha.</p><p><a style='text-decoration: none; display: flex; align-items: center; justify-content: center; width: 160px; height: 35px; color: white; background-color: #58A4B0; border-radius: 6px; text-align: center; padding: 0 0 0 80px' href=" + link + ">Trocar Senha</a></p><p>Se você não solicitou a troca de senha, ignore este email.</p><p>Obrigado,</p><img style='width: 180px;' src='http://dev.42dias.com.br/Clientes/constal/static/media/logo.dbfcbed5.png' />"
 
            // html body, // html body
        });

        transporter.close();

        return info;
    }

    async createTransporter() {
        let transporter = nodemailer.createTransport({
            host: env.NODEMAILER_HOST,
            port: env.NODEMAILER_PORT,
            secure: env.NODEMAILER_SECURE, // true for 465, false for other ports
            ignoreTLS: true,
            tls: {
                rejectUnauthorized: true
            },
            auth: {
                user: env.NODEMAILER_AUTH_USER, // generated ethereal user
                pass: env.NODEMAILER_AUTH_PASSWORD, // generated ethereal password
            },
        });
        return transporter;
    }

    async gerarToken(id) {
        /*const token = Md5.hashStr(uuidv4());
        return token;*/
        const token = jwt.sign(
            { id: id },
            getConfig().AUTH_JWT_SECRET,
            { expiresIn: getConfig().AUTH_JWT_EXPIRES_IN },
          );
    }

    async retornoDoProduto(id, product, emailContent) {
        let baseUrl = env.NODEMAILER_BASE_URL || '';


        // create reusable transporter object using the default SMTP transport
        let transporter = await this.createTransporter();

        const transaction = SequelizeRepository.getTransaction(
            this.options,
          );

        let cliente = await this.options.database.user.findOne({
            where: { id },
            transaction
          });
        
          console.log("cliente.email")
          console.log(cliente.email)


    
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: env.NODEMAILER_FROM, // sender address
            to: cliente.email, // list of receivers
            subject: "Devolutiva da aprovação do seu produto, Constal", // Subject line
            text: "", // plain text body
            html: `
            <p>Verifique seu produto ${product.nome}, Constal</p>
            <h2>Ol&aacute;,</h2>
            <p>Seu produto ${product.nome} foi recursado</p>
            <p>Mensagem do admin:</p>
            <p>"${emailContent}"</p>
            <p><a style="text-decoration: none; display: flex; align-items: center; justify-content: center; width: 160px; height: 35px; color: white; background-color: #58a4b0; border-radius: 6px; text-align: center; padding: 15px 0 0 80px;" href="${baseUrl}/produto/${product.id}">Ir para produto</a></p>
            <p>Obrigado,</p>
            <p><img
            style='width: 180px;' 
            src='http://dev.42dias.com.br/Clientes/constal/static/media/logo.dbfcbed5.png' /></p>
            ` // html body
        });
    
        transporter.close();
    
        return info;
    }

    async aprovarEmpresa(email) {
        // create reusable transporter object using the default SMTP transport
        let transporter = await this.createTransporter();

        let baseUrl = env.NODEMAILER_BASE_URL || '';
        let link = baseUrl+'dados-pessoais/';


        const emailViewer = "<h1>Parabéns</h1><h2>Olá,</h2><p>Sua empresa foi aprovada no site constalshop!</p><a style='text-decoration: none; display: flex; align-items: center; justify-content: center; width: 160px; height: 35px; color: white; background-color: #58A4B0; border-radius: 6px; text-align: center; padding: 0 0 0 80px;' href='+ " + link + "' >Entrar</a><p>Obrigado,</p><img style='width: 180px;' src='http://dev.42dias.com.br/Clientes/constal/static/media/logo.dbfcbed5.png' />"

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: process.env.NODEMAILER_FROM, // sender address
            to: email, // email, // list of receivers
            subject: 'Sua empresa foi aprovada!', // Subject line
            text: "", // plain text body
            html: emailViewer
 
            // html body, // html body
        });

        transporter.close();

        return info;
    }
    async retornoDoProdutoImagemPromocional(id, product, emailContent) {
        let baseUrl = env.NODEMAILER_BASE_URL || '';

        // create reusable transporter object using the default SMTP transport
        let transporter = await this.createTransporter();

        const transaction = SequelizeRepository.getTransaction(
            this.options,
          );

        let empresaClinte = await EmpresaRepository.findUserByEmpresaId(id)

        console.log("----empresaClinte----")
        console.log(empresaClinte.email)

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: env.NODEMAILER_FROM, // sender address
            to:   empresaClinte.email, // cliente.email, // list of receivers
            subject: `Devolutiva da imagem promocional do seu produto ${product.nome}, Constal`, // Subject line
            text: "", // plain text body
            html: `
            <p>Verifique seu produto ${product.nome}, Constal</p>
            <h2>Ol&aacute;,</h2>
            <p>Seu produto ${product.nome} foi recursado</p>
            <p>Mensagem do admin:</p>
            <p>"${emailContent}"</p>
            <p>Obrigado,</p>
            <p><img
            style='width: 180px;' 
            src='http://dev.42dias.com.br/Clientes/constal/static/media/logo.dbfcbed5.png' /></p>
            ` // html body
        });
    
        transporter.close();
    
        return info;
    }

    async retornoDenunciaComentario(id, emailContent) {
        let baseUrl = env.NODEMAILER_BASE_URL || '';


        // create reusable transporter object using the default SMTP transport
        let transporter = await this.createTransporter();

        const transaction = SequelizeRepository.getTransaction(
            this.options,
          );

          console.log("-----")
        console.log("id")
        console.log(id)

        let cliente = await EmpresaRepository.findUserByEmpresaId(id)

          console.log("---------")
          console.log("cliente")
          console.log(cliente)
        
          console.log("cliente.email")
          console.log(cliente.email)


    
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: env.NODEMAILER_FROM, // sender address
            to: cliente.email // 'Ryan.r.c.399ac@gmail.com', // cliente.email, // list of receivers
            ,
            subject: "Um comentário foi do seu produto foi retirado da plataforma, Constal", // Subject line
            text: "", // plain text body
            html: `
            <h2>Ol&aacute;,</h2>
            <p>Mensagem do admin:</p>
            <p>"${emailContent}"</p>
            <p><a style="text-decoration: none; display: flex; align-items: center; justify-content: center; width: 160px; height: 35px; color: white; background-color: #58a4b0; border-radius: 6px; text-align: center; padding: 15px 0 0 80px;" href="${baseUrl}/">Ir para a plataforma</a></p>
            <p>Obrigado,</p>
            <p><img
            style='width: 180px;' 
            src='http://dev.42dias.com.br/Clientes/constal/static/media/logo.dbfcbed5.png' /></p>
            ` // html body
        });
    
        transporter.close();
    
        return info;
    }
}


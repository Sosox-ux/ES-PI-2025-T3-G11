import * as nodemailer from 'nodemailer';
import 'dotenv/config';

let transport: nodemailer.Transporter | null = null;

async function getTransport() {
  if (transport) {
    return transport;
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error("ERRO: As credenciais EMAIL_USER e EMAIL_PASS não foram definidas no .env");
    throw new Error("Credenciais de e-mail não configuradas.");
  }

  transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass, 
    },
  });

  return transport;
}

export async function enviarEmailReset(emailDestino: string, codigo: string) {
  try {
    const transport = await getTransport();

  await transport.sendMail({
      from: `"Projeto NotaDez" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: 'Seu Código de Recuperação de Senha',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc;">
          <h2>Recuperação de Senha - NotaDez</h2>
          <p>Olá!</p>
          <p>Você solicitou a recuperação da sua senha. Use o código abaixo:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            ${codigo}
          </p>
          <p>Este código expira em 15 minutos.</p>
        </div>
      `,
    });

    console.log('E-mail de reset enviado de verdade para: %s', emailDestino);


  } catch (error) {
    console.error("Erro ao enviar e-mail real:", error);
    throw new Error("Não foi possível enviar o e-mail de recuperação.");
  }
}
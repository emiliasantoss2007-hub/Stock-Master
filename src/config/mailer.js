const nodemailer = require('nodemailer');

// 1. Configuração do Transportador (Transporter)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Podes usar 'gmail', 'outlook' ou SMTP personalizado
    auth: {
        user: process.env.EMAIL_USER || 'seu-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'sua-senha-de-app' // Utiliza "Senha de App" no Gmail
    }
});

/**
 * Função para enviar o e-mail de recuperação de senha
 * @param {string} toEmail E-mail do destinatário
 * @param {string} userName Nome do utilizador
 * @param {string} resetToken Token para a redefinição
 */
async function sendRecoveryEmail(toEmail, userName, resetToken) {
    // Monta a URL correspondente à rota configurada no Express (/redefinir-senha)
    const resetUrl = `http://localhost:3001/redefinir-senha?token=${resetToken}`;

    const mailOptions = {
        from: '"Stock Master" <no-reply@stockmaster.com>',
        to: toEmail,
        subject: 'Stock Master - Recuperação de Senha',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #007bff;">Olá, ${userName}!</h2>
                <p>Recebemos uma solicitação para redefinir a palavra-passe da tua conta no <strong>Stock Master</strong>.</p>
                <p>Para criar uma nova palavra-passe, clica no botão abaixo:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Redefinir Palavra-passe
                    </a>
                </p>
                <p style="font-size: 0.9em; color: #666;">Se não solicitaste esta alteração, podes ignorar este e-mail.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8em; color: #999; text-align: center;">Stock Master — Sistema de Gestão de Stock</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
}

module.exports = { sendRecoveryEmail };
const jwt = require("jsonwebtoken");
const db = require("../config/db");

class UserMiddleware {
  async auth(req, res, next) {
    try {
      const { authorization } = req.headers;

      // Verifica se o token está no header
      const token = authorization.split(" ")[1];

      if (!token) {
        return res
          .status(401)
          .json({ message: "Token de autorização não fornecido" });
      }

      // Decodifica o token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      // Consulta o usuário no banco de dados com base no ID do token decodificado
      const user = await db.query("SELECT * FROM users WHERE id = $1", [
        decodedToken.id,
      ]);

      // Verifica se o token é válido
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Define o objeto do usuário na requisição para uso nas rotas protegidas
      req.user = user.rows[0];

      // Continua com a execução das rotas protegidas
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Invalid token" });
    }
  }
}

module.exports = { UserMiddleware };

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  let token;

  // Memeriksa apakah request memiliki header 'Authorization' dengan format 'Bearer <token>'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Memisahkan kata 'Bearer' dan mengambil tokennya saja
      token = req.headers.authorization.split(" ")[1];

      const jwtSecret = process.env.JWT_SECRET || "rahasia_jwt_carikos_123";
      const decoded = jwt.verify(token, jwtSecret);

      req.user = decoded;

      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Tidak mendapat otorisasi, token gagal divalidasi" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Tidak mendapat otorisasi, tidak ada token" });
  }
};

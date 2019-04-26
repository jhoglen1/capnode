"use strict";
exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb+srv://jhoglen1:Emerson21!@cluster0-lk6aj.mongodb.net/community-brews?retryWrites=true";

exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || "jeff" ;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

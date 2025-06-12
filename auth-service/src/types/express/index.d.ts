// src/types/express/index.d.ts

// Étend l'interface Response de l'objet Express global
declare namespace Express {
  export interface Response {
    body?: any; // Ajoute notre propriété optionnelle 'body'
  }
} 
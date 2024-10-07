# BackendMyApp
S'il te plait, les READMEs sont impotants, c'est ici que l'on documente niveau developer, un projet. je l'ai rajouter pour toi, si tu as des questions, ecris moi.

## Installation

```sh
npm install
```

## Pour executer ton application

```sh
# development
$ npm run dev

# watch mode
$ npm run dev:watch

# production mode
$ npm run start
```

Ceci est ton projet de démarrage avec [Express.js](http://expressjs.com/).
Teste de bien et bonne chance.

## Les technologies utilisées

* [Express.js](http://expressjs.com/)
* [MySQL](https://www.mysql.com/)
* [Node.js](https://nodejs.org/en/)


## Estimation de la situation & Testons ensemble CC.
### -> Route d'inscription
- Utilisation de transactions pour garantir l'intégrité des données
- Meilleure gestion des erreurs et des exceptions (pour pas que ca crache n'importe comment tu vois?)
- Validation améliorée (tu l'avais deja fait)

*Un exemple de comment tu peux tester tous ca*
```js
POST http://localhost:3000/inscription
Content-Type: application/json

{
  "nom": "USS Franck",
  "emailCompte": "franckmekoulou.dev@hotmail.com",
  "mdpCompte": "Uss12345678!",
  "telephone": "0237651679911",
  "typeCompte": "particulier"
}
```
a mettre dans un postman ou un thunder client
j'estime a 95% de confiance que ca marche.

### -> Route de connexion
Avec un peu de documentation Armanda, nous pouvons faire ceci:

- Jointure optimisée pour récupérer toutes les informations en une seule requête (avec un email, on peut avoir aussi le compte assoicier, pro ou particulier)

*Un exemple de comment tu peux tester tous ca*
```js
POST http://localhost:3000/connexion
Content-Type: application/json

{
  "emailCompte": "jean@example.com",
  "mdpCompte": "Test123!"
}
```
a mettre dans un postman ou un thunder client
j'estime a 95% egalement de confiance que ca marche.

### -> La recherche de logements (avec des filtres)
Nous avons deux facon d'apres toi de rechercher, d'apres ce que tu m'a dis:
- Deux endpoints distincts pour la recherche simple et avancée
- Paramètres de recherche flexibles (tes filtres)

#### Exemple de recherche simple
```js
GET http://localhost:3000/rechercheLogement?quartier=CentreVille
```
*seule le tag du quariter est cibler.*

#### Exemple de recherche avancer
```js
GET http://localhost:3000/rechercheLogementAvancee?ville=Nkolbisson&prixMin=100000&prixMax=300000&type=appartement
```
*seule le tag du quariter est cibler. Note que j'ai renommer le endpoints pour que ca soit plus lisible.*

Sur a 80-85% de confiance que ca marche.

## -> La deconnexion
C'est sur a 100% que cela marche 
```js
POST http://localhost:3000/deconnexion
```

### -> Niveau SQL.
Pour que ca marche il faut que tu es cree une nouvelle base de donnes, que tu configure la connexion dans ce backend et que tu cree les tables suivants (compliqur a faire, j'ai demander a une IA de le faire, je t'encourage le faire souvent, Armanda)

```sql
CREATE TABLE compte (
  idCompte VARCHAR(36) PRIMARY KEY,
  emailCompte VARCHAR(255) UNIQUE NOT NULL,
  mdpCompte VARCHAR(255) NOT NULL,
  typeCompte ENUM('particulier', 'agent') NOT NULL
);

CREATE TABLE particulier (
  id VARCHAR(36) PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  FOREIGN KEY (id) REFERENCES compte(idCompte)
);

CREATE TABLE agent (
  id VARCHAR(36) PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  cniAgent VARCHAR(20) NOT NULL,
  villeAgent VARCHAR(100) NOT NULL,
  businessRegistrationNumber VARCHAR(50) NOT NULL,
  FOREIGN KEY (id) REFERENCES compte(idCompte)
);

CREATE TABLE propriete (
  id INT AUTO_INCREMENT PRIMARY KEY,
  libellePropriete VARCHAR(255) NOT NULL,
  typePropriete VARCHAR(50) NOT NULL,
  prixPropriete DECIMAL(10, 2) NOT NULL,
  quartierPropriete VARCHAR(100) NOT NULL,
  villePropriete VARCHAR(100) NOT NULL,
  superficiePropriete INT,
  etatPropriete VARCHAR(50),
  statutPropriete VARCHAR(50),
  imagePropriete TEXT
);
```

### *J'espere que ca t'aider et diminuer ton stress*
#### USS.
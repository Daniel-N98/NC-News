# NC-News
### Link: [https://nc-news-daniel.herokuapp.com/api]
<br/>

## Summary
NC-News is a backend API built with Nodejs, and postgres, and was created as part of the Northcoders course curriculum.
The API is built for the purpose of accessing application data programmatically.

---

## Requirements
  - Node.js: ```node -v | v18.4.0```<br/>
  - postgres: ```psql -v | 8.7.3```
---
## Getting started
To get started using this api, please complete the following
  1. Clone this repository
  2. Install project dependencies with 'npm install'
  3. Add the following files, with the corrosponding line<br/>
    - *.env.test : PGDATABASE=nc_news_test*<br/>
    - *.env.development : PGDATABASE=nc_news*
  4. Run the database setup script ```npm run setup-dbs```
  5. Seed the database ```npm run seed```
  6. Run the tests ```npm t```
---
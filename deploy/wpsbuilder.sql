CREATE ROLE wpsbuilder WITH SUPERUSER LOGIN REPLICATION CREATEDB CREATEROLE PASSWORD '######';
CREATE DATABASE wpsbuilder OWNER wpsbuilder;
\c wpsbuilder
CREATE TABLE models (  
  model_id serial NOT NULL,
  data jsonb
);


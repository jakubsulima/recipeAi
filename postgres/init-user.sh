#!/bin/bash
set -e

# Exit if POSTGRES_USER or POSTGRES_PASSWORD are not set
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ]; then
  echo "Error: POSTGRES_USER and POSTGRES_PASSWORD environment variables are not set."
  exit 1
fi

# Create the user with the provided credentials
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${POSTGRES_USER}') THEN 
            CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';
            ALTER USER ${POSTGRES_USER} CREATEDB;   
            GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
            GRANT ALL ON ALL TABLES IN SCHEMA public TO ${POSTGRES_USER};
            GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ${POSTGRES_USER};
            GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO ${POSTGRES_USER};
        END IF;
    END
    \$\$;
EOSQL

echo "Admin user '${POSTGRES_USER}' configured successfully."

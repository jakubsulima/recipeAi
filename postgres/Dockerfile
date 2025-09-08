FROM postgres:13-alpine

# Copy init script
COPY init-user.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init-user.sh

# Expose the PostgreSQL port
EXPOSE 5432

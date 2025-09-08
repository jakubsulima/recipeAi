FROM postgres:13-alpine

# Set a subdirectory for the data to avoid conflicts with "lost+found"
# on some volume mounts.
ENV PGDATA=/var/lib/postgresql/data/pgdata

# Copy init script
COPY init-user.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init-user.sh

# Expose the PostgreSQL port
EXPOSE 5432

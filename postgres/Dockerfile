FROM postgres:16-alpine

# Set a subdirectory for the data to avoid conflicts with "lost+found"
# on some volume mounts.
ENV PGDATA=/var/lib/postgresql/data/pgdata

# Copy init script with execute permission baked in
COPY --chmod=755 init-user.sh /docker-entrypoint-initdb.d/

# Run as the postgres user at runtime.
USER postgres

# Expose the PostgreSQL port
EXPOSE 5432

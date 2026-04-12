FROM postgres:17-alpine

# Set a subdirectory for the data to avoid conflicts with "lost+found"
# on some volume mounts.
ENV PGDATA=/var/lib/postgresql/data/pgdata

# Remove gosu binary to avoid inherited Go stdlib CVE findings in base image.
# This image already runs as non-root postgres, so gosu is not required.
RUN rm -f /usr/local/bin/gosu

# Copy init script with execute permission baked in
COPY --chmod=755 init-user.sh /docker-entrypoint-initdb.d/

# Run as the postgres user at runtime.
USER postgres

# Expose the PostgreSQL port
EXPOSE 5432

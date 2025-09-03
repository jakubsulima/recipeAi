FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_DB=recipeai
ENV POSTGRES_USER=recipe_user

# Create the database user and database
RUN mkdir -p /docker-entrypoint-initdb.d

# Expose the PostgreSQL port
EXPOSE 5432

# Use the default postgres entrypoint
CMD ["postgres"]

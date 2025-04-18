#!/bin/sh

# Run migrations
echo "Applying database migrations..."
python manage.py migrate

# Collect static files
# echo "Collecting static files..."
# python manage.py collectstatic --noinput

# Now execute the CMD
echo "Starting server..."
exec "$@"
